/**
 * POST /api/watchlist/import  { tickers: string[] }
 *
 * One-time transfer: guest watchlist (from localStorage) → DB.
 * Writes to the DB only if the user's list in the DB is currently EMPTY.
 */

import { NextRequest } from "next/server";
import { json, getAuthedClient } from "@/lib/api/route-utils";
import { normalizeTicker, WATCHLIST_LIMIT } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


// Guardrail on the input size
const MAX_INPUT = 100;

export async function POST(req: NextRequest)
{
    const { supabase, user } = await getAuthedClient();
    if (!user) return json({ error: "Not authenticated" }, 401);

    let body: unknown;
    try
    {
        body = await req.json();
    } catch
    {
        return json({ error: "Invalid JSON body" }, 400);
    }

    const raw = (body as { tickers?: unknown } | null)?.tickers;
    if (!Array.isArray(raw)) return json({ error: "tickers must be an array" }, 400);
    if (raw.length > MAX_INPUT) return json({ error: "Too many tickers" }, 400);

    // Cleaning: normalize -> remove invalid entries -> remove duplicates -> max 20
    const tickers = Array.from(
        new Set(
            raw
                .map((t) => normalizeTicker(t))
                .filter((t): t is string => t !== null)
        )
    ).slice(0, WATCHLIST_LIMIT);

    if (tickers.length === 0) return json({ imported: 0 });

    // We only copy into an empty DB list
    const { count, error: countError } = await supabase
        .from("watchlist_items")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);


    if (countError)
    {
        console.error("[POST /api/watchlist/import] count", countError);
        return json({ error: "Failed to import watchlist" }, 500);
    }
    if ((count ?? 0) > 0) return json({ imported: 0, reason: "not_empty" });

    // Preserving order: each row is 1 ms "later"
    const base = Date.now();
    const rows = tickers.map((ticker, i) => ({
        ticker,
        added_at: new Date(base + i).toISOString(),
    }));

    // Egyetlen insert = egyetlen tranzakció
    const { data, error } = await supabase
        .from("watchlist_items")
        .insert(rows)
        .select("ticker");

    if (error)
    {
        // Another tab just finished copying -> the goal has already been met
        if (error.code === "23505") return json({ imported: 0, reason: "not_empty" });
        console.error("[POST /api/watchlist/import] insert", error);
        return json({ error: "Failed to import watchlist" }, 500);
    }

    return json({ imported: data.length }, 201);
}