interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    color: string;
    strokeWidth?: number;
}

export function Sparkline({data, width = 64, height = 16, color, strokeWidth = 1.5}: SparklineProps) {
    const cleanData = data.filter((v) => v != null && isFinite(v));
    if (cleanData.length < 2) return <svg width={width} height={height} />

    const min = Math.min(...cleanData);
    const max = Math.max(...cleanData);
    const range = max - min || 1;

    const path = cleanData.map((v, i) => {
        const x = ((i / (cleanData.length - 1)) * width).toFixed(1);
        const y = (height - ((v - min) / range) * height).toFixed(1);
        return `${i === 0 ? "M" : "L"}${x}, ${y}`;
    }).join(" ");

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block overflow-visible" aria-hidden="true">
            <path d={path} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}