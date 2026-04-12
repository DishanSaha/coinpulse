# CryptoPulse — Frontend Design Document

**Project:** CryptoPulse — Real-Time Crypto Analytics Terminal
**Role:** Frontend Engineer
**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui
**Doc Version:** 1.0
**Status:** Ready for Sprint Assignment

---

## 1. Project Overview

CryptoPulse is a real-time cryptocurrency analytics terminal. Your responsibility as the frontend engineer is to build a polished, performant, and data-rich UI that consumes REST APIs served by the backend teammate and connects directly to WebSocket streams for live price updates.

This is a production-grade project. Code quality, component architecture, and UX decisions will be reviewed. Treat this the same as you would a professional client engagement.

---

## 2. Architecture Overview

```
app/
├── layout.tsx                  # Root layout, providers, navbar
├── page.tsx                    # Home — Global Market Dashboard
├── tokens/
│   └── page.tsx                # Token Explorer (searchable table)
├── tokens/[id]/
│   └── page.tsx                # Token Detail Page
├── components/
│   ├── ui/                     # shadcn base components (do not edit)
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── market/
│   │   ├── GlobalStatsBanner.tsx
│   │   ├── TrendingTokensCarousel.tsx
│   │   └── MarketSummaryCard.tsx
│   ├── tokens/
│   │   ├── TokensTable.tsx
│   │   ├── TokenTableRow.tsx
│   │   ├── TokenSearchBar.tsx
│   │   └── TokenFilters.tsx
│   └── detail/
│       ├── TokenHero.tsx
│       ├── PriceChart.tsx
│       ├── LivePriceTicker.tsx
│       ├── ExchangeTable.tsx
│       └── TokenStats.tsx
├── hooks/
│   ├── useWebSocket.ts
│   ├── useTokenSearch.ts
│   └── usePriceHistory.ts
├── lib/
│   ├── api.ts                  # REST API client (calls .NET backend)
│   ├── ws.ts                   # WebSocket client manager
│   └── formatters.ts           # Currency, % change, large number formatting
└── types/
    └── index.ts                # All shared TypeScript types
```

---

## 3. Pages & Features

### 3.1 Home Page — Global Market Dashboard (`/`)

**Purpose:** Landing page giving users an instant pulse on the market.

**Sections:**

**A. Global Stats Banner**
- A sticky top-of-page horizontal bar showing:
  - Total Market Cap (e.g. `$2.41T`)
  - 24h Market Cap Change % — colored green/red
  - Total 24h Volume
  - BTC Dominance %
  - ETH Dominance %
  - Active Cryptocurrencies count
- Data source: `GET /api/global` (backend endpoint)
- Refresh: poll every 60 seconds

**B. Trending Tokens Carousel**
- Horizontally scrollable card strip showing top 10 trending tokens
- Each card shows: token logo, symbol, name, current price, 24h % change badge
- Auto-scrolls slowly (CSS animation), pauses on hover
- Data source: `GET /api/trending`
- Refresh: every 2 minutes

**C. Market Summary Cards**
- 3 summary cards: Top Gainers · Top Losers · Highest Volume
- Each card lists 5 tokens with name, price, and % change
- Data source: `GET /api/tokens?sort=price_change_percentage_24h&order=desc&per_page=5` and equivalents

---

### 3.2 Token Explorer Page — `/tokens`

**Purpose:** A searchable, sortable, paginated table of all major tokens.

**Features:**

**A. Search Bar**
- Real-time client-side filtering by name or symbol
- Debounced input (300ms) using `useTokenSearch` hook
- Shows "No results" empty state with icon

**B. Token Table**

| Column | Description |
|---|---|
| # | Market rank |
| Token | Logo + Name + Symbol |
| Price | Current USD price |
| 1h % | 1-hour price change, colored |
| 24h % | 24-hour price change, colored |
| 7d % | 7-day price change, colored |
| 24h Volume | Formatted (e.g. `$1.2B`) |
| Market Cap | Formatted |
| 7d Sparkline | Mini SVG line chart (50px wide) |

- Column headers are clickable to sort ascending/descending
- Rows are clickable → navigate to `/tokens/[id]`
- Row hover effect with smooth background transition
- Data source: `GET /api/tokens?page=1&per_page=50`

**C. Pagination**
- Show 50 tokens per page
- Previous / Next / page number controls using shadcn `Pagination`

**D. Live Price Updates**
- Price and % change columns update in real-time via WebSocket
- Flash green on price increase, red on price decrease (300ms transition)

---

### 3.3 Token Detail Page — `/tokens/[id]`

**Purpose:** Deep-dive analytics page for a single token.

**Sections:**

**A. Token Hero**
- Large token logo, full name, symbol, CoinGecko rank badge
- Current price (large, live-updating)
- Price change badges: 1h / 24h / 7d / 30d / 1y
- All-time high & all-time low with dates
- Links: official website, whitepaper, explorer (from token metadata)
- Data source: `GET /api/tokens/:id`

