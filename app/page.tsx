"use client";

import { useWatchlist } from "@/hooks/useWatchlist";
import { useQuotes } from "@/hooks/useStockData";
import { WatchlistPanel } from "@/components/watchlist/WatchlistPanel";
import { ChangeBadge } from "@/components/ui";
import { Sparkline } from "@/components/charts/Sparkline";
import Link from "next/link";
import type { ChartPoint, Quote } from "@/types/stock";

function fmt(n: number | null | undefined) {
  if (n == null) return "N/A";
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StockCard({ ticker, quote, sparkData, onRemove }: {
  ticker: string;
  quote: Quote | null;
  sparkData: ChartPoint[];
  onRemove: (t: string) => void;
}) {
  const up = (quote?.percentChange ?? 0) >= 0;
  const color = up ? "#00e68e" : "#ff5252";

  return (
    <Link
      href={`/stock/${ticker}`}
      className="group bg-tp-card border border-tp-border rounded-2xl p-5 hover:border-tp-accent/30 hover:bg-tp-card/80 transition-all block"
    >
      {/* Header row: ticker + price | remove button */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-mono text-base font-bold text-tp-primary">{ticker}</div>
          {quote ? (
            <div className="font-mono text-2xl font-bold text-tp-primary mt-1 leading-none">
              ${fmt(quote.price)}
            </div>
          ) : (
            <div className="h-7 w-24 bg-tp-border rounded animate-pulse mt-1" />
          )}
        </div>
        <button
          onClick={(e) => { e.preventDefault(); onRemove(ticker); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-tp-muted hover:text-tp-red text-xs p-1 rounded"
        >
          ✕
        </button>
      </div>

      {/* Sparkline */}
      <div className="mb-4">
        <Sparkline
          data={sparkData.map((p) => p.close)}
          width={160}
          height={40}
          color={color}
        />
      </div>

      {/* Footer row: change badge | high/low */}
      {quote ? (
        <div className="flex items-center justify-between">
          <ChangeBadge value={quote.percentChange} />
          <span className="font-mono text-xs text-tp-muted">
            H: ${fmt(quote.high)} · L: ${fmt(quote.low)}
          </span>
        </div>
      ) : (
        <div className="h-5 w-32 bg-tp-border rounded animate-pulse" />
      )}
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

  // IDEIGLENES DEBUG — töröld el ha megvan a hiba
console.log("hydrated:", hydrated);
console.log("tickers:", tickers);
console.log("quotes:", quotes);

  return (
    <div className="flex h-screen overflow-hidden bg-tp-bg">
      {/* Sidebar */}
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

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center px-8 py-4 border-b border-tp-border bg-tp-surf flex-shrink-0">
          <div>
            <h1 className="font-mono text-sm font-bold text-tp-primary tracking-wide">
              Watchlist Overview
            </h1>
            <p className="text-[11px] text-tp-muted mt-0.5">
              {hydrated ? `${tickers.length} stocks · ` : ""}
              {error
                ? <span className="text-tp-red">⚠ {error.message}</span>
                : "Live via Finnhub · Yahoo Finance"}
            </p>
          </div>
          <div className="flex-1" />
          {quotedTickers.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-tp-accent" />
                <span className="text-tp-sec">{gainers} up</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-tp-red" />
                <span className="text-tp-sec">{losers} down</span>
              </div>
            </div>
          )}
        </header>

        {/* Stock grid */}
        <div className="flex-1 overflow-y-auto p-8">
          {!hydrated ? (
            // Skeleton placeholders while localStorage hydrates
            <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-tp-card border border-tp-border rounded-2xl p-5 h-[172px] animate-shimmer bg-[linear-gradient(90deg,#1c2a1e_25%,#243428_50%,#1c2a1e_75%)] bg-[length:200%_100%]" />
              ))}
            </div>
          ) : tickers.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-tp-muted font-mono text-sm mb-2">Your watchlist is empty</div>
              <p className="text-tp-muted text-xs">Use + Add Ticker in the sidebar to get started</p>
            </div>
          ) : (
            // Stock cards
            <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {tickers.map((ticker) => (
                <StockCard
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