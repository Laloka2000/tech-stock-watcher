"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { StockRow } from "./StockRow";
import { AddTickerModal } from "./AddTickerModal";
import { StockRowSkeleton } from "../ui";
import { AuthStatus } from "../auth/AuthStatus";
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
            <aside className="w-full md:w-[288px] flex-shrink-0 flex flex-col border-r border-tp-line bg-tp-surf h-full">

                {/* MASTHEAD */}
                <div className="border-b border-tp-line px-5 pt-5 pb-4">
                    <div className="flex items-center gap-2.5 mb-1">
                        <svg width="18" height="18" viewBox="0 0 16 16" className="flex-shrink-0">
                            <polyline points="1,12 4.5,7 8,10 12,3 15,7"
                                fill="none" stroke="#1F6F5C" strokeWidth="1.6"
                                strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="font-serif text-[19px] font-semibold text-tp-ink tracking-tight">TechPulse</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] text-tp-ink2">A private stock ledger</p>
                        <div className="flex items-center gap-3">
                            <div className="md:hidden">
                                <AuthStatus />
                            </div>
                            <button onClick={onRefresh} title="Refresh"
                                className={`text-tp-ink2 hover:text-tp-teal text-[11px] font-mono transition-colors ${loading ? "animate-spin inline-block" : ""}`}>
                                ↻
                            </button>
                        </div>
                    </div>
                </div>

                {/* SUMMARY */}
                <div className="border-b border-tp-line px-5 py-4 flex items-end justify-between">
                    <div>
                        <div className="text-[11px] text-tp-ink2 mb-0.5">Average today</div>
                        <div className={"font-mono text-2xl font-semibold leading-none " + (up ? "text-tp-teal" : "text-tp-rust")}>
                            {up ? "+" : ""}{averageChange.toFixed(2)}%
                        </div>
                        {tickers.length > 0 && (
                            <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono">
                                <span className="text-tp-teal">▲ {gainers}</span>
                                <span className="text-tp-ink3">/</span>
                                <span className="text-tp-rust">▼ {losers}</span>
                            </div>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="text-[11px] text-tp-ink2">{lastUpdated ?? "Live"}</div>
                    </div>
                </div>

                {/* LIST HEADER */}
                <div className="px-5 pt-3 pb-1.5 flex items-center justify-between">
                    <span className="text-[11px] text-tp-ink2">Watchlist</span>
                    <span className="text-[11px] text-tp-ink2 font-mono">{tickers.length}</span>
                </div>

                {/* ROWS */}
                <div className="flex-1 overflow-y-auto overscroll-contain">
                    {loading && tickers.length === 0 ? (
                        Array.from({ length: 6 }).map((_, i) => <StockRowSkeleton key={i} />)
                    ) : tickers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-center px-6 gap-1.5">
                            <p className="text-tp-ink font-serif text-base">Nothing on watch yet</p>
                            <p className="text-tp-ink2 text-xs">Add a ticker below to start tracking it</p>
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
                <div className="p-4 border-t border-tp-line">
                    <button onClick={() => setShowAdd(true)}
                        className="w-full py-3 md:py-2.5 rounded-sm border border-tp-teal/40 text-tp-teal font-mono font-semibold bg-tp-teal/[0.05] hover:bg-tp-teal/[0.1] active:scale-[0.99] transition-all text-sm md:text-xs">
                        + Add ticker
                    </button>
                </div>
            </aside>

            {showAdd && (
                <AddTickerModal onAdd={onAdd} onClose={() => setShowAdd(false)} hasTicker={hasTicker} />
            )}
        </>
    );
}
