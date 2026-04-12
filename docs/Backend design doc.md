# CryptoPulse — Backend Design Document

**Project:** CryptoPulse — Real-Time Crypto Analytics Terminal
**Role:** Backend Engineer
**Stack:** .NET 8 · ASP.NET Core Web API · SignalR · C#
**Doc Version:** 1.0
**Status:** Ready for Sprint Assignment

---

## 1. Project Overview

CryptoPulse is a real-time cryptocurrency analytics terminal. Your responsibility as the backend engineer is to build a robust, well-structured ASP.NET Core API that acts as an intelligent proxy and aggregator layer between the CoinGecko API and the frontend client.

You will also run a real-time WebSocket server (using ASP.NET Core SignalR) that streams live price data to connected frontend clients with sub-second latency.

This is a production-grade project. Architecture decisions, code organization, error handling, and API design will be reviewed. Treat this as a professional engagement.

---

## 2. Architecture Overview

```
CryptoPulse.API/
├── Program.cs
├── appsettings.json
├── appsettings.Development.json
│
├── Controllers/
│   ├── GlobalController.cs
│   ├── TokensController.cs
│   └── TrendingController.cs
│
├── Hubs/
│   └── PriceHub.cs                  # SignalR hub for live price streaming
│
├── Services/
│   ├── Interfaces/
│   │   ├── ICoinGeckoService.cs
│   │   ├── IMarketDataService.cs
│   │   └── IPriceStreamService.cs
│   ├── CoinGeckoService.cs          # HTTP client wrapper for CoinGecko REST API
│   ├── MarketDataService.cs         # Business logic, data shaping
│   └── PriceStreamService.cs        # Background service polling CoinGecko for live prices
│
├── Models/
│   ├── Requests/
│   │   └── TokenQueryParams.cs
│   └── Responses/
│       ├── GlobalStatsResponse.cs
│       ├── TokenListItemResponse.cs
│       ├── TokenDetailResponse.cs
│       ├── TrendingTokenResponse.cs
│       ├── ChartDataResponse.cs
│       ├── ExchangeListingResponse.cs
│       └── LivePriceMessage.cs
│
├── Middleware/
│   ├── ErrorHandlingMiddleware.cs
│   └── RateLimitMiddleware.cs
│
└── Configuration/
    └── CoinGeckoOptions.cs
```

---

## 3. External API — CoinGecko

All market data is sourced from the **CoinGecko REST API** (free tier).

**Base URL:** `https://api.coingecko.com/api/v3`

**API Key:** Store in `appsettings.Development.json` as `CoinGecko:ApiKey`. Pass as header `x-cg-demo-api-key` on every request.

> **Rate Limit Awareness:** Free tier allows ~30 calls/minute. You must implement in-memory caching to avoid hitting this limit. Cache-first strategy: always serve from cache, refresh in background.

**Key CoinGecko endpoints you will consume:**

| CoinGecko Endpoint | Purpose |
|---|---|
| `GET /global` | Global market stats |
| `GET /search/trending` | Trending tokens |
| `GET /coins/markets` | Token list with prices |
| `GET /coins/{id}` | Single token full detail |
| `GET /coins/{id}/market_chart` | Price + volume history |
| `GET /coins/{id}/tickers` | Exchange listings |

---

## 4. REST API — Endpoints to Implement

Your API exposes the following endpoints to the frontend. These are your contract — do not change paths or response shapes without notifying the frontend teammate.

---

### 4.1 Global Market Stats

```
GET /api/global
```

**Response:**
```json
{
  "totalMarketCap": 2410000000000,
  "totalVolume24h": 98000000000,
  "btcDominance": 52.4,
  "ethDominance": 17.1,
  "marketCapChangePercent24h": 1.23,
  "activeCryptocurrencies": 13450
}
```

**Cache TTL:** 60 seconds

---

### 4.2 Trending Tokens

```
GET /api/trending
```

