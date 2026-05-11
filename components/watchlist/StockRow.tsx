"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkline } from "../charts/Sparkline";
import { StockRowSkeleton } from "../ui";
import type { Quote, ChartPoint } from "@/types/stock";

interface StockRowProps {
    ticker: string;
    quote: Quote | null;
    chart: ChartPoint[];
    logo?: string;
    sector?: string;
    active?: boolean;
    onRemove: (ticker: string) => void;
}

function fmt(n: number) {
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function StockRow({ ticker, quote, chart, logo, sector, active, onRemove }: StockRowProps) {
    if (!quote) return <StockRowSkeleton />;

    const pct = quote.percentChange ?? 0;
    const up = pct >= 0;
    const changeColor = up ? "#00e68e" : "#ff5252";
    // If no chart data, synthetic OHLC sparkline
    const sparkData = chart.length > 0
        ? chart.map((p) => p.close)
        : up
            ? [quote.prevClose, quote.open, quote.high, quote.low * 1.001, quote.price]
            : [quote.prevClose, quote.open, quote.low,  quote.high * 0.999, quote.price];

    return (
        <Link
            href={`/stock/${ticker}`}
            style={{ minHeight: "64px" }}
            className={`group flex items-center gap-3 px-4 py-3.5 transition-all border-l-2 active:bg-white/[0.05] hover:bg-white/[0.03] ${
                active ? "border-tp-accent bg-tp-accent/[0.06]" : "border-transparent"
            }`}
        >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl bg-tp-border flex items-center justify-center overflow-hidden flex-shrink-0">
                {logo ? (
                    <Image src={logo} alt={ticker} width={36} height={36} className="object-contain" unoptimized />
                ) : (
                    <span className="text-[11px] font-mono font-bold text-tp-sec">{ticker.slice(0, 2)}</span>
                )}
            </div>

            {/* Ticker + price */}
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="font-mono text-[14px] font-bold text-tp-primary">{ticker}</span>
                    {sector && (
                        <span className="text-[10px] text-tp-muted truncate hidden sm:block">{sector}</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-mono text-[13px] text-tp-sec">${fmt(quote.price)}</span>
                    <span className="font-mono text-[12px] font-bold" style={{ color: changeColor }}>
                        {up ? "+" : ""}{pct.toFixed(2)}%
                    </span>
                </div>
            </div>

            <div className="flex-shrink-0">
                <Sparkline data={sparkData} width={60} height={28} color={changeColor} />
            </div>


            {/* Remove — only on desktop hover */}
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(ticker); }}
                className="hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity text-tp-muted hover:text-tp-red text-xs p-1.5 rounded-lg flex-shrink-0 items-center justify-center"
                aria-label={`Remove ${ticker}`}
            >
                ✕
            </button>
        </Link>
    );
}