import { Quote, CompanyProfile } from "@/types/stock";

const BASE_URL = "https://finnhub.io/api/v1";
const TIMEOUT_MS = 10_000;

function getKey(): string {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) throw new Error("FINNHUB_API_KEY is not set");
    return apiKey;
}

async function finnhubFetch<T>(path: string): Promise<T> {
    const url = `${BASE_URL}${path}&token=${getKey()}`;

    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const res = await fetch(url, {
            signal: controller.signal,
            next: { revalidate: 60 },
        });
        if (!res.ok) throw new Error(`Finnhub ${res.status}: ${path}`);
        return res.json() as Promise<T>;
    } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError")
            throw new Error(`Finnhub timeout: ${path}`);
        throw err;
    } finally {
        clearTimeout(tid);
    }
}

// --- Raw shapes ---

interface FinnhubQuote {
    c: number;   // current price
    d: number;   // change
    dp: number;  // percent change
    h: number;   // high
    l: number;   // low
    o: number;   // open
    pc: number;  // previous close
    t: number;   // timestamp
}

interface FinnhubProfile {
    country: string;
    exchange: string;
    name: string;
    shareOutstanding: number;
    ticker: string;
    weburl: string;
    logo: string;
    finnhubIndustry: string;
    marketCapitalization: number;
}

interface FinnhubMetrics {
    metric: {
        "52WeekHigh"?: number;
        "52WeekLow"?: number;
        beta?: number;
        epsBasicExclExtraItemsAnnual?: number;
        peBasicExclExtraTTM?: number;
        dividendYieldIndicatedAnnual?: number;
        roeTTM?: number;
        "totalDebt/totalEquityAnnual"?: number;
        revenueGrowthTTMYoy?: number;
        marketCapitalization?: number;
    };
}

// --- Public helpers ---

export async function fetchQuote(ticker: string): Promise<Quote> {
    const raw = await finnhubFetch<FinnhubQuote>(`/quote?symbol=${ticker}`);
    return {
        ticker,
        price: raw.c,
        change: raw.d,
        percentChange: raw.dp,
        high: raw.h,
        low: raw.l,
        open: raw.o,
        prevClose: raw.pc,
        volume: 0,
        timestamp: raw.t,
    };
}

/** Finnhub does not have a batch quote endpoint on the free tier, please request it in parallel */
export async function fetchQuotes(tickers: string[]): Promise<Record<string, Quote>> {
    const results = await Promise.allSettled(tickers.map(fetchQuote));
    const out: Record<string, Quote> = {};
    results.forEach((r, i) => {
        if (r.status === "fulfilled") out[tickers[i]] = r.value;
    });
    return out;
}

export async function fetchProfile(ticker: string): Promise<CompanyProfile> {
    const raw = await finnhubFetch<FinnhubProfile>(`/stock/profile2?symbol=${ticker}`);
    return {
        ticker,
        name: raw.name ?? "",
        sector: raw.finnhubIndustry ?? "Technology",
        industry: raw.finnhubIndustry ?? "Technology",
        country: raw.country ?? "US",
        exchange: raw.exchange ?? "",
        logo: raw.logo ?? "",
        websiteUrl: raw.weburl ?? "",
        marketCap: (raw.marketCapitalization ?? 0) * 1e6,
        shareOutstanding: raw.shareOutstanding ?? 0,
    };
}

/** Basic financials — P/E, EPS, Beta, 52w high/low, etc. (instead of FMP) */
export async function fetchMetrics(ticker: string): Promise<FinnhubMetrics["metric"]> {
    const raw = await finnhubFetch<FinnhubMetrics>(`/stock/metric?symbol=${ticker}&metric=all`);
    return raw.metric ?? {};
}