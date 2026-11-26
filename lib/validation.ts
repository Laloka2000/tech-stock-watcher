export const TICKER_PATTERN = /^[A-Z]{1,5}$/;


/**
 * Converts any input into a valid ticker, or returns null.
 * " nvda " → "NVDA", "123" → null, undefined → null
 */
export function normalizeTicker(input: unknown): string | null
{
    if (typeof input !== "string") return null;
    const ticker = input.trim().toUpperCase();
    return TICKER_PATTERN.test(ticker) ? ticker : null;
}