**B. Price Chart**
- Interactive OHLC / line chart using `recharts` or `lightweight-charts`
- Time range selector: `1D · 1W · 1M · 3M · 1Y · ALL`
- On range change → fetch new data from `GET /api/tokens/:id/chart?days=7`
- Shows volume bars at the bottom as secondary axis
- Tooltip on hover showing price + volume + date

**C. Live Price Ticker**
- Connects to WebSocket: `wss://[backend]/ws/price/:id`
- Displays: current bid, ask, last trade price, 24h high, 24h low
- Pulses / flashes on every new tick
- Shows connection status indicator (green dot = live, grey = reconnecting)

**D. Token Stats Grid**
- Two-column stat grid:
  - Market Cap · Fully Diluted Valuation
  - 24h Trading Volume · Volume/Market Cap ratio
  - Circulating Supply · Total Supply · Max Supply
  - Market Cap Rank · CoinGecko Score

**E. Exchange Listings Table**
- Table of exchanges where this token trades
- Columns: Exchange Name, Pair, Price, +2% Depth, -2% Depth, 24h Volume, Trust Score badge
- Sortable by volume
- Data source: `GET /api/tokens/:id/exchanges`

---

## 4. WebSocket Integration

The backend exposes a WebSocket server. You will build a client manager in `lib/ws.ts`.

**Behavior requirements:**
- Singleton WebSocket connection per session
- Subscribe/unsubscribe to token channels by ID
- Automatic reconnect with exponential backoff (max 5 retries)
- Emit events to subscribed React components via a pub/sub pattern or Zustand store

**Hook interface (`useWebSocket.ts`):**
```typescript
const { price, change24h, isConnected } = useWebSocket(tokenId: string)
```

**Expected WebSocket message shape (from backend):**
```json
{
  "type": "price_update",
  "tokenId": "bitcoin",
  "price": 67432.12,
  "change24h": 2.34,
  "volume24h": 38200000000,
  "timestamp": "2024-11-20T14:32:00Z"
}
```

---

## 5. API Integration

All REST calls go through `lib/api.ts`. Never call the backend directly from components. The base URL should be read from `NEXT_PUBLIC_API_BASE_URL` env variable.

**Typed API functions to implement:**

```typescript
// lib/api.ts
export const api = {
  getGlobalStats(): Promise<GlobalStats>
  getTrendingTokens(): Promise<TrendingToken[]>
  getTokens(params: TokenQueryParams): Promise<TokenListItem[]>
  getTokenById(id: string): Promise<TokenDetail>
  getTokenChart(id: string, days: number): Promise<ChartDataPoint[]>
  getTokenExchanges(id: string): Promise<ExchangeListing[]>
}
```

All functions must handle loading, error, and empty states. Use `TanStack Query` (`@tanstack/react-query`) for caching and background refetching.

---

## 6. State Management

| Concern | Solution |
|---|---|
| Server data / caching | TanStack Query |
| WebSocket live prices | Zustand store (`usePriceStore`) |
| UI state (filters, sort) | `useState` / URL search params |
| Theme (dark/light) | `next-themes` |

**Price Store shape:**
```typescript
interface PriceStore {
  prices: Record<string, LivePrice>
  updatePrice: (tokenId: string, data: LivePrice) => void
}
```

---

## 7. TypeScript Types

Define all types in `types/index.ts` before building components. Coordinate with the backend teammate on exact field names to keep them aligned.

```typescript
interface GlobalStats {
  totalMarketCap: number
  totalVolume24h: number
  btcDominance: number
  ethDominance: number
  marketCapChangePercent24h: number
  activeCryptocurrencies: number
}

interface TokenListItem {
  id: string
  rank: number
  name: string
  symbol: string
  image: string
  currentPrice: number
  priceChange1h: number
  priceChange24h: number
  priceChange7d: number
  volume24h: number
  marketCap: number
  sparklineData: number[]
}

interface TokenDetail extends TokenListItem {
  description: string
  homepage: string
  whitepaper: string
  ath: number
  athDate: string
  atl: number
  atlDate: string
  circulatingSupply: number
  totalSupply: number
  maxSupply: number | null
  fullyDilutedValuation: number | null
  coingeckoScore: number
}

interface ChartDataPoint {
  timestamp: number
  price: number
  volume: number
}

interface ExchangeListing {
  exchangeId: string
  exchangeName: string
  exchangeLogo: string
  pair: string
  price: number
  volume24h: number
  depthPlus2: number
  depthMinus2: number
  trustScore: 'green' | 'yellow' | 'red'
}

interface LivePrice {
  price: number
  change24h: number
  volume24h: number
  timestamp: string
}
```

---

## 8. UI/UX Requirements

**Theme:**
- Dark mode by default (crypto terminal aesthetic)
- Tailwind `dark:` classes throughout
- `next-themes` with toggle in navbar
- Neutral dark backgrounds (`zinc-950`, `zinc-900`) with bright accent (`emerald-400` for gains, `rose-500` for losses)

