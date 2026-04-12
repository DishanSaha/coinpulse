# CryptoPulse — Project Overview & Team Lead Reference

**Project:** CryptoPulse — Real-Time Crypto Analytics Terminal
**Team Lead:** Md Hasib
**Sprint Target:** Compact delivery (parallel frontend + backend tracks)
**Doc Version:** 1.0

---

## 1. Team Structure

| Role | Stack | Design Doc |
|---|---|---|
| Frontend Engineer | Next.js 14 · TypeScript · Tailwind · shadcn/ui | `FRONTEND_DESIGN_DOC.md` |
| Backend Engineer | .NET 8 · ASP.NET Core · SignalR | `BACKEND_DESIGN_DOC.md` |
| Team Lead | Review · Integration · Coordination | This doc |

---

## 2. Project Feature Map

| Feature | Frontend Tasks | Backend Tasks |
|---|---|---|
| Global Market Stats Banner | FE-008 | BE-007, BE-008, BE-015, BE-021 |
| Trending Tokens Carousel | FE-009 | BE-009, BE-016, BE-022 |
| Market Summary Cards | FE-010 | BE-010, BE-017, BE-023 |
| Token Explorer Table | FE-012 → FE-016 | BE-010, BE-017, BE-023 |
| Live Price Flashing (Table) | FE-017 | BE-028 → BE-034 |
| Token Detail Page | FE-018 → FE-023 | BE-011, BE-018, BE-024 |
| Price Chart | FE-019 | BE-012, BE-019, BE-025 |
| Live Price Ticker (Detail) | FE-020, FE-024 → FE-026 | BE-028 → BE-034 |
| Exchange Listings Table | FE-022 | BE-013, BE-020, BE-026 |

---

## 3. Sprint Sequence Recommendation

### Week 1 — Foundation
Both teammates work in parallel on their setup epics.

- **FE:** EPIC 1 (FE-001 → FE-007) — project scaffold, API client, types, formatters, layout
- **BE:** EPIC 1 + EPIC 2 partially (BE-001 → BE-013) — project scaffold, CoinGecko service

**Sync checkpoint:** End of Week 1 — confirm API base URL, endpoint paths, and TypeScript/C# type alignment.

---

### Week 2 — Core Features
- **FE:** EPIC 2 + EPIC 3 (Home page + Token Explorer)
- **BE:** EPIC 3 + EPIC 4 (Caching layer + all REST controllers)

**Sync checkpoint:** End of Week 2 — frontend integrates against live backend endpoints. Fix any contract mismatches.

---

### Week 3 — Real-Time + Detail Page
- **FE:** EPIC 4 + EPIC 5 (Token Detail + WebSocket client)
- **BE:** EPIC 5 (SignalR hub + background price stream)

**Sync checkpoint:** End of Week 3 — end-to-end WebSocket integration test. Price updates flow from CoinGecko → .NET → SignalR → Next.js.

---

### Week 4 — Polish & Delivery
- **Both:** EPIC 6 (Polish, QA, performance, accessibility)
- **Team Lead:** Final integration review, ClickUp task closure, demo prep

---

## 4. Critical Integration Agreements

These must be agreed upon at the Week 1 sync and never changed without notifying both sides:

| Agreement | Value |
|---|---|
| Backend base URL (dev) | `http://localhost:5000` |
| Frontend URL (dev) | `http://localhost:3000` |
| SignalR hub path | `/hubs/price` |
| WebSocket message event name | `PriceUpdate` |
| Error response shape | `{ statusCode, message, traceId }` |

---

## 5. ClickUp Setup Recommendation

Create the following structure in ClickUp:

```
📁 CryptoPulse
├── 📋 Frontend
│   ├── 🗂 EPIC 1: Setup & Infrastructure       (FE-001 → FE-007)
│   ├── 🗂 EPIC 2: Home Dashboard               (FE-008 → FE-011)
│   ├── 🗂 EPIC 3: Token Explorer               (FE-012 → FE-017)
│   ├── 🗂 EPIC 4: Token Detail Page            (FE-018 → FE-023)
│   ├── 🗂 EPIC 5: WebSocket Client             (FE-024 → FE-027)
│   └── 🗂 EPIC 6: Polish & QA                  (FE-028 → FE-033)
│
├── 📋 Backend
│   ├── 🗂 EPIC 1: Setup & Infrastructure       (BE-001 → BE-006)
│   ├── 🗂 EPIC 2: CoinGecko Service Layer      (BE-007 → BE-013)
│   ├── 🗂 EPIC 3: Market Data Service          (BE-014 → BE-020)
│   ├── 🗂 EPIC 4: REST API Controllers         (BE-021 → BE-027)
│   ├── 🗂 EPIC 5: SignalR Real-Time            (BE-028 → BE-034)
│   └── 🗂 EPIC 6: Polish & QA                  (BE-035 → BE-040)
│
└── 📋 Integration Milestones
    ├── ✅ Week 1: Types & endpoint contract agreed
    ├── ✅ Week 2: All REST endpoints integrated
    ├── ✅ Week 3: WebSocket end-to-end working
    └── ✅ Week 4: Full QA pass complete
```

---

## 6. Total Effort Estimate

| Track | Tasks | Est. Hours |
|---|---|---|
| Frontend | 33 tasks | ~71 hours |
| Backend | 40 tasks | ~65 hours |
| **Total** | **73 tasks** | **~136 hours** |

Across 2 engineers working in parallel: approximately **3–4 weeks** at part-time pace (2–3 hrs/day), or **~2 weeks** at full-time pace.

---

*Maintained by Team Lead. Distribute `FRONTEND_DESIGN_DOC.md` to the frontend teammate and `BACKEND_DESIGN_DOC.md` to the backend teammate.*