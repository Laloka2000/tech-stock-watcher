# TechPulse — Stock Dashboard PWA

A real-time tech stock watchlist and portfolio tracker built with **Next.js 14**, **Tailwind CSS**, and three free-tier stock market APIs. Installable as a Progressive Web App (PWA) on both desktop and mobile.

---

## Features

- **Real-time quotes** — live prices, change %, daily high/low, open/prev-close, volume (auto-refreshed every 60 s)
- **Interactive price chart** — daily OHLCV candlestick history with selectable ranges: 1W · 1M · 3M
- **Sparklines** — compact trend lines on every watchlist row and stock card
- **Fundamental data** — market cap, P/E, EPS, beta, 52-week high/low, dividend yield, ROE, debt/equity, revenue growth YoY
- **Company profile** — logo, sector, industry, exchange, website (Finnhub)
- **Persistent watchlist** — stored in `localStorage`, pre-seeded with 10 large-cap tech stocks; supports add, remove, and reorder
- **PWA / installable** — works offline (service worker via Workbox), "Add to Home Screen" on mobile, shortcut to the dashboard
- **Dark-only UI** — deep green-tinted dark theme with Space Grotesk + Space Mono typography

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Fonts | Space Grotesk · Space Mono (Google Fonts) |
| Data fetching | SWR (client) + Route Handlers (server proxy) |
| PWA | next-pwa + Workbox service worker |
| Persistence | `localStorage` (watchlist) |
| Server cache | In-memory TTL cache (`lib/cache.ts`) |
| Types | TypeScript (strict) |

---

## API Sources

All external calls are proxied through Next.js Route Handlers — your API keys are never exposed to the browser.

| Source | Free Tier | Used For | Server Cache TTL |
|---|---|---|---|
| **Finnhub** | 60 req / min | Real-time quotes, company profile, fundamentals (P/E, EPS, beta, 52-week range, dividend yield, ROE, debt/equity, revenue growth) | 60 s (quotes) · 24 h (profile) |
| **Yahoo Finance** | No key required | Daily OHLCV chart history | 24 h |

A lightweight in-memory cache (`lib/cache.ts`) sits in front of every outbound API call and absorbs repeated requests across users and page reloads.

---

## Project Structure

