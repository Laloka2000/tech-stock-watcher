"use client";
import type { Sentiment } from "@/types/stock";

interface BadgeProps {
    sentiment: Sentiment;
}

const SENTMENT_STYLES: Record<Sentiment, string> = {
    bullish: "text-tp-accent border-tp-accent/30 bg-tp-accent/10",
    neutral: "text-tp-yellow border-tp-yellow/30 bg-tp-yellow/10",
    bearish: "text-tp-red border-tp-red/30 bg-tp-red/10",
};

export function SentimentBadge({sentiment}: BadgeProps) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-widest uppercase border ${SENTMENT_STYLES[sentiment]}`}>
            {sentiment}
        </span>
    );
}

interface ChangeBadgeProps {
    value: number;
}

export function ChangeBadge({value}: ChangeBadgeProps) {
    const moveUp = value >= 0;
    const close = moveUp ? "text-tp-accent bg-tp-accent/10 border-tp-accent/20" : "text-tp-red bg-tp-red/10 border-tp-red/20";
    return (
        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded font-mono text-xs fond-bold border ${close}`}>
            {moveUp ? "▲" : "▼"} {Math.abs(value).toFixed(2)}% 
        </span>
    );
}

//MetricCard 
interface MetricCardProps {
    label: string;
    value: string | number | null;
    valueColor?: string;
    sub?: string;
}

export function MetricCard({label, value, valueColor, sub}: MetricCardProps) {
    return (
        <div className="bg-tp-card border border-tp-border rounded-xl p-4 flex-1 min-w-0">
            <div className="text-[10px] text-tp-muted uppercase tracking-widest mb-2 font-sans">
                {label}
            </div>
            <div className={`font-mono text-lg font-bold leading-none ${valueColor ?? "text-tp-primary"}`}>
                {value ?? "N/A"}
            </div>
            {sub && <div className="text-[11px] text-tp-muted mt-1.5">{sub}</div>}
        </div>
    )
}

//Skeleton
interface SkeletonProps {
    className?: string;
}

export function Skeleton({className = ""}: SkeletonProps) {
    return ( 
        <div className={`rounded bg-tp-border animate-shimmer bg-[linear-gradient(90deg,#1c2a1e_25%,#243428_50%,#1c2a1e_75%)] bg-[length:200%_100%] ${className}`} />
    );
}

export function StockRowSkeleton() {
    return (
        <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1">
                <Skeleton className="h-3 w-10 mb-2" />
                <Skeleton className="h-2.5 w-20" />
            </div>
            <Skeleton className="h-5 w-14" />
        </div>
    );
}

export function MetricCardSkeleton() {
    return (
        <div className="bg-tp-card border border-tp-border rounded-xl p-4 flex-1">
            <Skeleton className="h-2 w-16 mb-3"/>
            <Skeleton className="h-5 w-20" />
        </div>
    );
}
