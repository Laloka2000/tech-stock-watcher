"use client";
import type { Sentiment } from "@/types/stock";
import { TriangleUpIcon, TriangleDownIcon } from "./icons";

interface BadgeProps {
    sentiment: Sentiment;
}

const SENTIMENT_STYLES: Record<Sentiment, string> = {
    bullish: "text-tp-teal border-tp-teal/30 bg-tp-teal/[0.08]",
    neutral: "text-tp-gold border-tp-gold/30 bg-tp-gold/[0.08]",
    bearish: "text-tp-rust border-tp-rust/30 bg-tp-rust/[0.08]",
};

export function SentimentBadge({ sentiment }: BadgeProps) {
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium font-sans border ${SENTIMENT_STYLES[sentiment]}`}>
            {sentiment}
        </span>
    );
}

interface ChangeBadgeProps {
    value: number;
}

export function ChangeBadge({ value }: ChangeBadgeProps) {
    const moveUp = value >= 0;
    const color = moveUp ? "text-tp-teal" : "text-tp-rust";
    return (
        <span className={`inline-flex items-center gap-1 font-mono text-sm font-semibold ${color}`}>
            {moveUp ? <TriangleUpIcon /> : <TriangleDownIcon />}
            {moveUp ? "+" : ""}{value.toFixed(2)}%
        </span>
    );
}

// MetricCard
interface MetricCardProps {
    label: string;
    value: string | number | null;
    valueColor?: string;
    sub?: string;
}

export function MetricCard({ label, value, valueColor, sub }: MetricCardProps) {
    return (
        <div className="border border-tp-line bg-tp-surf rounded-sm px-4 py-3 flex-1 min-w-0">
            <div className="text-[11px] text-tp-ink2 mb-1.5">
                {label}
            </div>
            <div className={`font-mono text-lg font-semibold leading-none ${valueColor ?? "text-tp-ink"}`}>
                {value ?? "—"}
            </div>
            {sub && <div className="text-[11px] text-tp-ink2 mt-1.5">{sub}</div>}
        </div>
    )
}

// Skeleton
interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
    return (
        <div className={`rounded-sm bg-tp-line/50 animate-shimmer bg-[linear-gradient(90deg,#DDCBAE_25%,#EADFC7_50%,#DDCBAE_75%)] bg-[length:200%_100%] ${className}`} />
    );
}

export function StockRowSkeleton() {
    return (
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-tp-line/60">
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
        <div className="border border-tp-line bg-tp-surf rounded-sm px-4 py-3 flex-1">
            <Skeleton className="h-2 w-16 mb-3" />
            <Skeleton className="h-5 w-20" />
        </div>
    );
}