**Response:**
```json
[
  {
    "id": "bitcoin",
    "name": "Bitcoin",
    "symbol": "BTC",
    "image": "https://...",
    "currentPrice": 67432.12,
    "priceChange24h": 2.34,
    "rank": 1
  }
]
```

**Cache TTL:** 120 seconds
**Notes:** Returns top 10 trending tokens. Enrich with current price from `/coins/markets` call.

---

### 4.3 Token List

```
GET /api/tokens
```

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | int | 1 | Page number |
| `perPage` | int | 50 | Results per page (max 250) |
| `sortBy` | string | `market_cap` | Sort field |
| `order` | string | `desc` | `asc` or `desc` |
| `search` | string | — | Filter by name/symbol |

**Response:**
```json
[
  {
    "id": "bitcoin",
    "rank": 1,
    "name": "Bitcoin",
    "symbol": "BTC",
    "image": "https://...",
    "currentPrice": 67432.12,
    "priceChange1h": 0.12,
    "priceChange24h": 2.34,
    "priceChange7d": -1.05,
    "volume24h": 38200000000,
    "marketCap": 1330000000000,
    "sparklineData": [64000, 65100, 66200, 67100, 67432]
  }
]
```

**Cache TTL:** 30 seconds

---

### 4.4 Token Detail

```
GET /api/tokens/{id}
```

**Response:**
```json
{
  "id": "bitcoin",
  "rank": 1,
  "name": "Bitcoin",
  "symbol": "BTC",
  "image": "https://...",
  "description": "Bitcoin is the first...",
  "homepage": "https://bitcoin.org",
  "whitepaper": "https://bitcoin.org/bitcoin.pdf",
  "currentPrice": 67432.12,
  "priceChange1h": 0.12,
  "priceChange24h": 2.34,
  "priceChange7d": -1.05,
  "priceChange30d": 8.22,
  "priceChange1y": 142.3,
  "ath": 73750.00,
  "athDate": "2024-03-14",
  "atl": 67.81,
  "atlDate": "2013-07-06",
  "marketCap": 1330000000000,
  "fullyDilutedValuation": 1417000000000,
  "volume24h": 38200000000,
  "circulatingSupply": 19750000,
  "totalSupply": 21000000,
  "maxSupply": 21000000,
  "coingeckoScore": 83.4
}
```

**Cache TTL:** 30 seconds

---

### 4.5 Token Price Chart

```
GET /api/tokens/{id}/chart?days={days}
```

**Query Parameters:**

| Param | Type | Values | Description |
|---|---|---|---|
| `days` | int | 1, 7, 30, 90, 365, `max` | Chart time range |

**Response:**
```json
[
  {
    "timestamp": 1700486400000,
    "price": 67100.45,
    "volume": 36500000000
  }
]
```

**Cache TTL:** 5 minutes (historical data changes infrequently)

---

### 4.6 Token Exchange Listings

```
GET /api/tokens/{id}/exchanges
```

**Response:**
```json
[
  {
    "exchangeId": "binance",
    "exchangeName": "Binance",
    "exchangeLogo": "https://...",
    "pair": "BTC/USDT",
    "price": 67440.00,
    "volume24h": 1200000000,
    "depthPlus2": 8500000,
    "depthMinus2": 7800000,
    "trustScore": "green"
  }
]
```

**Cache TTL:** 5 minutes
**Notes:** Map CoinGecko's `trust_score` string directly. Sort by `volume24h` descending before returning.

---

## 5. Real-Time WebSocket — SignalR

You will build a SignalR Hub that streams live price updates to the frontend.

### 5.1 Hub — `PriceHub.cs`

**Hub path:** `/hubs/price`

**Methods the client can call:**
```csharp
// Client subscribes to a token's price stream
Task SubscribeToToken(string tokenId)

// Client unsubscribes
Task UnsubscribeFromToken(string tokenId)
```