```
tech-stock-watcher/
├── app/
│   ├── page.tsx                  # Dashboard (watchlist overview)
│   ├── layout.tsx                # Root layout, metadata, PWA meta
│   ├── globals.css               # Tailwind base + custom scrollbar
│   └── api/
│       ├── quotes/route.ts       # GET /api/quotes?symbols=NVDA,MSFT,...
│       ├── chart/[ticker]/route.ts   # GET /api/chart/:ticker?range=5Y
│       └── profile/[ticker]/route.ts # GET /api/profile/:ticker
├── app/stock/[ticker]/
│   └── page.tsx                  # Stock detail page
├── components/
│   ├── watchlist/
│   │   ├── WatchlistPanel.tsx    # Sidebar with stock list + portfolio bar
│   │   ├── StockRow.tsx          # Single row (ticker, price, sparkline)
│   │   └── AddTickerModal.tsx    # Modal for adding a new ticker
│   ├── charts/
│   │   ├── PriceChart.tsx        # Full SVG OHLCV chart with range selector
│   │   └── Sparkline.tsx         # Compact inline sparkline
│   └── ui/                       # Shared primitives (ChangeBadge, MetricCard, Skeletons)
├── hooks/
│   ├── useStockData.ts           # SWR hooks: useQuotes, useChart, useProfile
│   └── useWatchlist.ts           # localStorage-backed watchlist state
├── lib/
│   ├── cache.ts                  # Server-side in-memory TTL cache
│   └── api/
│       ├── finnhub.ts            # Finnhub client (quotes, profile, fundamentals/metrics)
│       └── yahoo.ts              # Yahoo Finance client (daily OHLCV chart, no API key needed)
├── types/
│   └── stock.ts                  # Shared TypeScript interfaces
├── public/
│   ├── manifest.json             # PWA manifest
│   └── icons/                    # App icons (192 × 192, 512 × 512)
├── next.config.js                # next-pwa config + Workbox caching rules
└── tailwind.config.ts            # Design tokens (tp-bg, tp-accent, etc.)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A free API key from Finnhub:
  - [Finnhub](https://finnhub.io/) — sign up, key is on the dashboard

> Yahoo Finance data is fetched via an unofficial endpoint and requires no API key.

### Installation

```bash
git clone https://github.com/your-username/tech-stock-watcher.git
cd tech-stock-watcher
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
FINNHUB_API_KEY=your_finnhub_key_here
```

> This variable is **server-side only** (no `NEXT_PUBLIC_` prefix) so it is never shipped to the browser.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> The PWA service worker is **disabled in development** to avoid stale caches interfering with hot reload. It is enabled automatically in production builds.

### Production Build

```bash
npm run build
npm start
```

---

## Deployment (Vercel)

1. Push your repo to GitHub.
2. Import the project on [vercel.com](https://vercel.com) → **Add New Project**.
3. During import, add the environment variable under **Environment Variables**:
   - `FINNHUB_API_KEY`
4. Click **Deploy**. Vercel auto-detects Next.js; no extra config needed.

Every subsequent `git push` to `main` triggers an automatic redeploy.

---

## Caching Strategy

The app uses a two-level cache to protect free-tier rate limits:

| Level | Mechanism | Quotes TTL | Chart / Profile TTL |
|---|---|---|---|
| **Server** | `lib/cache.ts` (in-memory Map) | 60 s | 24 h |
| **HTTP** | `Cache-Control` header | `max-age=60, stale-while-revalidate=30` | `max-age=86400, stale-while-revalidate=3600` |
| **PWA / SW** | Workbox `NetworkFirst` / `CacheFirst` | 60 s | 24 h |
| **SWR** | Client dedup + refresh interval | `refreshInterval: 60 000 ms` | `dedupingInterval: 86 400 000 ms` |

---

## Default Watchlist

The app ships with 10 pre-seeded tickers on first visit:

`NVDA` · `GOOGL` · `MSFT` · `AAPL` · `META` · `AMD` · `TSLA` · `AMZN` · `NFLX` · `TSM`

The list is persisted to `localStorage` under the key `tp_watchlist` and can be freely customized.

---

## Key Components

### `useWatchlist` hook
Manages the watchlist state in `localStorage`. Provides `addTickers`, `removeTickers`, `reorderTickers`, and `hasTickers`. Handles SSR hydration safely to avoid mismatches.

### `useQuotes` hook
SWR-powered batch quote fetcher. Polls `/api/quotes?symbols=...` every 60 seconds. Revalidates on window focus.

### `useChart` hook
Fetches daily OHLCV data from `/api/chart/:ticker?range=X`. Supports ranges up to 3 months (1W · 1M · 3M). Long dedup interval (24 h) since chart data is cached aggressively on the server.

### `useProfile` hook
Fetches company profile and fundamentals (P/E, EPS, beta, 52-week range, etc.) entirely from Finnhub via `/api/profile/:ticker`. Same 24-hour dedup as charts.

### `lib/cache.ts`
A minimal in-memory key-value store with TTL support. The `getOrFetch` helper pattern ensures each external API is called at most once per TTL window, even under concurrent requests.

---

## Design System

Custom Tailwind design tokens (prefix `tp-`):

| Token | Value | Usage |
|---|---|---|
| `tp-bg` | `#070c09` | Page background |
| `tp-surf` | sidebar / header surface | Secondary surfaces |
| `tp-card` | stock card background | Cards |
| `tp-border` | subtle border color | Dividers |
| `tp-primary` | `#e8f2e8` | Primary text |
| `tp-muted` | dimmed text | Labels, meta |
| `tp-accent` | `#00e68e` | Green — positive / brand |
| `tp-red` | `#ff5252` | Red — negative |

---

## License

MIT