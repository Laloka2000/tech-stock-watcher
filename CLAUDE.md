# TechPulse — Tech Stock Watcher

A personal stock watchlist dashboard. Next.js 14 (App Router) + TypeScript + Tailwind CSS.
Client-side data fetching via SWR; watchlist persisted in `localStorage`, not a database.

## Tech stack

- Next.js 14.2 (App Router), React 18, TypeScript
- Tailwind CSS 3 for styling (no CSS-in-JS)
- SWR for client-side data fetching/polling
- Supabase (`@supabase/ssr`, `@supabase/supabase-js`) for auth — **work in progress, see Gotchas**
- Data sources: Finnhub (quotes, company profile, fundamentals) and Yahoo Finance (historical chart data)
- `next-pwa` for PWA support

## Design system

As of 2026-09, the UI is a warm "financial ledger" theme (editorial print/newspaper feel), not the
original dark neon-green terminal look. When adding UI, match this system rather than inventing new
tokens:

- **Colors** (`tailwind.config.ts`, `tp.*` namespace): `paper` (page bg), `surf` (card/panel bg),
  `line` (hairline borders), `ink`/`ink2`/`ink3` (primary/secondary/tertiary text), `teal` (accent,
  positive/up), `rust` (negative/down), `gold` (neutral/tertiary accent).
- **Type**: `font-serif` (Fraunces) for the masthead and hero/display prices only. `font-sans` (IBM
  Plex Sans) for UI chrome and body text. `font-mono` (IBM Plex Mono) strictly for tabular/aligned
  numbers and ticker symbols.
- **Shape**: minimal radius (`rounded-sm`, ~2-4px) everywhere, no drop shadows. Structure comes from
  hairline borders (`border-tp-line`) and ledger-style tables (right-aligned numeric columns), not
  rounded shadow cards.
- **Icons**: use `components/ui/icons.tsx` (small inline SVGs — `ArrowLeftIcon`, `CloseIcon`,
  `RefreshIcon`, `TriangleUpIcon`/`TriangleDownIcon`, `AlertIcon`, `CheckIcon`). Never use Unicode
  glyphs (✕ ↻ ← ▲ ▼ ⚠ ✓) for icons — they render inconsistently across platforms/fonts, which is
  exactly why they were replaced.
- Avoid ALL-CAPS tracking-widest labels and middle-dot-joined meta strings — sentence case, minimal
  decoration.

## Key architecture notes

- **Watchlist storage**: `hooks/useWatchlist.ts` reads/writes `localStorage["tp_watchlist"]` as
  `WatchlistEntry[]` — i.e. `{ ticker: string, addedAt: string }[]`, **not** a plain string array.
  Seeds sensible defaults (NVDA, GOOGL, MSFT, AAPL, META, AMZN) on first visit if nothing is stored.
- **Data fetching**: `hooks/useStockData.ts` wraps SWR (`useQuotes`, `useChart`, `useProfile`).
  `/api/quotes` expects a `symbols` query param (comma-joined tickers), not `tickers`.
- **Chart tooltip gotcha**: `components/charts/PriceChart.tsx` renders an SVG with a fixed viewBox
  (`W=780, H=240`) scaled to 100% width via CSS. The hover/touch tooltip is an absolutely-positioned
  HTML div *outside* the SVG — its position must be computed as a **percentage of the container**
  (`(xOf(i)/W)*100 + "%"`), never raw viewBox pixel values, or it drifts off-screen once the SVG
  renders narrower than its viewBox (this broke badly on mobile before the 2026-09 fix). The chart
  needs both `onMouseMove` and `onTouchMove`/`onTouchStart`/`onTouchEnd` handlers to work on touch
  devices — don't rely on synthesized mouse events.
- **Mobile layout**: `app/page.tsx`'s dashboard `<main>` is `hidden md:flex` — on mobile the sidebar
  (`WatchlistPanel`) *is* the whole app (masthead, summary, ticker list, add button all live there).
  Don't reintroduce a duplicate mobile view in `<main>`.

## Gotchas / incomplete work

- **Supabase auth is mid-implementation.** `middleware.ts`, `app/login`, `app/register`,
  `app/auth/callback`, and `components/auth/AuthStatus.tsx` exist and expect
  `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`. **These are not
  currently set** — only `FINNHUB_API_KEY` is. Without them, `middleware.ts` throws on every request
  and the dev server 500s on all routes. If you need to run the app locally and don't have real
  Supabase credentials, you can temporarily add syntactically-valid placeholder values to
  `.env.local` (it's gitignored) to get past the "URL and Key are required" throw — but
  `supabase.auth.getUser()` will still fail against a fake backend, so login/register won't actually
  work, only the rest of the UI will render.
- Some auth-page copy (`app/login`, `app/register`) is in Hungarian while the rest of the app is in
  English. This was pre-existing/intentional as of the last touch — don't "fix" the language without
  asking, only restyle if touching those files.
- A couple of fundamentals values from Finnhub (e.g. ROE, revenue growth YoY on the stock detail page)
  render as absurd percentages (e.g. `13718.0%`) — that's a raw upstream data/formatting issue in
  `lib/api/finnhub.ts`, not something fixed in the 2026-09 redesign pass.

## Dev environment notes (Windows)

- Runs via `npm run dev` on port 3000. To restart cleanly: find the PID with
  `netstat -ano | grep ":3000 " | grep LISTENING` and `taskkill //F //PID <pid>` (Git Bash / MSYS
  syntax) before relaunching, or you'll hit `EADDRINUSE`.
- No `chromium-cli` available in this environment for the `run` skill's browser-driven pattern. Fall
  back to a temporary local Playwright install for visual verification:
  `npm install --no-save --no-package-lock playwright && npx playwright install chromium`, write a
  throwaway script *inside the project directory* (module resolution needs it there, not just in a
  scratchpad), run it, then `npm uninstall playwright --no-save` and delete the script when done.
  Keep screenshots in the session scratchpad, not the repo.
- `@supabase/ssr`/`@supabase/supabase-js` are declared in `package.json` but may not be present in
  `node_modules` if `npm install` hasn't been run since they were added — check before assuming the
  app builds.

## Commit conventions

- Conventional-ish prefixes seen in history: `feat:`, `fix:`, `redesign:`. Keep using them.
- Don't commit without the user's explicit go-ahead for that specific batch of changes, even mid-task.