**Server → Client push:**
```csharp
// Called on each price update for a subscribed token
await Clients.Group(tokenId).SendAsync("PriceUpdate", new LivePriceMessage {
    Type = "price_update",
    TokenId = tokenId,
    Price = 67432.12m,
    Change24h = 2.34m,
    Volume24h = 38200000000m,
    Timestamp = DateTime.UtcNow
});
```

### 5.2 Background Price Polling — `PriceStreamService.cs`

A `BackgroundService` that:
1. Tracks which token IDs have at least one active subscriber
2. Every **5 seconds**, calls CoinGecko `/coins/markets` for all subscribed token IDs (batched)
3. Parses new prices
4. For each token where price has changed since last push → sends `PriceUpdate` via SignalR hub
5. Handles CoinGecko rate limit gracefully (backoff if 429 received)

```csharp
public class PriceStreamService : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await PollAndBroadcastPrices();
            await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
        }
    }
}
```

---

## 6. Caching Strategy

Use `IMemoryCache` (built-in .NET, no Redis needed for this project).

**Pattern — Cache-Aside:**
```csharp
public async Task<GlobalStatsResponse> GetGlobalStatsAsync()
{
    const string cacheKey = "global_stats";
    
    if (_cache.TryGetValue(cacheKey, out GlobalStatsResponse cached))
        return cached;

    var data = await _coinGeckoService.FetchGlobalStatsAsync();
    var mapped = _mapper.Map(data);
    
    _cache.Set(cacheKey, mapped, TimeSpan.FromSeconds(60));
    return mapped;
}
```

**Cache TTL Reference:**

| Endpoint | TTL |
|---|---|
| `/api/global` | 60s |
| `/api/trending` | 120s |
| `/api/tokens` | 30s |
| `/api/tokens/{id}` | 30s |
| `/api/tokens/{id}/chart` | 5 min |
| `/api/tokens/{id}/exchanges` | 5 min |

---

## 7. Data Models

### Request Models

```csharp
// Models/Requests/TokenQueryParams.cs
public class TokenQueryParams
{
    public int Page { get; set; } = 1;
    public int PerPage { get; set; } = 50;
    public string SortBy { get; set; } = "market_cap";
    public string Order { get; set; } = "desc";
    public string? Search { get; set; }
}
```

### Response Models

```csharp
// Models/Responses/GlobalStatsResponse.cs
public class GlobalStatsResponse
{
    public decimal TotalMarketCap { get; set; }
    public decimal TotalVolume24h { get; set; }
    public decimal BtcDominance { get; set; }
    public decimal EthDominance { get; set; }
    public decimal MarketCapChangePercent24h { get; set; }
    public int ActiveCryptocurrencies { get; set; }
}

// Models/Responses/TokenListItemResponse.cs
public class TokenListItemResponse
{
    public string Id { get; set; }
    public int Rank { get; set; }
    public string Name { get; set; }
    public string Symbol { get; set; }
    public string Image { get; set; }
    public decimal CurrentPrice { get; set; }
    public decimal PriceChange1h { get; set; }
    public decimal PriceChange24h { get; set; }
    public decimal PriceChange7d { get; set; }
    public decimal Volume24h { get; set; }
    public decimal MarketCap { get; set; }
    public List<decimal> SparklineData { get; set; }
}

// Models/Responses/LivePriceMessage.cs
public class LivePriceMessage
{
    public string Type { get; set; } = "price_update";
    public string TokenId { get; set; }
    public decimal Price { get; set; }
    public decimal Change24h { get; set; }
    public decimal Volume24h { get; set; }
    public DateTime Timestamp { get; set; }
}
```

---

## 8. HTTP Client Setup — CoinGecko

Register a typed `HttpClient` for CoinGecko in `Program.cs`:

