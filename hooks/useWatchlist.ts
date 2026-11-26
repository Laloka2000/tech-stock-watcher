"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import useSWR from "swr";
import type { WatchlistEntry } from "@/types/stock";
import { normalizeTicker } from "@/lib/validation";
import { useUser } from "./useUser";

const storage_key = "tp_watchlist";

const default_tickers: string[] = [
    "NVDA", "GOOGL", "MSFT", "AAPL", "META", "AMZN",
];

function readStorage(): WatchlistEntry[] | null
{
    try
    {
        const raw = localStorage.getItem(storage_key);
        if (!raw) return null;
        return JSON.parse(raw) as WatchlistEntry[];
    } catch
    {
        return null;
    }
}

function writeStorage(entries: WatchlistEntry[]): void
{
    try
    {
        localStorage.setItem(storage_key, JSON.stringify(entries));
    } catch
    {
        /* quota exceeded or SSR - silently skip */
    }
}

type WatchlistResponse = { entries: WatchlistEntry[] };

export type WatchlistResult = { ok: true } | { ok: false; error: string };

async function fetchWatchlist([url]: [string, string]): Promise<WatchlistResponse>
{
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}


async function errorMessage(res: Response): Promise<string>
{
    try
    {
        const body = await res.json();
        return typeof body?.error === "string" ? body.error : `HTTP ${res.status}`;
    } catch
    {
        return `HTTP ${res.status}`;
    }
}


export function useWatchlist()
{
    const { user, loading: userLoading } = useUser();
    const userId = user?.id ?? null;

    // Guest mode: localStorage (the old logic) 
    const [localEntries, setLocalEntries] = useState<WatchlistEntry[]>([]);
    const [localHydrated, setLocalHydrated] = useState(false);

    // Hydrate from localStorage aftwe mount (avoids SSR mishmatch)
    useEffect(() =>
    {
        const stored = readStorage();
        // An empty array is a deliberately emptied watchlist - only seed when nothing is stored
        if (stored)
        {
            setLocalEntries(stored);
        } else
        {
            //seed defaults on first visit
            const defaults: WatchlistEntry[] = default_tickers.map(ticker => ({
                ticker,
                addedAt: new Date().toISOString(),
            }));
            setLocalEntries(defaults);
            writeStorage(defaults);
        }
        setLocalHydrated(true);
    }, []);

    // Persist whenever entries change (after hydration)
    useEffect(() =>
    {
        if (localHydrated) writeStorage(localEntries);
    }, [localEntries, localHydrated]);

    // Logged-in mode: DB via /api/watchlist 
    const { data, error, mutate } = useSWR<WatchlistResponse, Error, [string, string] | null>(
        userId ? ["api/watchlist", userId] : null,
        fetchWatchlist,
    );

    const entries = useMemo(
        () => (userId ? data?.entries ?? [] : localEntries),
        [userId, data, localEntries]
    );

    const hydrated = !userLoading && (userId ? data !== undefined || error !== undefined : localHydrated);
    const tickers = entries.map((e) => e.ticker);

    const addTickers = useCallback(async (input: string): Promise<WatchlistResult> =>
    {
        const ticker = normalizeTicker(input);
        if (!ticker) return { ok: false, error: "Invalid ticker" };

        if (!userId)
        {
            setLocalEntries((prev) =>
                prev.some((e) => e.ticker === ticker)
                    ? prev
                    : [...prev, { ticker, addedAt: new Date().toISOString() }]
            );
            return { ok: true };
        }

        try
        {
            await mutate(
                async (current) =>
                {
                    const res = await fetch("/api/watchlist", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ticker }),
                    });
                    if (!res.ok) throw new Error(await errorMessage(res));

                    const { entry } = (await res.json()) as { entry: WatchlistEntry };
                    const rest = (current?.entries ?? []).filter((e) => e.ticker !== ticker);
                    return { entries: [...rest, entry] };
                },
                {
                    optimisticData: (current) => ({
                        entries: [
                            ...(current?.entries ?? []),
                            { ticker, addedAt: new Date().toISOString() },
                        ],
                    }),
                    rollbackOnError: true,
                    revalidate: false,
                }
            );
            return { ok: true };
        } catch (err)
        {
            return { ok: false, error: err instanceof Error ? err.message : "Failed to add ticker" };
        }
    }, [userId, mutate]);


    const removeTickers = useCallback(async (input: string): Promise<WatchlistResult> =>
    {
        const ticker = normalizeTicker(input);
        if (!ticker) return { ok: false, error: "Invalid ticker" };

        if (!userId)
        {
            setLocalEntries((prev) => prev.filter((e) => e.ticker !== ticker));
            return { ok: true };
        }

        try
        {
            await mutate(
                async (current) =>
                {
                    const res = await fetch(
                        `/api/watchlist?ticker=${encodeURIComponent(ticker)}`,
                        { method: "DELETE" }
                    );

                    if (!res.ok && res.status !== 404) throw new Error(await errorMessage(res));

                    return { entries: (current?.entries ?? []).filter((e) => e.ticker !== ticker) };
                },
                {
                    optimisticData: (current) => ({
                        entries: (current?.entries ?? []).filter((e) => e.ticker !== ticker),
                    }),
                    rollbackOnError: true,
                    revalidate: false,
                }
            );
            return { ok: true };
        } catch (err)
        {
            return { ok: false, error: err instanceof Error ? err.message : "Failed to remove ticker" };
        }
    }, [userId, mutate]);

    const hasTickers = useCallback(
        (ticker: string) => entries.some((e) => e.ticker === ticker.toUpperCase()),
        [entries]
    );

    return { tickers, entries, hydrated, addTickers, removeTickers, hasTickers };
}