**Formatting rules (`lib/formatters.ts`):**
- Prices < $1 → 6 decimal places; prices > $1 → 2 decimal places
- Large numbers → abbreviated (K / M / B / T)
- Positive % → prefix `+`, color green; Negative → color red
- Dates → `MMM DD, YYYY` format

**Performance:**
- Use `next/image` for all token logos with explicit `width` and `height`
- Memoize `TokenTableRow` with `React.memo` to prevent table re-renders on WebSocket updates
- Virtualize the token table if row count exceeds 100 (use `@tanstack/react-virtual`)

**Accessibility:**
- All interactive elements must have `aria-label`
- Price change % must include screen-reader text: e.g. "increased by 2.34%"
- Keyboard navigation must work on the token table

---

## 9. Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000
```

---

## 10. Task Breakdown (Sprint-Ready)

> These map directly to ClickUp tasks. Each task = one logical unit of shippable work.

### EPIC 1 — Project Setup & Infrastructure

| Task ID | Task | Est. |
|---|---|---|
| FE-001 | Initialize Next.js 14 project with TypeScript, Tailwind, shadcn/ui | 2h |
| FE-002 | Set up folder structure, path aliases, env variables | 1h |
| FE-003 | Install & configure TanStack Query, Zustand, next-themes | 1h |
| FE-004 | Build `lib/api.ts` with typed API client skeleton | 2h |
| FE-005 | Define all TypeScript types in `types/index.ts` | 1h |
| FE-006 | Build `lib/formatters.ts` (currency, %, large numbers) | 1h |
| FE-007 | Build root layout: Navbar, Footer, provider wrappers | 2h |

### EPIC 2 — Home Dashboard

| Task ID | Task | Est. |
|---|---|---|
| FE-008 | Build `GlobalStatsBanner` component with API integration | 3h |
| FE-009 | Build `TrendingTokensCarousel` with auto-scroll animation | 3h |
| FE-010 | Build `MarketSummaryCard` (gainers/losers/volume) | 2h |
| FE-011 | Assemble Home page, loading skeletons, error states | 2h |

### EPIC 3 — Token Explorer

| Task ID | Task | Est. |
|---|---|---|
| FE-012 | Build `TokenSearchBar` with debounce hook | 2h |
| FE-013 | Build `TokensTable` with all columns and sort logic | 4h |
| FE-014 | Build sparkline mini-chart SVG component | 2h |
| FE-015 | Add pagination using shadcn Pagination | 1h |
| FE-016 | Integrate TanStack Query for tokens list | 2h |
| FE-017 | Connect WebSocket live price flashing to table rows | 3h |

### EPIC 4 — Token Detail Page

| Task ID | Task | Est. |
|---|---|---|
| FE-018 | Build `TokenHero` with metadata and price badges | 3h |
| FE-019 | Integrate price chart with recharts + time range selector | 4h |
| FE-020 | Build `LivePriceTicker` with WebSocket hook | 3h |
| FE-021 | Build `TokenStats` two-column grid | 2h |
| FE-022 | Build `ExchangeTable` with sortable columns | 3h |
| FE-023 | Assemble Token Detail page with all sections | 2h |

### EPIC 5 — WebSocket Client

| Task ID | Task | Est. |
|---|---|---|
| FE-024 | Build `lib/ws.ts` — singleton manager, pub/sub, reconnect logic | 4h |
| FE-025 | Build `useWebSocket` hook | 2h |
| FE-026 | Build Zustand `usePriceStore` | 1h |
| FE-027 | Integration test: WS updates reflect in table + detail page | 2h |

### EPIC 6 — Polish & QA

| Task ID | Task | Est. |
|---|---|---|
| FE-028 | Add loading skeletons to all data-fetching sections | 2h |
| FE-029 | Add error boundary and graceful error states | 2h |
| FE-030 | Accessibility audit (aria labels, keyboard nav) | 2h |
| FE-031 | Performance audit — memoization, image optimization, bundle | 2h |
| FE-032 | Responsive design pass — mobile & tablet breakpoints | 3h |
| FE-033 | Final QA pass and bug fixes | 3h |

---

## 11. Definition of Done

A task is considered **done** when:

- [ ] Component renders correctly with real API data (not mocked)
- [ ] Loading state is handled with skeleton UI
- [ ] Error state is handled with user-facing message
- [ ] TypeScript has zero `any` types in new code
- [ ] No console warnings or errors in browser
- [ ] Responsive on mobile (375px), tablet (768px), and desktop (1280px)
- [ ] Dark mode renders correctly

---

## 12. Coordination Points with Backend Teammate

These are the integration touchpoints you must align on **before** building:

| Item | Action |
|---|---|
| Base URL & port | Confirm backend runs on expected port |
| All REST endpoint paths | Review backend doc, ensure `api.ts` paths match |
| WebSocket message schema | Agree on field names before building WS hook |
| TypeScript types | Share `types/index.ts` with backend for field alignment |
| CORS policy | Backend must allow `localhost:3000` in dev |
| Auth headers (if any) | Confirm if API key or JWT is needed |

---

*Document maintained by Team Lead. For questions, raise a ClickUp comment on the relevant task.*