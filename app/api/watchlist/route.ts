import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeTicker } from "@/lib/validation";
import type { WatchlistEntry } from "@/types/stock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "private, no-store" };

function json(body: unknown, status = 200)
{
    return NextResponse.json(body, { status, headers: NO_STORE });
}

async function getAuthedClient()
{
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return { supabase, user };
}

type WatchlistRow = { ticker: string; added_at: string };

function toEntry(row: WatchlistRow): WatchlistEntry
{
    return { ticker: row.ticker, addedAt: row.added_at };
}

export async function GET()
{
    const { supabase, user } = await getAuthedClient();
    if (!user) return json({ error: "Not authenticated" }, 401);

    const { data, error } = await supabase
        .from("watchlist_items")
        .select("ticker, added_at")
        .eq("user_id", user.id)
        .order("added_at", { ascending: true });

    if (error)
    {
        console.error("[GET /api/watchlist]", error);
        return json({ error: "Failed to load watchlist" }, 500);
    }

    return json({ entries: (data as WatchlistRow[]).map(toEntry) });
}

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

    const ticker = normalizeTicker((body as { ticker?: unknown } | null)?.ticker);
    if (!ticker) return json({ error: "Invalid ticker" }, 400);

    const { data, error } = await supabase
        .from("watchlist_items")
        .insert({ ticker })
        .select("ticker, added_at")
        .single();

    if (error)
    {
        if (error.code === "23505")
        {
            return json({ error: "Ticker already in watchlist" }, 409);
        }
        if (error.message === "watchlist_limit_reached")
        {
            return json({ error: "Watchlist limit reached (max 20)" }, 409);
        }
        console.error("[POST /api/watchlist]", error);
        return json({ error: "Failed to add ticker" }, 500);
    }

    return json({ entry: toEntry(data as WatchlistRow) }, 201);
}

export async function DELETE(req: NextRequest)
{
    const { supabase, user } = await getAuthedClient();
    if (!user) return json({ error: "Not authenticated" }, 401);

    const ticker = normalizeTicker(req.nextUrl.searchParams.get("ticker"));
    if (!ticker) return json({ error: "Invalid ticker" }, 400);

    const { data, error } = await supabase
        .from("watchlist_items")
        .delete()
        .eq("user_id", user.id)
        .eq("ticker", ticker)
        .select("ticker");

    if (error)
    {
        console.error("[DELETE /api/watchlist]", error);
        return json({ error: "Failed to remove ticker" }, 500);
    }
    if (data.length === 0)
    {
        return json({ error: "Ticker not in watchlist" }, 404);
    }

    return new NextResponse(null, { status: 204, headers: NO_STORE });
}