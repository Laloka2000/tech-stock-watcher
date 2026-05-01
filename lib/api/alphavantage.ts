/**
 * Alpha Vantage API client
 * Docs: https://www.alphavantage.co/documentation/
 * Free tier: 25 req / day  ← TREAT THIS AS PRECIOUS
 * Used for: daily OHLCV chart data only
 *
 * Strategy:
 *  - Cache every response server-side for 24 hours
 *  - Only request "compact" output (last 100 data points) unless 6M/1Y needed
 *  - Never call from the browser — always through /api/chart route handler
 */

import type { ChartPoint, ChartRange } from "@/types/stock";

const BASE_URL = "https://www.alphavantage.co/query";

function getKey(): string {
    const apiKey = process.env.ALPHAVANTAGE_API_KEY;
    if (!apiKey) throw new Error("ALPHAVANTAGE_API_KEY not set");
    return apiKey;
}

// Raw response shape
interface AVDailyResponse {
    "Meta Data": {
        "1. Information": string;
        "2. Symbol": string;
        "3. Last Refreshed": string;
        "4. Output size": string;
        "5. Time Zone": string;
    };
    "Time Series (Daily)": Record<string, {
        "1. open": string;
        "2. high": string;
        "3. low": string;
        "4. close": string;
        "5. volume": string;
    }
    >;
}

/** Map ChartRange to the number of trading days to return */
const RANGE_DAYS: Record<ChartRange, number> = {
    "1W": 7,
    "1M": 30,
    "3M": 90,
    "6M": 180,
    "1Y": 365,
    "5Y": 1825,
};

export async function fetchDailyChart(ticker: string, range: ChartRange = "1Y"): Promise<ChartPoint[]> {
    const outPutSize = RANGE_DAYS[range] > 100 ? "full" : "compact";
    const url = new URL(BASE_URL);
    url.searchParams.set("function", "TIME_SERIES_DAILY");
    url.searchParams.set("symbol", ticker);
    url.searchParams.set("outputsize", outPutSize);
    url.searchParams.set("apikey", getKey());

    const result = await fetch(url.toString(), {
        next: {revalidate: 86400},
    });

    const data: AVDailyResponse = await result.json();

    if (!data["Time Series (Daily)"]) {
        const note = (data as unknown as Record<string, unknown>)["Note"] as string | undefined;
        const info = (data as unknown as Record<string, unknown>)["Information"] as string | undefined;
        throw new Error(
            note ?? info ?? `Aplha Vantage ${result.status}: ${ticker}`
        );
    }

    const options = data["Time Series (Daily)"];
    const days = RANGE_DAYS[range];

    const points: ChartPoint[] = Object.entries(options).sort(([a], [b]) => a.localeCompare(b)).slice(-days).map(([date, v]) => ({
        date, 
        open: parseFloat(v["1. open"]),
        high: parseFloat(v["2. high"]),
        low: parseFloat(v["3. low"]),
        close: parseFloat(v["4. close"]),
        volume: parseInt(v["5. volume"], 10),
    }));
    return points;
}