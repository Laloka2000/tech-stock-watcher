"use client";

import { useState, useEffect, useCallback } from "react";
import type { WatchlistEntry } from "@/types/stock";

const storage_key = "tp_watchlist";

const default_tickers: string[] = [
    "NVDA", "GOOGL", "MSFT", "AAPL", "META", "AMD", "TSLA", "AMZN", "NFLX", "TSM"
];

function readStorage(): WatchlistEntry[] {
    try {
        const raw = localStorage.getItem(storage_key);
        if (!raw) return null as unknown as WatchlistEntry[];
        return JSON.parse(raw) as WatchlistEntry[];
    } catch {
        return null as unknown as WatchlistEntry[];
    }
}

function writeStorage(entries: WatchlistEntry[]): void {
    try {
        localStorage.setItem(storage_key, JSON.stringify(entries));
    } catch {
        /* quota exceeded or SSR - silently skip */
    }
}

export function useWatchlist() {
    const [entries, setEntries] = useState<WatchlistEntry[]>([]);
    const [hydrated, setHydrated] = useState(false);

    // Hydrate from localStorage aftwe mount (avoids SSR mishmatch)
    useEffect(() => {
        const storedInfo = readStorage();
        if (storedInfo && storedInfo.length > 0){
            setEntries(storedInfo);
        } else {
            //seed defaults on first visit
            const defaults: WatchlistEntry[] = default_tickers.map(ticker => ({
                ticker, 
                addedAt: new Date().toISOString(),
            }));
            setEntries(defaults);
            writeStorage(defaults);
        }
        setHydrated(true);
    }, []);

    // Persist whenever entries change (after hydration)
    useEffect(() => {
        if (hydrated) writeStorage(entries);
    }, [entries, hydrated]);

    const tickers = entries.map((e) => e.ticker);

    const addTickers = useCallback((ticker: string) => {
        const t = ticker.toUpperCase().trim();
        if (!t) return;
        setEntries((prev) => {
            if (prev.some((e) => e.ticker === t)) return prev;
            return [...prev, { ticker: t, addedAt: new Date().toISOString() }];
        });
    }, []);

    const removeTickers = useCallback((ticker: string) => {
        setEntries((prev) => prev.filter((e) => e.ticker !== ticker));
    }, []);

    const reorderTickers = useCallback((from: number, to: number) => {
        setEntries((prev) => {
            const next = [...prev];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            return next;
        });
    }, []);
    
    const hasTickers = useCallback((ticker: string) => entries.some((e) => e.ticker === ticker.toUpperCase()), [entries]);

    return {tickers, entries, hydrated, addTickers, removeTickers, reorderTickers, hasTickers};
}