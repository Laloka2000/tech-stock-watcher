import {Quote, CompanyProfile} from "@/types/stock";

const BASE_URL = "https://finnhub.io/api/v1";

function getKey(): string {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) throw new Error("FINNHUB_API_KEY is not set");
    return apiKey;
}

async function finnhubFetch<T>(path: string): Promise<T> {
    const url = `${BASE_URL}${path}&token=${getKey()}`;
    const result = await fetch(url, {next: {revalidate: 60}});
    if (!result.ok) {
        throw new Error(`Finnhub ${result.status}: ${path}`);
    }
    return result.json() as Promise<T>;
}

// Raw shapes from Finnhub

interface FinnhubQuote {
    currentPrice: number;
    change: number;
    percentChange: number;
    high: number;
    low: number;
    open: number;
    previousClose: number;
    timeStamp: number;
}

interface FinnhubProfile {
    country: string;
    currency: string;
    exchange: string;
    ipo: string;
    marketCapitalization: number;
    name: string;
    phone: string;
    shareOutstanding: number;
    ticker: string;
    weburl: string;
    logo: string;
    finnhubIndustry: string;
}

// Public helper functions

export async function fetchQuote(ticker: string): Promise<Quote>{
    const rawData = await finnhubFetch<FinnhubQuote>(`/qoute?symbol=${ticker}`);
    return {
        ticker,
        price: rawData.currentPrice,
        change: rawData.change,
        percentChange: rawData.percentChange,
        high: rawData.high,
        low: rawData.low,
        prevClose: rawData.previousClose,
        volume: 0, 
        timestamp: rawData.timeStamp,
    };
}

/** Fetch multiple qoutes. Finnhub doesn't have a batch endpoint on free tier
 * so we fan out in parallel (within the 60 req/min budget).
 */
export async function fetchQuotes(ticker: string[]): Promise<Record<string, Quote>> {
    const fetchResults = await Promise.allSettled(ticker.map(fetchQuote));
    const out: Record<string, Quote> = {};
    fetchResults.forEach((result, i) => {
        if (result.status === "fulfilled") out[ticker[i]] = result.value;
    });
    return out;
}

export async function fetchProfile(ticker: string): Promise<CompanyProfile> {
    const rawData = await finnhubFetch<FinnhubProfile>(
        `/stock/profile2?symbol=${ticker}`
    );
    return {
        ticker,
        name: rawData.name ?? ticker,
        sector: rawData.finnhubIndustry ?? "Technology",
        industry: rawData.finnhubIndustry ?? "Technology",
        country: rawData.country ?? "US",
        exchange: rawData.exchange ?? "",
        logo: rawData.logo ?? "",
        websiteUrl: rawData.weburl ?? "",
        marketCap: (rawData.marketCapitalization ?? 0) * 1e6,
        shareOutstanding: rawData.shareOutstanding ?? 0,
    };
}