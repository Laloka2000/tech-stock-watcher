/**
* Yahoo Finance chart API — instead of Alpha Vantage
*
* Benefits:
* - Completely free, no API key
* - No daily limit, no per-second limit
* - Reliable historical daily data
*/

import type { ChartPoint, ChartRange } from "@/types/stock";

const BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart";
const TIMEOUT_MS = 10_000;

const YAHOO_RANGE: Record<ChartRange, string> = {
    "1W": "5d",
    "1M": "1mo",
    "3M": "3mo",
};

interface YahooChartResponse {
    chart: {
        result?: Array<{
            timestamp: number[];
            indicators: {
                quote: Array<{
                    open: (number | null)[];
                    high: (number | null)[];
                    low: (number | null)[];
                    close: (number | null)[];
                    volume: (number | null)[];
                }>;
            };
        }>;
        error?: { code: string; description: string };
    };
}

export async function fetchDailyChart(
    ticker: string,
    range: ChartRange = "1M"
): Promise<ChartPoint[]> {
    const yahooRange = YAHOO_RANGE[range];
    const url = `${BASE_URL}/${ticker}?interval=1d&range=${yahooRange}`;

    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let res: Response;
    try {
        res = await fetch(url, {
            signal: controller.signal,
            headers: { "User-Agent": "Mozilla/5.0" },
            next: { revalidate: 86400 },
        });
    } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError")
            throw new Error(`Yahoo Finance timeout for ${ticker}`);
        throw err;
    } finally {
        clearTimeout(tid);
    }

    if (!res.ok) throw new Error(`Yahoo Finance HTTP ${res.status} for ${ticker}`);

    const data: YahooChartResponse = await res.json();

    if (data.chart.error)
        throw new Error(`Yahoo Finance hiba: ${data.chart.error.description}`);

    const result = data.chart.result?.[0];
    if (!result) throw new Error(`Yahoo Finance: nincs adat ${ticker}-hez`);

    const { timestamp, indicators } = result;
    const quote = indicators.quote[0];
    const points: ChartPoint[] = [];

    for (let i = 0; i < timestamp.length; i++) {
        const close = quote.close[i];
        const open  = quote.open[i];
        const high  = quote.high[i];
        const low   = quote.low[i];
        if (close == null || open == null || high == null || low == null) continue;

        points.push({
            date: new Date(timestamp[i] * 1000).toISOString().split("T")[0],
            open, high, low, close,
            volume: quote.volume[i] ?? 0,
        });
    }

    return points;
}