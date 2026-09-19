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
    const changeColor = up ? "#1F6F5C" : "#AC4B2F";
    const sparkData = chart.length > 0
        ? chart.map((p) => p.close)
        : up
            ? [quote.prevClose, quote.open, quote.high, quote.low * 1.001, quote.price]
            : [quote.prevClose, quote.open, quote.low,  quote.high * 0.999, quote.price];

    return (
        <Link
            href={`/stock/${ticker}`}
            style={{ minHeight: "64px" }}
            className={`group flex items-center gap-2.5 px-5 py-3.5 border-b border-tp-line/60 border-l-2 transition-colors active:bg-tp-ink/[0.03] hover:bg-tp-ink/[0.02] ${
                active ? "border-l-tp-teal bg-tp-teal/[0.05]" : "border-l-transparent"
            }`}
        >
            <div className="w-8 h-8 rounded-sm bg-tp-paper border border-tp-line flex items-center justify-center overflow-hidden flex-shrink-0">
                {logo ? (
                    <Image src={logo} alt={ticker} width={32} height={32} className="object-contain" unoptimized />
                ) : (
                    <span className="text-[10px] font-mono font-semibold text-tp-ink2">{ticker.slice(0, 2)}</span>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="font-mono text-[13px] font-semibold text-tp-ink">{ticker}</span>
                    {sector && (
                        <span className="text-[10px] text-tp-ink2 truncate hidden sm:block">{sector}</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-mono text-[12px] text-tp-ink2">${fmt(quote.price)}</span>
                    <span className="font-mono text-[12px] font-semibold" style={{ color: changeColor }}>
                        {up ? "+" : ""}{pct.toFixed(2)}%
                    </span>
                </div>
            </div>

            <div className="flex-shrink-0">
                <Sparkline data={sparkData} width={56} height={26} color={changeColor} />
            </div>

            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(ticker); }}
                className="hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity text-tp-ink2 hover:text-tp-rust text-xs p-1.5 rounded-sm flex-shrink-0 items-center justify-center"
                aria-label={`Remove ${ticker}`}
            >
                ✕
            </button>
        </Link>
    );
}
