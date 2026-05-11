"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { StockRow } from "./StockRow";
import { AddTickerModal } from "./AddTickerModal";
import { StockRowSkeleton } from "../ui";
import type { Quote, ChartPoint } from "@/types/stock";

interface WatchlistPanelProps {
    tickers: string[];
    quotes: Record<string, Quote>;
    charts: Record<string, ChartPoint[]>;
    profiles: Record<string, { sector?: string; logo?: string }>;
    loading: boolean;
    onAdd: (ticker: string) => void;
    onRemove: (ticker: string) => void;
    hasTicker: (ticker: string) => boolean;
    lastUpdated?: string;
    onRefresh: () => void;
}

export function WatchlistPanel({
    tickers, quotes, charts, profiles,
    loading, onAdd, onRemove, hasTicker,
    lastUpdated, onRefresh,
}: WatchlistPanelProps) {
    const [showAdd, setShowAdd] = useState(false);
    const pathName = usePathname();

    const totalChange = tickers.reduce((sum, t) => sum + (quotes[t]?.percentChange ?? 0), 0);
    const averageChange = tickers.length > 0 ? totalChange / tickers.length : 0;
    const up = averageChange >= 0;
    const gainers = tickers.filter(t => (quotes[t]?.percentChange ?? 0) > 0).length;
    const losers  = tickers.filter(t => (quotes[t]?.percentChange ?? 0) < 0).length;

    return (
        <>
            <aside className="w-full md:w-[272px] flex-shrink-0 flex flex-col border-r border-tp-border bg-tp-surf h-full">

                {/* HEADER */}
                <div className="border-b border-tp-border">
                    <div className="px-4 pt-4 pb-2 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-tp-accent/10 border border-tp-accent/25 flex items-center justify-center flex-shrink-0">
                            <svg width="16" height="16" viewBox="0 0 16 16">
                                <polyline points="1,12 4.5,7 8,10 12,3 15,7"
                                    fill="none" stroke="#00e68e" strokeWidth="1.8"
                                    strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <div className="font-mono text-[13px] font-bold text-tp-primary tracking-[0.06em]">TECHPULSE</div>
                            <div className="text-[10px] text-tp-muted">Tech Stock Dashboard</div>
                        </div>
                        <button onClick={onRefresh} title="Refresh"
                            className={`text-tp-muted hover:text-tp-sec p-2 rounded-lg hover:bg-white/[0.04] active:scale-95 text-base transition-colors ${loading ? "animate-spin" : ""}`}>
                            ↻
                        </button>
                    </div>

                    <div className="px-4 pb-3 flex items-end justify-between">
                        <div>
                            <div className="text-[9px] text-tp-muted uppercase tracking-widest mb-0.5">Avg Today</div>
                            <div className={"font-mono text-xl font-bold leading-none " + (up ? "text-tp-accent" : "text-tp-red")}>
                                {up ? "+" : ""}{averageChange.toFixed(2)}%
                            </div>
                            {tickers.length > 0 && (
                                <div className="flex items-center gap-2 mt-1 text-[10px] font-mono">
                                    <span className="text-tp-accent">▲ {gainers} up</span>
                                    <span className="text-tp-muted">·</span>
                                    <span className="text-tp-red">▼ {losers} down</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-tp-accent animate-pulse" />
                            <span className="text-[9px] text-tp-muted font-mono">{lastUpdated ?? "Live"}</span>
                        </div>
                    </div>
                </div>

                {/* LISTA FEJLÉC */}
                <div className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-[9px] text-tp-muted uppercase tracking-[0.14em] font-semibold">Watchlist</span>
                    <span className="text-[9px] text-tp-muted font-mono">{tickers.length}</span>
                </div>

                {/* SOROK */}
                <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-tp-border/30">
                    {loading && tickers.length === 0 ? (
                        Array.from({ length: 6 }).map((_, i) => <StockRowSkeleton key={i} />)
                    ) : tickers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-center px-6 gap-2">
                            <div className="text-3xl">📈</div>
                            <p className="text-tp-muted text-xs font-mono">Your watchlist is empty</p>
                            <p className="text-tp-muted text-[10px]">Add tickers below</p>
                        </div>
                    ) : (
                        tickers.map((ticker) => (
                            <StockRow
                                key={ticker}
                                ticker={ticker}
                                quote={quotes[ticker] ?? null}
                                chart={charts[ticker] ?? []}
                                logo={profiles[ticker]?.logo}
                                sector={profiles[ticker]?.sector}
                                active={pathName === "/stock/" + ticker}
                                onRemove={onRemove}
                            />
                        ))
                    )}
                </div>

                {/* BOTTOM BAR */}
                <div className="p-4 border-t border-tp-border">
                    <button onClick={() => setShowAdd(true)}
                        className="w-full py-3.5 md:py-2.5 rounded-xl border border-tp-accent/30 text-tp-accent font-mono font-bold tracking-wide bg-tp-accent/[0.06] hover:bg-tp-accent/[0.12] active:scale-[0.98] transition-all text-sm md:text-xs">
                        + Add Ticker
                    </button>
                </div>
            </aside>

            {showAdd && (
                <AddTickerModal onAdd={onAdd} onClose={() => setShowAdd(false)} hasTicker={hasTicker} />
            )}
        </>
    );
}