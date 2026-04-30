import type { Fundamentals } from "@/types/stock";

const BASE_URL = "https://financialmodelingprep.com/api/v3";

function getKey(): string {
    const apiKey = process.env.FMP_API_KEY;
    if (!apiKey) throw new Error("FMP_API_KEY not set");
    return apiKey;
}

async function fmpFetch<T>(path: string): Promise<T> {
    const sep = path.includes("?") ? "&" : "?";
    const url = `${BASE_URL}${path}${sep}apikey=${getKey()}`;
    const res = await fetch(url, {next: {revalidate: 86400}});
    if (!res.ok) throw new Error(`FMP ${res.status}: ${path}`);
    return res.json() as Promise<T>;
}

// Raw shapes

interface FMPProfile {
    symbol: string;
    companyName: string;
    marketCap: number;
    price: number;
    beta: number;
    volumeAverage: number;
    lastDiv: number;
    range: string;
    changes: number;
    currency: string;
    exchangeShortName: string;
    industry: string;
    sector: string;
}

interface FMPRatiosTTM {
    peRatioTTM: number;
    epsBasicExclExtraItemsTTM?: number;
    dividendYielTTM?: number;
    dividendYieldPercentageTTM?: number;
    returnOnEquityTTM?: number;
    debtEquityRatioTTM?: number;
    revenueGrowthTTM?: number;
    netProfileMarginTTM?: number;
}

interface FMPKeyMetricsTTM {
    peRatioTTM?: number;
    epsTTM?: number;
    revenuePerShapeTTM?: number;
    returnOnEquityTTM?: number;
    debtToEquityTTM?: number;
    dividendYieldTTM?: number;
}

// Public helper functions

export async function fetchFundamentals(ticker: string): Promise<Fundamentals> {
    // Fan out both requests in parallel to save time
    const [profiles, ratiosArr, metricsArr] = await Promise.all([
        fmpFetch<FMPProfile[]>(`/profile/${ticker}`),
        fmpFetch<FMPRatiosTTM[]>(`/ratios-ttm/${ticker}`).catch(() => [] as FMPRatiosTTM[]),
        fmpFetch<FMPKeyMetricsTTM[]>(`/key-metrics-ttm/${ticker}`).catch(() => [] as FMPKeyMetricsTTM[]),
    ]);

    const profile  = profiles?.[0];
    const ratios   = ratiosArr?.[0];
    const metrics  = metricsArr?.[0];

    let w52Low: number | null = null;
    let w52High: number | null = null;
    if (profile?.range) {
        const parts = profile.range.split("-").map(parseFloat);
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            [w52Low, w52High] = parts;
        }
    }

    return {
        ticker, 
        marketCap: profile?.marketCap ?? 0, 
        pe: ratios?.peRatioTTM ?? metrics?.peRatioTTM ?? null,
        eps: metrics?.epsTTM ?? null,
        beta: profile?.beta ?? null,
        w52High,
        w52Low,
        averageVolume: profile?.volumeAverage ?? null,
        divYield: ratios?.dividendYielTTM ?? metrics?.dividendYieldTTM ?? null,
        roe: ratios?.returnOnEquityTTM ?? metrics?.returnOnEquityTTM ?? null,
        debtToEq: ratios?.debtEquityRatioTTM ?? metrics?.debtToEquityTTM ?? null,
        revenueGrowYoY: ratios?.revenueGrowthTTM ?? null,
    };
}