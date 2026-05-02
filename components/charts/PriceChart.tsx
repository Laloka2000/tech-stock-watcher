"use client";

import { useState } from "react";
import type { ChartPoint, ChartRange } from "@/types/stock";

interface PriceChartProps {
    points: ChartPoint[];
    range: ChartRange;
    color: string;
}

const PAD = {l: 66, r: 18, t: 18, b: 34};
const W = 780;
const H = 240;
const CW = W - PAD.l - PAD.r;
const CH = H - PAD.t - PAD.b;

function niceLabel(v: number): string {
    if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
    return v.toFixed(0);
}

export function PriceChart({ points, range, color }: PriceChartProps) {
    const [hoverIdx, setHoverIdx] = useState<number | null>(null);

    if (points.length < 2){
        return (
            <div className="flex items-center justify-center h-[240px] text-tp-muted font-mono text-xs">
                No chart data available
            </div>
        );
    }

    const closesValue = points.map((p) => p.close);
    const min = Math.min(...closesValue) * 0.998;
    const max = Math.max(...closesValue) * 1.005;
    const rangeValue = max - min;

    const xOf = (i: number) => PAD.l + (i / (points.length - 1)) * CW;
    const yOf = (v: number) => PAD.t + CH - ((v - min) / rangeValue) * CH;

    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)},${yOf(p.close).toFixed(1)}`).join(" ");

    const areaPath = `${linePath} L${xOf(points.length - 1)},${PAD.t + CH} L${PAD.l},${PAD.t + CH} Z`;

    // Y-axis ticks (5 levels)
    const yAxisTicks = Array.from({length: 5}, (_, i) => {
        const value = min + (rangeValue / 4) * i;
        return {value, y: yOf(value)};
    });

    const xAxisLabelIdxs = [
        0, 
        Math.floor(points.length * 0.25),
        Math.floor(points.length * 0.5),
        Math.floor(points.length * 0.75),
        points.length - 1,
    ];
    function fmtDate(d: string) {
        const date = new Date(d);
        if (range === "1W") return date.toLocaleDateString("en-US", {weekday: "short"});
        if (range === "1M") return date.toLocaleDateString("en-US", {month: "short", day: "numeric"});
        return date.toLocaleDateString("en-US", {month: "short", day: "numeric"});
    }

    const hovered = hoverIdx !== null ? points[hoverIdx] : null;
    const lastPoint = points[points.length - 1];

    const gid = `area-${color.replace(/[^a-z0-9]/gi, "")}`;

    return (
        <div className="relative w-full">
            {/* Hover tooltip */}
            {hovered && (
                <div className="absolute z-10 pointer-events-none bg-tp-surf border border-tp-border rounded-lg px-3 py-2 text-xs font-mono" style={{left: Math.min(xOf(hoverIdx!) + 14, W-108), top: yOf(hovered.close) - 50,}}>
                    <div className="text-tp-muted mb-0.5">{hovered.date}</div>
                    <div className="text-tp-primary font-bold">${hovered.close.toFixed(2)}</div>
                    <div>H: ${hovered.high.toFixed(2)} · L: ${hovered.low.toFixed(2)}</div>
                </div>
            )}

            <svg 
                viewBox={`0 0 ${W} ${H}`}
                className="w-full overflow-visible"
                onMouseLeave={() => setHoverIdx(null)}
                onMouseMove={(e) => {
                    const svg = e.currentTarget.getBoundingClientRect();
                    const relativeX = ((e.clientX - svg.left) / svg.width) * W;
                    const chartX = relativeX - PAD.l;
                    const idx = Math.round((chartX / CW) * (points.length - 1));
                    setHoverIdx(Math.max(0, Math.min(points.length - 1, idx)));
                }}
            >
                <defs>
                    <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                {/* Grid lines + Y labels */}
                {yAxisTicks.map(({ value, y }) => (
                    <g key={value}>
                        <line
                            x1={PAD.l} y1={y} x2={PAD.l + CW} y2={y}
                            stroke="#1c2a1e" strokeWidth="1"
                        />
                        <text
                            x={PAD.l - 8} y={y + 4}
                            textAnchor="end"
                            fill="#3d5040"
                            fontSize="10"
                            fontFamily="'Space Mono', monospace"
                        >
                            {niceLabel(value)}
                        </text>
                    </g>
                ))}

                {/** Area fill */}
                <path d={areaPath} fill={`url(#${gid})`}/>

                {/** Line */}
                <path 
                    d={linePath}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/** Last price dot */}
                <circle 
                    cx={xOf(points.length - 1)}
                    cy={yOf(lastPoint.close)}
                    r="4"
                    fill={color}
                    stroke="#070c09"
                    strokeWidth="2"
                />

                {/** Hover crosshair */}
                {hoverIdx !== null && (
                    <>
                        <line 
                            x1={xOf(hoverIdx)} y1={PAD.t}
                            x2={xOf(hoverIdx)} y2={PAD.t + CH}
                            stroke="#1c2a1e" strokeWidth="1" strokeDasharray="3,3"
                        />
                        <circle 
                            cx={xOf(hoverIdx)}
                            cy={yOf(points[hoverIdx].close)}
                            r="4"
                            fill={color}
                            stroke="#70c90"
                            strokeWidth="2"
                        />
                    </>
                )}

                {/** X-axis labels */}
                {xAxisLabelIdxs.map((i) => (
                    <text 
                        key={i}
                        x={xOf(i)}
                        y={PAD.t + CH + 20}
                        textAnchor="middle"
                        fill="#3d5040"
                        fontSize="10"
                        fontFamily="'Space Mono', monospace"
                    >
                        {fmtDate(points[i].date)}
                    </text>
                ))}
            </svg>
        </div>
    )
}