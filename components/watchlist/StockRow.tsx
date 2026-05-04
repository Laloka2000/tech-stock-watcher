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

function fmt(n: number){
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function StockRow({ticker, quote, chart, logo, sector, active, onRemove}: StockRowProps){
    if (!quote) return <StockRowSkeleton />;

    const up = quote.percentChange >= 0;
    const changeColor = up ? "#00e68e" : "#ff5252";
    const sparkData = chart.length > 0 ? chart.map((p) => p.close) : [quote.prevClose, quote.price];

    return (
        <Link 
            href={`/stock/${ticker}`}
            className={`group flex items-center gap-3 px-4 py-3 transition-all border-all border-l-2 hover:bg-white[0.03] ${active ? "border-tp-accent bg-tp-accent/[0.06]" : "border-transparent"}`}
        >
            {/** Logo / initial */} 
            <div className="w-8 h-8 rounded-lg bg-tp-border flex items-center justify-center overflow-hidden flex-shrink-0">
                {logo ? (
                    <Image src={logo} alt={ticker} width={32} height={32} className="object-contain" unoptimized />
                ) : (
                    <span className="text-[10px] font-mono font-bold text-tp-sec">{ticker.slice(0, 2)}</span>
                )}
            </div>

            {/** Name + Sector */}
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="font-mono text-[13px] font-bold text-tp-primary">{ticker}</span>
                    {sector && (
                        <span className="text-[10px] text-tp-muted truncate">{sector}</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-mono text-[12px] text-tp-primary">${fmt(quote.price)}</span>
                    <span className="font-mono text-[12px] text-tp-primary" style={{color: changeColor}}>
                        {up ? "+" : ""}{quote.percentChange.toFixed(2)}%
                    </span>
                </div>
            </div>

            {/** Sparkline */}
            <div className="flex-shrink-0">
                <Sparkline data={sparkData} width={56} height={26} color={changeColor} />
            </div>

            {/** Remove button (visible on hover) */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    onRemove(ticker);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-tp-muted hover:text-tp-red text-xs ml-1 p-1 rounded"
                aria-label={`Remove ${ticker} from watchlist`}
            >
                ✕
            </button>
        </Link>
    );
}