import type { Fundamentals } from "@/types/stock";

const BASE_URL = "https://financialmodelingprep.com/api/v3";
const TIMEOUT_MS = 10_000;

function getKey(): string {
    const apiKey = process.env.FMP_API_KEY;
    if (!apiKey) throw new Error("FMP_API_KEY not set");
    return apiKey;
}

async function fmpFetch<T>(path: string): Promise<T> {
    const sep = path.includes("?") ? "&" : "?";
    const url = `${BASE_URL}${path}${sep}apikey=${getKey()}`;

    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
    const res = await fetch(url, {
        signal: controller.signal,
        next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`FMP ${res.status}: ${path}`);
    return res.json() as Promise<T>;
    } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError")
        throw new Error(`FMP timeout: ${path}`);
    throw err;
    } finally {
    clearTimeout(tid);
    }
}

interface FMPProfile {
    marketCap: number;
    beta: number;
    volAvg: number;
    range: string;
}

interface FMPRatiosTTM {
    peRatioTTM: number;
    dividendYielTTM?: number;
    returnOnEquityTTM?: number;
    debtEquityRatioTTM?: number;
    revenueGrowthTTM?: number;
}

interface FMPKeyMetricsTTM {
    peRatioTTM?: number;
    epsTTM?: number;
    returnOnEquityTTM?: number;
    debtToEquityTTM?: number;
    dividendYieldTTM?: number;
}

export async function fetchFundamentals(ticker: string): Promise<Fundamentals> {
    const [profiles, ratiosArr, metricsArr] = await Promise.all([
        fmpFetch<FMPProfile[]>(`/profile/${ticker}`),
        fmpFetch<FMPRatiosTTM[]>(`/ratios-ttm/${ticker}`).catch(() => [] as FMPRatiosTTM[]),
        fmpFetch<FMPKeyMetricsTTM[]>(`/key-metrics-ttm/${ticker}`).catch(() => [] as FMPKeyMetricsTTM[]),
    ]);

    const profile = profiles?.[0];
    const ratios  = ratiosArr?.[0];
    const metrics = metricsArr?.[0];

    let w52Low: number | null = null;
    let w52High: number | null = null;
    if (profile?.range) {
    const parts = profile.range.split("-").map(parseFloat);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]))
        [w52Low, w52High] = parts;
    }

    return {
        ticker,
        marketCap: profile?.marketCap ?? 0,
        pe: ratios?.peRatioTTM ?? metrics?.peRatioTTM ?? null,
        eps: metrics?.epsTTM ?? null,
        beta: profile?.beta ?? null,
        w52High,
        w52Low,
        averageVolume: profile?.volAvg ?? null,
        divYield: ratios?.dividendYielTTM ?? metrics?.dividendYieldTTM ?? null,
        roe: ratios?.returnOnEquityTTM ?? metrics?.returnOnEquityTTM ?? null,
        debtToEq: ratios?.debtEquityRatioTTM ?? metrics?.debtToEquityTTM ?? null,
        revenueGrowYoY: ratios?.revenueGrowthTTM ?? null,
    };
}