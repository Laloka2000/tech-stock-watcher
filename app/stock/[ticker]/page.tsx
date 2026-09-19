"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuotes, useChart, useProfile } from "@/hooks/useStockData";
import { useWatchlist } from "@/hooks/useWatchlist";
import { PriceChart } from "@/components/charts/PriceChart";
import { ChangeBadge, MetricCard, MetricCardSkeleton } from "@/components/ui";
import type { ChartRange } from "@/types/stock";

const ranges: ChartRange[] = ["1W", "1M", "3M"];

function fmtCap(n: number | null) {
    if (!n) return "N/A";
    if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    return `${(n / 1e6).toFixed(0)}M`;
}
function fmtPct(n: number | null) {
    if (n === null) return "N/A";
    return `${(n * 100).toFixed(1)}%`;
}
function fmtNum(n: number | null, d = 2) {
    if (n == null) return "N/A";
    return n.toFixed(d);
}
function fmtPrice(n: number | null) {
    if (n == null) return "N/A";
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function StockPage({ params }: { params: { ticker: string } }) {
    const ticker = params.ticker.toUpperCase();
    const [range, setRange] = useState<ChartRange>("1M");

    const { tickers, addTickers, removeTickers, hasTickers, hydrated } = useWatchlist();
    const { quotes, refresh } = useQuotes(hydrated ? tickers : []);
    const { points, loading: chartLoading } = useChart(ticker, range);
    const { profile, fundamentals, loading: pLoading } = useProfile(ticker);

    const quote = quotes[ticker] ?? null;
    const up = (quote?.percentChange ?? 0) >= 0;
    const color = up ? "#1F6F5C" : "#AC4B2F";
    const inList = hasTickers(ticker);

    const fundamentalRows = fundamentals ? [
        ["52W high", fmtPrice(fundamentals.w52High)],
        ["52W low", fmtPrice(fundamentals.w52Low)],
        ["Dividend yield", fmtPct(fundamentals.divYield)],
        ["ROE", fmtPct(fundamentals.roe)],
        ["Debt / equity", fmtNum(fundamentals.debtToEq)],
        ["Revenue growth YoY", fmtPct(fundamentals.revenueGrowYoY)],
    ] : [];

    return (
        <div className="flex h-screen overflow-hidden bg-tp-paper">

            {/* DESKTOP SIDEBAR */}
            <aside className="hidden md:flex w-[288px] flex-shrink-0 border-r border-tp-line bg-tp-surf flex-col">
                {/* Back + header */}
                <div className="px-5 py-4 border-b border-tp-line flex items-center gap-3">
                    <Link href="/"
                        className="w-8 h-8 rounded-sm bg-tp-paper border border-tp-line flex items-center justify-center text-tp-ink2 hover:text-tp-ink hover:border-tp-teal/40 transition-all flex-shrink-0">
                        ←
                    </Link>
                    <div>
                        <div className="font-serif text-[15px] font-semibold text-tp-ink">TechPulse</div>
                        <div className="text-[10px] text-tp-ink2">Stock detail</div>
                    </div>
                </div>

                {/* Stock summary */}
                <div className="px-5 py-4 border-b border-tp-line">
                    <div className="flex items-start gap-3 mb-4">
                        {profile?.logo ? (
                            <Image src={profile.logo} alt={ticker} width={40} height={40} className="rounded-sm" unoptimized />
                        ) : (
                            <div className="w-10 h-10 rounded-sm bg-tp-paper border border-tp-line flex items-center justify-center font-mono text-xs font-semibold text-tp-ink2">
                                {ticker.slice(0, 2)}
                            </div>
                        )}
                        <div>
                            <div className="font-mono text-sm font-semibold text-tp-ink">{ticker}</div>
                            <div className="text-[11px] text-tp-ink2">{profile?.name ?? "Loading…"}</div>
                        </div>
                    </div>

                    {quote ? (
                        <>
                            <div className="font-serif text-3xl font-semibold text-tp-ink leading-none mb-2">
                                ${fmtPrice(quote.price)}
                            </div>
                            <ChangeBadge value={quote.percentChange} />
                            <div className="mt-3 grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                                {[["Open", fmtPrice(quote.open)], ["Prev", fmtPrice(quote.prevClose)],
                                    ["High", fmtPrice(quote.high)], ["Low",  fmtPrice(quote.low)]].map(([l, v]) => (
                                    <div key={l}>
                                        <span className="text-tp-ink2">{l} </span>
                                        <span className="text-tp-ink">{v}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-2">
                            {[40, 60, 80].map(w => (
                                <div key={w} className="h-3 bg-tp-line/50 rounded-sm animate-pulse" style={{ width: `${w}%` }} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Profile info */}
                <div className="px-5 py-4 flex-1 space-y-2 text-[11px]">
                    {profile && [
                        ["Sector",   profile.sector],
                        ["Industry", profile.industry],
                        ["Exchange", profile.exchange],
                        ["Country",  profile.country],
                    ].map(([l, v]) => (
                        <div key={l} className="flex justify-between">
                            <span className="text-tp-ink2">{l}</span>
                            <span className="text-tp-ink font-medium">{v}</span>
                        </div>
                    ))}
                </div>

                {/* Watchlist gomb */}
                <div className="p-4 border-t border-tp-line">
                    <button
                        onClick={() => inList ? removeTickers(ticker) : addTickers(ticker)}
                        className={"w-full py-2.5 rounded-sm border text-xs font-mono font-semibold transition-all " +
                            (inList
                                ? "border-tp-rust/40 text-tp-rust bg-tp-rust/[0.05] hover:bg-tp-rust/10"
                                : "border-tp-teal/40 text-tp-teal bg-tp-teal/[0.05] hover:bg-tp-teal/10")}>
                        {inList ? "− Remove from watchlist" : "+ Add to watchlist"}
                    </button>
                </div>
            </aside>

            {/*  MAIN CONTENT  */}
            <main className="flex-1 flex flex-col overflow-hidden">

                {/* MOBIL HEADER */}
                <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-tp-line bg-tp-surf flex-shrink-0">
                    <Link href="/"
                        className="w-9 h-9 rounded-sm bg-tp-paper border border-tp-line flex items-center justify-center text-tp-ink2 active:scale-95 transition-all flex-shrink-0">
                        ←
                    </Link>
                    <div className="flex-1 min-w-0">
                        <div className="font-mono text-base font-semibold text-tp-ink leading-tight">{ticker}</div>
                        {profile && <div className="text-[11px] text-tp-ink2 truncate">{profile.name}</div>}
                    </div>
                    <button
                        onClick={() => inList ? removeTickers(ticker) : addTickers(ticker)}
                        className={"px-3 py-1.5 rounded-sm border text-[11px] font-mono font-semibold transition-all active:scale-95 flex-shrink-0 " +
                            (inList
                                ? "border-tp-rust/40 text-tp-rust bg-tp-rust/[0.05]"
                                : "border-tp-teal/40 text-tp-teal bg-tp-teal/[0.05]")}>
                        {inList ? "− Remove" : "+ Watch"}
                    </button>
                </header>

                {/* DESKTOP TOPBAR */}
                <header className="hidden md:flex items-center px-8 py-5 border-b border-tp-line bg-tp-surf flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <h1 className="font-serif text-2xl font-semibold text-tp-ink">{ticker}</h1>
                        {profile && <span className="text-sm text-tp-ink2">{profile.name}</span>}
                        {profile && (
                            <span className="text-[11px] text-tp-ink2 bg-tp-paper border border-tp-line px-2 py-0.5 rounded-sm">
                                {profile.sector}
                            </span>
                        )}
                    </div>
                    <div className="flex-1" />
                    <button onClick={() => refresh()} className="text-tp-ink2 hover:text-tp-teal text-sm transition-colors px-2">
                        ↻
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto">

                    {/* MOBILE: Price + change card */}
                    <div className="md:hidden px-4 py-4 border-b border-tp-line bg-tp-surf">
                        {quote ? (
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="font-serif text-4xl font-semibold text-tp-ink leading-none">
                                        ${fmtPrice(quote.price)}
                                    </div>
                                    <div className="mt-2">
                                        <ChangeBadge value={quote.percentChange} />
                                    </div>
                                </div>
                                <div className="text-right text-[11px] font-mono space-y-1 text-tp-ink2">
                                    <div>H: <span className="text-tp-ink">${fmtPrice(quote.high)}</span></div>
                                    <div>L: <span className="text-tp-ink">${fmtPrice(quote.low)}</span></div>
                                    <div>O: <span className="text-tp-ink">${fmtPrice(quote.open)}</span></div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="h-10 w-48 bg-tp-line/50 rounded-sm animate-pulse" />
                                <div className="h-5 w-24 bg-tp-line/50 rounded-sm animate-pulse" />
                            </div>
                        )}
                    </div>

                    {/* CHART */}
                    <div className="p-4 md:p-8">
                        <div className="bg-tp-surf border border-tp-line rounded-sm p-4 md:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full"
                                        style={{ background: color }} />
                                    <span className="text-[11px] text-tp-ink2">Price history</span>
                                </div>
                                <div className="flex gap-1">
                                    {ranges.map(r => (
                                        <button key={r} onClick={() => setRange(r)}
                                            className={"px-2.5 py-1.5 md:py-1 rounded-sm text-[11px] md:text-[10px] font-mono font-semibold transition-all " +
                                                (range === r
                                                    ? "text-tp-teal bg-tp-teal/[0.1] border border-tp-teal/40"
                                                    : "text-tp-ink2 border border-transparent hover:border-tp-line")}>
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {chartLoading ? (
                                <div className="flex items-center justify-center h-[200px] md:h-[240px] text-tp-ink2 font-mono text-xs">
                                    Loading chart…
                                </div>
                            ) : (
                                <PriceChart points={points} range={range} color={color} />
                            )}
                        </div>
                    </div>

                    {/* METRICS */}
                    <div className="px-4 md:px-8 pb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {pLoading ? (
                            Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)
                        ) : (
                            <>
                                <MetricCard label="Market cap" value={fmtCap(fundamentals?.marketCap ?? null)} />
                                <MetricCard label="P/E ratio"  value={fmtNum(fundamentals?.pe ?? null)} />
                                <MetricCard label="EPS (TTM)"  value={fundamentals?.eps != null ? `$${fmtNum(fundamentals.eps)}` : "N/A"} />
                                <MetricCard label="Beta"       value={fmtNum(fundamentals?.beta ?? null)} />
                            </>
                        )}
                    </div>

                    {/* FUNDAMENTALS */}
                    {fundamentals && (
                        <div className="px-4 md:px-8 pb-8">
                            <div className="bg-tp-surf border border-tp-line rounded-sm p-4 md:p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                                    <span className="text-[11px] text-tp-ink2">Fundamentals</span>
                                    <span className="text-[11px] text-tp-ink3 ml-auto">Source: Finnhub</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {fundamentalRows.map(([label, value]) => (
                                        <div key={label}>
                                            <div className="text-[11px] text-tp-ink2 mb-1">{label}</div>
                                            <div className="font-mono text-sm font-semibold text-tp-ink">{value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
