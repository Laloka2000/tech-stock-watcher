/**
 * GET /api/profile/[ticker]
 *
 * Returns company profile + fundamentals.
 * Source: Finnhub profile + Finnhub /stock/metric (FMP-t kivettük, 403-at adott)
 * Cache: server-side in-memory 24h
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchProfile, fetchMetrics } from "@/lib/api/finnhub";
import { cache } from "@/lib/cache";
import type { ApiProfileResponse } from "@/types/stock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TTL = 86400;

export async function GET(
    _req: NextRequest,
    { params }: { params: { ticker: string } }
) {
    const ticker = params.ticker.toUpperCase();
    const cacheKey = `profile:${ticker}`;

    try {
        const data = await cache.getOrFetch<{
            profile: ApiProfileResponse["profile"];
            fundamentals: ApiProfileResponse["fundamentals"];
        }>(
            cacheKey,
            async () => {
                const [profile, metrics] = await Promise.all([
                    fetchProfile(ticker),
                    fetchMetrics(ticker),
                ]);

                const fundamentals: ApiProfileResponse["fundamentals"] = {
                    ticker,
                    marketCap: metrics.marketCapitalization
                        ? metrics.marketCapitalization * 1e6
                        : profile.marketCap,
                    pe: metrics.peBasicExclExtraTTM ?? null,
                    eps: metrics.epsBasicExclExtraItemsAnnual ?? null,
                    beta: metrics.beta ?? null,
                    w52High: metrics["52WeekHigh"] ?? null,
                    w52Low: metrics["52WeekLow"] ?? null,
                    averageVolume: null,
                    divYield: metrics.dividendYieldIndicatedAnnual ?? null,
                    roe: metrics.roeTTM ?? null,
                    debtToEq: metrics["totalDebt/totalEquityAnnual"] ?? null,
                    revenueGrowYoY: metrics.revenueGrowthTTMYoy ?? null,
                };

                return { profile, fundamentals };
            },
            TTL
        );

        const body: ApiProfileResponse = {
            ticker,
            profile: data.profile,
            fundamentals: data.fundamentals,
            fetchedAt: new Date().toISOString(),
        };

        return NextResponse.json(body, {
            headers: {
                "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
            },
        });
    } catch (err) {
        console.error(`[/api/profile/${ticker}]`, err);
        return NextResponse.json(
            { error: "Failed to fetch profile", detail: String(err) },
            { status: 502 }
        );
    }
}