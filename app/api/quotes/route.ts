/**
 * GET /api/quotes?symbols=NVDA,MSFT,AAPL
 *
 * Real-time quotes minden kért tickerhez.
 * Source: Finnhub (60 req/min free)
 * Cache: server-side in-memory 60s
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchQuotes } from "@/lib/api/finnhub";
import { cache } from "@/lib/cache";
import type { ApiQoutesResponse } from "@/types/stock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const symbolsParam = req.nextUrl.searchParams.get("symbols") ?? "";
    const tickers = symbolsParam
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

    if (tickers.length === 0) {
        return NextResponse.json({ error: "symbols param required" }, { status: 400 });
    }

    if (tickers.length > 20) {
        return NextResponse.json({ error: "max 20 symbols per request" }, { status: 400 });
    }

    const cacheKey = `quotes:${tickers.sort().join(",")}`;

    try {
        const quotes = await cache.getOrFetch(
            cacheKey,
            () => fetchQuotes(tickers),
            60
        );

        const body: ApiQoutesResponse = {
            quotes,
            fetchedAt: new Date().toISOString(),
        };

        return NextResponse.json(body, {
            headers: {
                "Cache-Control": "public, max-age=60, stale-while-revalidate=30",
            },
        });
    } catch (err) {
        console.error("[/api/quotes]", err);
        return NextResponse.json(
            { error: "Failed to fetch quotes", detail: String(err) },
            { status: 502 }
        );
    }
}