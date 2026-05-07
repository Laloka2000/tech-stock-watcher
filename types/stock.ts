// Core stock types
export interface Quote {
    ticker: string;
    price: number;
    change: number;
    percentChange: number;
    high: number;
    low: number;
    open: number;
    prevClose: number;
    volume: number;
    timestamp: number;
}

export interface CompanyProfile {
    ticker: string;
    name: string;
    sector: string;
    industry: string;
    country: string;
    exchange: string;
    logo: string;
    websiteUrl: string;
    marketCap: number;
    shareOutstanding: number;
}

export interface Fundamentals {
    ticker: string;
    marketCap: number;
    pe: number | null;
    eps: number | null;
    beta: number | null;
    w52High: number | null;
    w52Low: number | null;
    averageVolume: number | null;
    divYield: number | null;
    roe: number | null;
    debtToEq: number | null;
    revenueGrowYoY: number | null;
}

export interface ChartPoint {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

// Compose view model
export interface StockSummary {
    ticker: string;
    name: string;
    sector: string;
    logo: string;
    price: number;
    change: number;
    changePct: number;
    sparkline: number[];
}

export interface StockDetail extends StockSummary {
    profile: CompanyProfile;
    fundamentals: Fundamentals;
    chart: ChartPoint[];
    chartRange: ChartRange;
}

// API Response shapes

export interface ApiQoutesResponse {
    quotes: Record<string, Quote>;
    fetchedAt: string;
}

export interface ApiChartResponse {
    ticker: string;
    range: ChartRange;
    points: ChartPoint[];
    fetchedAt: string;
}

export interface ApiProfileResponse {
    ticker: string;
    profile: CompanyProfile;
    fundamentals: Fundamentals;
    fetchedAt: string;
}

// Csak compact outputsize-szal elérhető range-ek (free tier)
export type ChartRange = "1W" | "1M" | "3M";

export type Sentiment = "bullish" | "neutral" | "bearish";

export interface WatchlistEntry {
    ticker: string;
    addedAt: string;
}