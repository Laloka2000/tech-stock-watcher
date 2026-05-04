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
    profiles: Record<string, {sector?: string; logo?: string}>;
    loading: boolean;
    onAdd: (ticker: string) => void;
    onRemove: (ticker: string) => void;
    hasTicker: (ticker: string) => boolean;
    lastUpdated?: string;
    onRefresh: () => void;
}

export function WatchlistPanel({tickers, quotes, charts, profiles, loading, onAdd, onRemove, hasTicker, lastUpdated, onRefresh}: WatchlistPanelProps) {
    const [showAdd, setShowAdd] = useState(false);
    const pathName = usePathname();

    // Derive portfolio summary
    const totalChange = tickers.reduce((sum, t) => {
        const quote = quotes[t];
        return sum + (quote ? quote.percentChange : 0);
    }, 0);
    const averageChange = tickers.length > 0 ? totalChange / tickers.length : 0;

    return (
        <>
            {/** Sidebar */}
            <aside className="w-[272pc] flex-shrink-0 flex flex-col border-r border-tp-border bg-tp-surf">
                {/** Header */}
                <div className="px-5 py-5 border-b border-tp-border flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-tp-accent/10 border border-tp-accent/25 flex items-center justify-center flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 16 16">
                            <polyline points="1,12 4.5,7 8,10 12,3 15,7" fill="none" stroke="#00e68e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div>
                        <div className="font-mono text-[13px] font-bold text-tp-primary tracking-[0.06em]">TECHPULSE</div>
                        <div className="text-[10px] text-tp-muted">Tech Stock Dashboard</div>
                    </div>
                </div>

                {/** Portfolio bar */}
                <div className="px-5 py-3 border-b border-tp-border flex items-center justify-between">
                    <div>
                        <div className="text-[10px] text-tp-muted uppercase tracking-widest mb-1">Avg Today</div>
                        <div className={`font-mono text-sm font-bold ${averageChange >= 0 ? "text-tp-accent" : "text-tp-red"}`}>
                            {averageChange >= 0 ? "+" : ""}{averageChange.toFixed(2)}%
                        </div>
                    </div>
                    <button
                        onClick={onRefresh}
                        title="Refresh quotes"
                        className={`text-tp-muted hover:text-tp-sec transition-colors text-sm p-1.5 rounded-lg hover:bg-white/[0.04] ${loading ? "animate-pulse" : ""}`}
                    >
                        ↻
                    </button>
                </div>

                {/** List header */}
                <div className="px-5 py-2.5 flex items-center justify-between">
                    <span className="text-[10px] text-tp-muted uppercase tracking-[0.12em] font-semmibold">Watchlist</span>
                    <span className="text-[10px] text-tp-muted font-mono">{tickers.length}</span>
                </div>

                {/** Stock rows */}
                <div className="flex-1 overflow-y-auto">
                    {loading && tickers.length === 0 ? (
                        Array.from({ length: 8 }).map((_, i) => <StockRowSkeleton key={i} />)
                    ) : (
                        tickers.map((ticker) => (
                            <StockRow
                                key={ticker}
                                ticker={ticker}
                                quote={quotes[ticker] ?? null}
                                chart={charts[ticker] ?? []}
                                logo={profiles[ticker]?.logo}
                                sector={profiles[ticker]?.sector}
                                active={pathName === `/stock/${ticker}`}
                                onRemove={onRemove}
                            />
                        ))
                    )}
                </div>
                
                {/** Add ticker */}
                <div className="p-4 border-t border-tp-border">
                    <button
                        onClick={() => setShowAdd(true)}
                        className="w-full py-2.5 rounded-xl border border-tp-border text-tp-muted text-xs font-mono font-bold tracking-wide hover:border-tp-accent/40 hover:text-tp-accent hover:bg-tp-accent/[0.05] transition-all"
                    >
                        + Add Ticker
                    </button>
                </div>
                
                {/** Footer */}
                <div className="px-5 pb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-tp-accent animate-pulse shadow-accent-glow" />
                    <span className="text-[10px] text-tp-muted font-mono">
                        {lastUpdated ? `Updated ${lastUpdated}` : "Connecting..."}
                    </span>
                </div>
            </aside>

            {showAdd && (
                <AddTickerModal 
                    onAdd={onAdd}
                    onClose={() => setShowAdd(false)}
                    hasTicker={hasTicker}
                />
            )}
        </>
    );
}