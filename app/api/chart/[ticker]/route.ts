/**
 * GET /api/chart/[ticker]?range=1M
 *
 * Returns daily OHLCV data for a ticker.
 * Source: Yahoo finance — csak compact (1W/1M/3M)
 * Cache: server-side in-memory 24h
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchDailyChart } from "@/lib/api/yahoo";
import { cache } from "@/lib/cache";
import type { ApiChartResponse, ChartRange } from "@/types/stock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const validRanges: ChartRange[] = ["1W", "1M", "3M"];

export async function GET(
    req: NextRequest,
    { params }: { params: { ticker: string } }
) {
    const ticker = params.ticker.toUpperCase();
    const rangeParam = (req.nextUrl.searchParams.get("range") ?? "1M").toUpperCase() as ChartRange;
    const range: ChartRange = validRanges.includes(rangeParam) ? rangeParam : "1M";

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
    } catch (err) {
        console.error(`[/api/chart/${ticker}]`, err);
        return NextResponse.json(
            { error: "Failed to fetch chart data", detail: String(err) },
            { status: 502 }
        );
    }
}