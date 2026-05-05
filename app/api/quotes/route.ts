/**
 * GET /api/qoutes?symbols=NVDA,MSFT,AAPL
 * 
 * Return real-time quotes for all requested tickers.
 * Source: Finnhub (60 req/min free)
 * Cache: server-side in-memory 60s Next.js revalidate 60s
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchQuotes } from "@/lib/api/finnhub";
import { cache } from "@/lib/cache";
import type { ApiQoutesResponse } from "@/types/stock";

export const runTime = "nodejs";

//Tell Next.js not to cache this route - we handle caching ourselves
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest){
    const symbolsParameter = req.nextUrl.searchParams.get("symbols") ?? "";
    const tickers = symbolsParameter.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);

    if (tickers.length === 0) {
        return NextResponse.json({error: "symbols param required"}, {status: 400});
    }

    if (tickers.length > 20) {
        return NextResponse.json({error: "max 20 symbols per request"}, {status: 400});
    }

    const cacheKey = `qoutes:${tickers.sort().join(",")}`;

    try {
        const quotes = await cache.getOrFetch(
            cacheKey,
            () => fetchQuotes(tickers),
            60 // 60-second TTL — balances freshness vs Finnhub rate limit
        );

        const body: ApiQoutesResponse = {
            quotes,
            fetchedAt: new Date().toISOString(),
        };

        return NextResponse.json(body, {
            // Let the PWA service worker / CDN also cahce for 60s
            headers: {
                "Cache-Control": "public, max-age=60, stale-while-revalidate=30"
            },
        });
    } catch (error) {
        console.error(["[/api/qoutes]", error]);
        return NextResponse.json(
            {error: "Failed to fetch quotes", detail: String(error)},
            {status: 502}
        );
    }
}