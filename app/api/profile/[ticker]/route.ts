/**
 * GET /api/profile/[ticker]
 * 
 * Returns company profile (Finnhub) + financial fundamentals (FMP).
 * Source: Finnhub profile + FMP ratios (both free tier)
 * Cache: server-side in-memory 24h 
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchProfile } from "@/lib/api/finnhub";
import { fetchFundamentals } from "@/lib/api/fmp";
import { cache } from "@/lib/cache";
import type { ApiProfileResponse } from "@/types/stock";

export const runTime = "nodejs";
export const dynamic = "force-dynamic";

const TTL = 86400;

export async function GET(_req: NextRequest,{params}: {params: {ticker: string}}) {
    const ticker = params.ticker.toUpperCase();
    const cacheKey = `profile:${ticker}`;

    try {
        const data = await cache.getOrFetch<{profile: ApiProfileResponse["profile"]; fundamentals: ApiProfileResponse["fundamentals"]}>(
            cacheKey,
            async () => {
                const [profile, fundamentals] = await Promise.all([
                    fetchProfile(ticker),
                    fetchFundamentals(ticker),
                ]);
                return {profile, fundamentals};
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

    } catch (error){
        console.error(`[/api/profile/${ticker}]`, error);
        return NextResponse.json(
            {error: "Failed to fetched profile", detail: String(error)},
            {status: 502}
        );
    }
}