"use client";

import useSWR from "swr";
import type { ApiQoutesResponse, ApiChartResponse, ApiProfileResponse, ChartRange, Quote } from "@/types/stock";
import { use } from "react";
import { profile } from "console";

const apiFetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
})

// Batch Quotes

/** Polls all quotes for a list of tickers every 60 seconds. 
 * Backed by Finnhub via /api/quotes.
 */
export function useQuotes(tickers: string[]) {
    const key = tickers.length > 0 ? `/api/quotes?symbols=${tickers.join(",")}` : null;
    
    const {data, error, isLoading, mutate} = useSWR<ApiQoutesResponse>(
        key, 
        apiFetcher, 
        {
            refreshInterval: 60_000,
            revalidateOnFocus: true,
            dedupingInterval: 30_000,
        }
    );

    return {
        qoutes: data?.quotes ?? {},
        fetchedAt: data?.fetchedAt,
        loading: isLoading, 
        error,
        refresh: mutate,
    };
}

/** Single qoute for a given ticker (derived from batch quotes) */
export function useQuote(ticker: string, quotes: Record<string, Quote>) {
    return quotes[ticker] ?? null;
}

// Chart
export function useChart(ticker: string | null, range: ChartRange = "1Y"){
    const key = ticker ? `/api/chart${ticker}?range=${range}` : null;

    const {data, error, isLoading} = useSWR<ApiChartResponse>(key, apiFetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 86_400_000,
    });

    return {
        points: data?.points ?? [],
        fetchedAt: data?.fetchedAt,
        loading: isLoading,
        error,
    };
}

// Profile + fundamentals
export function useProfile(ticker: string | null) {
    const key = ticker ? `/api/profile/${ticker}` : null;

    const {data, error, isLoading} = useSWR<ApiProfileResponse>(key, apiFetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 86_400_000,
    });

    return {
        profile: data?.profile ?? null,
        fundamentals: data?.fundamentals ?? null,
        fetchedAt: data?.fetchedAt,
        loading: isLoading,
        error,
    };
}