```csharp
builder.Services.AddHttpClient<ICoinGeckoService, CoinGeckoService>(client =>
{
    client.BaseAddress = new Uri("https://api.coingecko.com/api/v3/");
    client.DefaultRequestHeaders.Add("x-cg-demo-api-key", 
        builder.Configuration["CoinGecko:ApiKey"]);
    client.Timeout = TimeSpan.FromSeconds(10);
});
```

**Error handling in `CoinGeckoService`:**
- On 429 (rate limit): log warning, throw `RateLimitException`, return cached data if available
- On 404: throw `NotFoundException`
- On 5xx: log error, throw `ExternalServiceException`
- All exceptions are caught by `ErrorHandlingMiddleware`

---

## 9. Middleware

### 9.1 Global Error Handler — `ErrorHandlingMiddleware.cs`

Catches all unhandled exceptions and returns structured JSON errors:

```json
{
  "statusCode": 500,
  "message": "An unexpected error occurred",
  "traceId": "00-abc123..."
}
```

Map exception types to status codes:
- `NotFoundException` → 404
- `RateLimitException` → 503 with `Retry-After` header
- `ValidationException` → 400
- All others → 500

### 9.2 Rate Limit Guard — `RateLimitMiddleware.cs`

Implement a simple in-memory rate limiter to protect against the frontend over-calling the backend:
- Max 100 requests per minute per IP
- Returns `429 Too Many Requests` with `Retry-After: 60` header on breach

---

## 10. CORS & SignalR Configuration

```csharp
// Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("CryptoPulsePolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Required for SignalR
    });
});

builder.Services.AddSignalR();

// Map hub
app.MapHub<PriceHub>("/hubs/price");
```

---

## 11. Configuration

