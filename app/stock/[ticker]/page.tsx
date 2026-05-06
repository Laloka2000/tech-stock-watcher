"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuotes } from "@/hooks/useStockData";
import { useChart, useProfile } from "@/hooks/useStockData";
import { useWatchlist } from "@/hooks/useWatchlist";
import { PriceChart } from "@/components/charts/PriceChart";
import { ChangeBadge, MetricCard, MetricCardSkeleton } from "@/components/ui";
import type { ChartRange } from "@/types/stock";

const ranges: ChartRange[] = ["1W", "1M", "3M", "6M", "1Y", "5Y"];

function fmtCap(n: number | null){
    if (!n) return "N/A";
    if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    return `${(n / 1e6).toFixed(0)}M`;
}

function fmtPct(n: number | null) {
    if (n === null) return "N/A";
    return `${(n * 100).toFixed(1)}%`;
}

function fmtNum(n: number | null, decimals = 2) {
    if (n == null) return "N/A";
    return n.toFixed(decimals);
}

function fmtPrice(n: number | null) {
    if (n == null) return "N/A";
    return `${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function StockPage({ params }: { params: { ticker: string} }){
    const ticker = params.ticker.toUpperCase();
    const [range, setRange] = useState<ChartRange>("5Y");

    const { tickers, addTickers, removeTickers, hasTickers, hydrated } = useWatchlist();
    const { quotes, loading: qLoading, refresh } = useQuotes(hydrated ? tickers : []);
    const { points, loading: chartLoading } = useChart(ticker, range);
    const { profile, fundamentals, loading: pLoading } = useProfile(ticker);

    const quote = quotes[ticker] ?? null;
    const up = (quote?.percentChange ?? 0) >= 0;
    const color = up ? "#00e68e" : "#ff5252";
    const inList = hasTickers(ticker);

    return (
        <div className="flex h-screen overflow-hidden bg-tp-bg">
            {/** Back nav + sidebar hint */}
            <aside className="w-[272px] flex-shrink-0 border-r border-tp-border bg-tp-surf flex flex-col">
                {/** Header */}
                <div className="px-5 py-5 border-b border-tp-border flex items-center gap-3">
                    <Link href="/" className="w-8 h-8 rounded-lg bg-tp-card border border-tp-border flex items-center justify-center text-tp-muted hover:text-tp-primary hover:border-tp-accent/40 transition-all">
                        ←
                    </Link>
                    <div className="font-mono text-[13px] font-bold text-tp-primary tracking-[0.06em]">TECHPULSE</div>
                    <div className="text-[10px] text-tp-muted">Stock Detail</div>
                </div>

                {/** Current Stock Summary */}
                <div className="px-5 py-5 border-b border-tp-border">
                    <div className="flex items-start gap-3 mb-4">
                        {profile?.logo ? (
                            <Image src={profile.logo} alt={ticker} width={40} height={40} className="rounded-xl" unoptimized />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-tp-border flex items-center justify-center font-mono text-xs font-bold text-tp-sec">
                                {ticker.slice(0, 2)}
                            </div>
                        )}
                        <div>
                            <div className="font-mono text-sm font-bold text-tp-primary">{ticker}</div>
                            <div className="text-[11px] text-tp-muted">{profile?.name ?? "Loading..."}</div>
                        </div>
                    </div>
                    {quote ? (
                        <>
                            <div className="font-mono text-3xl font-bold text-tp-primary leading-none mb-2">
                                {fmtPrice(quote.price)}
                            </div>
                            <ChangeBadge value={quote.percentChange} />
                            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono">
                                {[
                                ["Open",  fmtPrice(quote.open)],
                                ["Prev",  fmtPrice(quote.prevClose)],
                                ["High",  fmtPrice(quote.high)],
                                ["Low",   fmtPrice(quote.low)],
                                ].map(([l, v]) => (
                                <div key={l}>
                                    <span className="text-tp-muted">{l} </span>
                                    <span className="text-tp-sec">{v}</span>
                                </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-2">
                            {[40, 60, 80].map(w => (
                                <div key={w} className={`h-3 w-${w} bg-tp-border rounded animate-pulse`} />
                            ))}
                        </div>
                    )}
                </div>

                {/** Profile info */}
                <div className="px-5 py-4 flex-1">
                    {profile && (
                        <div className="space-y-2 text-[11px]">
                            {[
                                ["Sector", profile.sector],
                                ["Industry", profile.industry],
                                ["Exchange", profile.exchange],
                                ["Country", profile.country],
                            ].map(([l, v]) => (
                                <div key={l} className="flex justify-between">
                                    <span className="text-tp-muted">{l}</span>
                                    <span className="text-tp-sec font-medium">{v}</span>
                                </div>
                            ))}
                            {profile.websiteUrl && (
                                <a
                                    href={profile.websiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-tp-accent/70 hover:text-tp-accent transition-colors truncate mt-1"
                                >
                                    {profile.websiteUrl.replace(/^https?:\/\//, "")}
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {/** Watchlist toggle */}
                <div className="p-4 border-t border-tp-border">
                    <button
                        onClick={() => inList ? removeTickers(ticker) : addTickers(ticker)}
                        className={`w-full py-2.5 rounded-xl border text-xs font-mono font-bold tracking-wide transition-all ${
                            inList ? "border-tp-red/40 text-tp-red bg-tp-red/[0.05] hover:bg-tp-red/10" : "border-tp-accent/40 text-tp-accent bg-tp-accent/[0.05] hover:bg-tp-accent/10" 
                        }`}
                    >
                        {inList ? "- Remove from Watchlist" : "+ Add to Watchlist"}
                    </button>
                </div>
            </aside>
            
            {/** Main content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/** Header */}
                <header className="px-8 py-4 border-b border-tp-border bg-tp-surf flex items-center flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <h1 className="font-mono text-lg font-bold text-tp-primary">{ticker}</h1>
                        {profile && <span className="text-sm text-tp-muted">{profile.name}</span>}
                        {profile && (
                            <span className="text-[10px] text-tp-muted bg-tp-card border border-tp-border px-2 py-0.5 rounded">
                                {profile.sector}
                            </span>
                        )}
                    </div>
                    <div className="flex-1" />
                    <button
                        onClick={() => refresh()}
                        className="rext-tp-muted hover:text-tp-sec text-sm transition-colors px-2"
                        title="Refresh"
                    >
                        ↻
                    </button>
                </header>

                {/** Body */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {/** Chart + range selector */}
                    <div className="bg-tp-card border border-tp-border rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-2 h-2 rounded-full animate-pulse"
                                    style={{background: color, boxShadow: `0 0 8px ${color}`}}
                                />
                                <span className="text-[10px] text-tp-muted uppercase tracking-widest">Price History</span>
                            </div>
                            <div className="flex gap-1">
                                {ranges.map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setRange(r)}
                                        className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                                            range === r ? "text-tp-accent bg-tp-accent/15 border-tp-accent/40" : "text-tp-muted border border-transparent hover:border-tp-border"
                                        }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {chartLoading ? (
                            <div className="flex items-center justify-center h-[240px] text-tp-muted font-mono text-xs">
                                Loading chart data...
                            </div>
                        ) : (
                            <PriceChart points={points} range={range} color={color} />
                        )}

                        <div className="mt-3 text-[10px] text-tp-muted font-mono text-right">
                            Source: Alpha Vantage · Daily closes · Cached 24h
                        </div>
                    </div>

                    {/** Metrics row */}
                    <div className="flex gap-4">
                        {pLoading ? (
                            Array.from({length: 4}).map((_, i) => <MetricCardSkeleton key={i} />)
                        ) : (
                            <>
                                <MetricCard label="Market Cap" value={fmtCap(fundamentals?.marketCap ?? null)}/>
                                <MetricCard label="P/E Ratio" value={fmtNum(fundamentals?.pe ?? null)}/>
                                <MetricCard label="EPS (TTM)" value={fundamentals?.eps != null ? `$${fmtNum(fundamentals.eps)}` : "N/A"}/>
                                <MetricCard 
                                    label="5Y Change" 
                                    value={quote ? `${quote.percentChange >= 0 ? "+" : ""}${fmtNum(quote.percentChange)}%` : "N/A"}
                                    valueColor={up ? "text-tp-accent" : "text-tp-accent"}
                                />
                            </>
                        )}
                    </div>

                    {/** Fundamentals grid */}
                    {fundamentals && (
                        <div className="bg-tp-card border border-tp-border rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-5">
                                <div className="w-1.5 h-1.5 rounded-full" style={{background: color}} />
                                <span className="text-[10px] text-tp-muted uppercase tracking-widest">Fundamentals</span>
                                <span className="text-[10px] text-tp-muted ml-auto">Source: FMP</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-5 gap-x-8">
                                {[
                                    ["52W High", fmtPrice(fundamentals.w52High)],
                                    ["52W Low", fmtPrice(fundamentals.w52Low)],
                                    ["Beta", fmtNum(fundamentals.beta)],
                                    ["Average Volume", fundamentals.averageVolume ? `${(fundamentals.averageVolume / 1e6).toFixed(1)}M` : "N/A"],
                                    ["Div Yield", fmtPct(fundamentals.divYield)],
                                    ["ROE", fmtPct(fundamentals.roe)],
                                    ["Dept/Equity", fmtNum(fundamentals.debtToEq)],
                                    ["Rev Growth", fmtPct(fundamentals.revenueGrowYoY)],
                                ].map(([label, value]) => (
                                    <div key={label}>
                                        <div className="text-[10px] text-tp-muted uppercase tracking-wider mb-1">{label}</div>
                                        <div className="font-mono text-sm font-bold text-tp-primary">{value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}