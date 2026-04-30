# TechPulse — Stock Dashboard PWA

A real-time tech stock watchlist built with **Next.js 14**, **Tailwind CSS**, and three free-tier stock APIs. Installable as a PWA on desktop and mobile.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + Space Grotesk / Space Mono |
| Data fetching | SWR (client) + Route Handlers (server proxy) |
| PWA | next-pwa + Workbox service worker |
| Persistence | localStorage (watchlist) |
| Types | TypeScript strict |

---

## API sources

| Source | Free tier | Used for | Cache TTL |
|---|---|---|---|
| **Finnhub** | 60 req/min | Real-time quotes, company profile | 60s |
| **Alpha Vantage** | 25 req/day | Daily OHLCV chart history | 24h |
| **FMP** | 250 req/day | Market cap, P/E, EPS, beta, ratios | 24h |

All API calls are proxied through Next.js Route Handlers.

A server-side in-memory TTL cache (`lib/cache.ts`) sits in front of every external API call to absorb repeated requests across users and page reloads.