**`appsettings.json`:**
```json
{
  "CoinGecko": {
    "BaseUrl": "https://api.coingecko.com/api/v3/",
    "ApiKey": ""
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:3000"]
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

**`appsettings.Development.json`:**
```json
{
  "CoinGecko": {
    "ApiKey": "YOUR_DEV_API_KEY_HERE"
  }
}
```

> Never commit API keys to version control. Add `appsettings.Development.json` to `.gitignore`.

---

## 12. Task Breakdown (Sprint-Ready)

> These map directly to ClickUp tasks. Each task = one logical unit of shippable work.

### EPIC 1 — Project Setup & Infrastructure

| Task ID | Task | Est. |
|---|---|---|
| BE-001 | Create ASP.NET Core Web API project, configure folder structure | 2h |
| BE-002 | Configure `appsettings.json`, CoinGecko options, DI registration | 1h |
| BE-003 | Register typed `HttpClient` for CoinGecko, verify connectivity | 1h |
| BE-004 | Configure CORS policy for `localhost:3000` | 30m |
| BE-005 | Add `IMemoryCache`, register in DI | 30m |
| BE-006 | Build `ErrorHandlingMiddleware` with structured JSON errors | 2h |

### EPIC 2 — CoinGecko Service Layer

| Task ID | Task | Est. |
|---|---|---|
| BE-007 | Define `ICoinGeckoService` interface with all method signatures | 1h |
| BE-008 | Implement `FetchGlobalStatsAsync` with mapping | 2h |
| BE-009 | Implement `FetchTrendingTokensAsync` with price enrichment | 3h |
| BE-010 | Implement `FetchTokenListAsync` with query params passthrough | 3h |
| BE-011 | Implement `FetchTokenDetailAsync` — full detail mapping | 3h |
| BE-012 | Implement `FetchTokenChartAsync` with days param | 2h |
| BE-013 | Implement `FetchTokenExchangesAsync` with trust score mapping | 2h |

### EPIC 3 — Market Data Service & Caching

| Task ID | Task | Est. |
|---|---|---|
| BE-014 | Build `IMarketDataService` interface | 1h |
| BE-015 | Implement `GetGlobalStatsAsync` with 60s cache | 1h |
| BE-016 | Implement `GetTrendingTokensAsync` with 120s cache | 1h |
| BE-017 | Implement `GetTokenListAsync` with 30s cache, search filter | 2h |
| BE-018 | Implement `GetTokenDetailAsync` with 30s cache | 1h |
| BE-019 | Implement `GetTokenChartAsync` with 5min cache | 1h |
| BE-020 | Implement `GetTokenExchangesAsync` with 5min cache | 1h |

### EPIC 4 — REST API Controllers

| Task ID | Task | Est. |
|---|---|---|
| BE-021 | Build `GlobalController` — `GET /api/global` | 1h |
| BE-022 | Build `TrendingController` — `GET /api/trending` | 1h |
| BE-023 | Build `TokensController` — `GET /api/tokens` with query params | 2h |
| BE-024 | Build `TokensController` — `GET /api/tokens/{id}` | 1h |
| BE-025 | Build `TokensController` — `GET /api/tokens/{id}/chart` | 1h |
| BE-026 | Build `TokensController` — `GET /api/tokens/{id}/exchanges` | 1h |
| BE-027 | Add input validation (`[ApiController]` + FluentValidation) | 2h |

### EPIC 5 — Real-Time WebSocket (SignalR)

| Task ID | Task | Est. |
|---|---|---|
| BE-028 | Install & configure SignalR, map `/hubs/price` | 1h |
| BE-029 | Build `PriceHub` with Subscribe / Unsubscribe group management | 3h |
| BE-030 | Build `IPriceStreamService` interface and `LivePriceMessage` model | 1h |
| BE-031 | Build `PriceStreamService` as `BackgroundService` | 4h |
| BE-032 | Implement active subscriber tracking in `PriceStreamService` | 2h |
| BE-033 | Integrate `PriceStreamService` with `PriceHub` broadcasts | 2h |
| BE-034 | Handle 429 backoff in streaming service | 1h |

### EPIC 6 — Polish & QA

| Task ID | Task | Est. |
|---|---|---|
| BE-035 | Build `RateLimitMiddleware` (100 req/min per IP) | 2h |
| BE-036 | Add structured logging (Serilog or built-in) to all service calls | 2h |
| BE-037 | Write integration tests for all 6 REST endpoints | 4h |
| BE-038 | Manual QA — test all endpoints with Postman/Swagger | 2h |
| BE-039 | Swagger/OpenAPI setup with descriptions on all endpoints | 1h |
| BE-040 | Final review: null safety, edge cases, empty CoinGecko responses | 2h |

---

## 13. Definition of Done

A task is considered **done** when:

- [ ] Endpoint returns correct data shape matching the contract above
- [ ] Response is served from cache on repeated calls (verify via logs)
- [ ] All edge cases handled: token not found, CoinGecko 429, empty response
- [ ] No unhandled exceptions — all errors go through `ErrorHandlingMiddleware`
- [ ] Swagger documents the endpoint with correct types
- [ ] No hardcoded strings — config values come from `appsettings.json`
- [ ] No API keys in source code

---

## 14. Coordination Points with Frontend Teammate

These are the integration touchpoints you must align on **before** the frontend consumes your API:

| Item | Action |
|---|---|
| Server port | Run on `localhost:5000` (HTTP) in development |
| All endpoint paths | Share this doc with frontend; notify on any change |
| WebSocket hub path | Confirm `/hubs/price` is reachable from `localhost:3000` |
| `LivePriceMessage` schema | Share `LivePriceMessage.cs` field names so frontend types match |
| CORS | Verify `AllowCredentials()` is set (required for SignalR) |
| Error response shape | Frontend error handling depends on `{ statusCode, message }` shape |

---

## 15. Swagger / API Reference

Enable Swagger UI in development:

```csharp
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "CryptoPulse API v1"));
}
```

Swagger will be available at: `http://localhost:5000/swagger`

Use this as the live API reference during development. The frontend teammate can use it to test endpoints independently before integration.

---

*Document maintained by Team Lead. For questions, raise a ClickUp comment on the relevant task.*