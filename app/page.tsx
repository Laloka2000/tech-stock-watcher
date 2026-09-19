"use client";

import { useWatchlist } from "@/hooks/useWatchlist";
import { useQuotes } from "@/hooks/useStockData";
import { WatchlistPanel } from "@/components/watchlist/WatchlistPanel";
import { ChangeBadge } from "@/components/ui";
import { Sparkline } from "@/components/charts/Sparkline";
import { AuthStatus } from "@/components/auth/AuthStatus";
import Link from "next/link";
import type { ChartPoint, Quote } from "@/types/stock";

function fmt(n: number | null | undefined) {
  if (n == null) return "N/A";
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StockRowLedger({ ticker, quote, sparkData, onRemove }: {
  ticker: string;
  quote: Quote | null;
  sparkData: ChartPoint[];
  onRemove: (t: string) => void;
}) {
  const up = (quote?.percentChange ?? 0) >= 0;
  const color = up ? "#1F6F5C" : "#AC4B2F";

  if (!quote) {
    return (
      <div className="grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[1.4fr_auto_auto_auto_auto] items-center gap-4 px-4 sm:px-5 py-4 border-b border-tp-line">
        <div className="h-4 w-16 bg-tp-line/50 rounded-sm animate-pulse" />
        <div className="h-4 w-14 bg-tp-line/50 rounded-sm animate-pulse" />
        <div className="h-4 w-12 bg-tp-line/50 rounded-sm animate-pulse hidden sm:block" />
        <div className="h-6 w-16 bg-tp-line/50 rounded-sm animate-pulse" />
        <div />
      </div>
    );
  }

  return (
    <Link
      href={`/stock/${ticker}`}
      className="group grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[1.4fr_auto_auto_auto_auto] items-center gap-4 px-4 sm:px-5 py-4 border-b border-tp-line hover:bg-tp-ink/[0.02] transition-colors"
    >
      <div className="min-w-0">
        <span className="font-mono text-sm font-semibold text-tp-ink">{ticker}</span>
      </div>

      <div className="font-mono text-sm text-tp-ink text-right tabular-nums">
        ${fmt(quote.price)}
      </div>

      <div className="hidden sm:block text-right">
        <span className="font-mono text-xs text-tp-ink2">
          {fmt(quote.high)} / {fmt(quote.low)}
        </span>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Sparkline data={sparkData.map((p) => p.close)} width={72} height={24} color={color} />
        <ChangeBadge value={quote.percentChange} />
      </div>

      <button
        onClick={(e) => { e.preventDefault(); onRemove(ticker); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-tp-ink2 hover:text-tp-rust text-xs p-1 rounded-sm justify-self-end"
        aria-label={`Remove ${ticker}`}
      >
        ✕
      </button>
    </Link>
  );
}

export default function DashboardPage() {
  const { tickers, hydrated, addTickers, removeTickers, hasTickers } = useWatchlist();
  const { quotes, loading, error, refresh, fetchedAt } = useQuotes(hydrated ? tickers : []);

  const lastUpdated = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString()
    : undefined;

  const profiles: Record<string, { sector?: string; logo?: string }> = {};

  const quotedTickers = tickers.filter((t) => quotes[t]);
  const gainers = quotedTickers.filter((t) => quotes[t].percentChange> 0).length;
  const losers  = quotedTickers.filter((t) => quotes[t].percentChange < 0).length;


  return (
    <div className="flex h-screen overflow-hidden bg-tp-paper">
      <WatchlistPanel
        tickers={tickers}
        quotes={quotes}
        charts={{}}
        profiles={profiles}
        loading={loading}
        onAdd={addTickers}
        onRemove={removeTickers}
        hasTicker={hasTickers}
        lastUpdated={lastUpdated}
        onRefresh={refresh}
      />

      <main className="hidden md:flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center px-6 sm:px-8 py-5 border-b border-tp-line bg-tp-surf flex-shrink-0">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-tp-ink">
              Watchlist
            </h1>
            <p className="text-[13px] text-tp-ink2 mt-0.5">
              {hydrated ? `${tickers.length} stock${tickers.length === 1 ? "" : "s"} tracked` : "Loading watchlist"}
              {error && <span className="text-tp-rust"> — {error.message}</span>}
            </p>
          </div>
          <div className="flex-1" />
          {quotedTickers.length > 0 && (
            <div className="flex items-center gap-3 mr-4 font-mono text-xs">
              <span className="text-tp-teal">▲ {gainers}</span>
              <span className="text-tp-ink3">/</span>
              <span className="text-tp-rust">▼ {losers}</span>
            </div>
          )}
          <AuthStatus />
        </header>

        <div className="flex-1 overflow-y-auto">
          {!hydrated ? (
            <div>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[1.4fr_auto_auto_auto_auto] items-center gap-4 px-4 sm:px-5 py-4 border-b border-tp-line">
                  <div className="h-4 w-16 bg-tp-line/50 rounded-sm animate-shimmer bg-[linear-gradient(90deg,#DDCBAE_25%,#EADFC7_50%,#DDCBAE_75%)] bg-[length:200%_100%]" />
                  <div className="h-4 w-14 bg-tp-line/50 rounded-sm animate-shimmer bg-[linear-gradient(90deg,#DDCBAE_25%,#EADFC7_50%,#DDCBAE_75%)] bg-[length:200%_100%]" />
                  <div className="h-4 w-12 bg-tp-line/50 rounded-sm animate-shimmer bg-[linear-gradient(90deg,#DDCBAE_25%,#EADFC7_50%,#DDCBAE_75%)] bg-[length:200%_100%] hidden sm:block" />
                  <div className="h-6 w-16 bg-tp-line/50 rounded-sm animate-shimmer bg-[linear-gradient(90deg,#DDCBAE_25%,#EADFC7_50%,#DDCBAE_75%)] bg-[length:200%_100%]" />
                  <div />
                </div>
              ))}
            </div>
          ) : tickers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="font-serif text-lg text-tp-ink mb-1">Your watchlist is empty</div>
              <p className="text-tp-ink2 text-sm">Use + Add ticker in the sidebar to get started</p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[1.4fr_auto_auto_auto_auto] items-center gap-4 px-4 sm:px-5 py-2.5 border-b border-tp-line text-[11px] text-tp-ink2">
                <div>Ticker</div>
                <div className="text-right">Price</div>
                <div className="text-right hidden sm:block">High / Low</div>
                <div className="text-right">Change</div>
                <div />
              </div>
              {tickers.map((ticker) => (
                <StockRowLedger
                  key={ticker}
                  ticker={ticker}
                  quote={quotes[ticker] ?? null}
                  sparkData={[]}
                  onRemove={removeTickers}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}