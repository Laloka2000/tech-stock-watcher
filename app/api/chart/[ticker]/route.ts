/**
 * GET /api/chart/[ticker]?range=5Y
 * 
 * Returns daily OHLCV data for a ticker
 * Source: Alpha Vantage (25 req/day free) <- cache aggressively
 * Cache: server-side in-memory 24h + Next.js revalidate 86400s
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchDailyChart } from "@/lib/api/alphavantage";
import { cache } from "@/lib/cache";
import type { ApiChartResponse, ChartRange } from "@/types/stock";

export const runTime = "nodejs";
export const dynamic = "force-dynamic";

const validRanges: ChartRange[] = ["1W", "1M", "3M", "6M", "1Y", "5Y"];

export async function GET(req: NextRequest, {params}: {params: {ticker: string}}){
    const ticker = params.ticker.toUpperCase();
    const rangeParameter = (req.nextUrl.searchParams.get("range") ?? '5Y').toUpperCase() as ChartRange;
    const range: ChartRange = validRanges.includes(rangeParameter) ? rangeParameter : "5Y";

    const cacheKey = `chart:${ticker}:${range}`;
    const TTL = 86400;

    try {
        const points = await cache.getOrFetch(
            cacheKey,
            () => fetchDailyChart(ticker, range),
            TTL
        );

        const body: ApiChartResponse = {
            ticker,
            range, 
            points, 
            fetchedAt: new Date().toISOString(),
        };

        return NextResponse.json(body, {
            headers: {
                "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
            },
        }); 
    } catch (error) {
        console.error(`[/api/chart/${ticker}]`, error);
        return NextResponse.json(
            {error: "Failed to fetch chart data", detail: String(error)},
            {status: 502}
        );
    }
}