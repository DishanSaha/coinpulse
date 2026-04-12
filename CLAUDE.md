# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Monorepo Structure

This is a **Turborepo** monorepo using **Bun** as the package manager and runtime.

```
apps/web     — Next.js 16 frontend (@coinpulse/web)
apps/api     — .NET 10 Web API backend (CoinPulse.Api)
packages/    — shared packages (currently empty)
```

## Commands

All commands run from the repo root unless noted.

| Command | Effect |
|---|---|
| `bun run dev` | Start both apps in parallel via turbo TUI |
| `bun run build` | Build all apps |
| `bun run lint` | Lint all apps |
| `bun install` | Install/update JS dependencies |

**Web only** (from `apps/web`):
```bash
bun run dev    # Next.js on http://localhost:3000
bun run build
bun run lint
```

**API only** (from `apps/api`):
```bash
dotnet run              # starts on https://localhost:5001
dotnet build
dotnet restore
```

Turbo TUI keyboard shortcuts: arrow keys to switch panes, `q` to quit.

## Architecture

### Frontend — `apps/web`

Next.js App Router. All files under `apps/web/app/` are **React Server Components by default**. Add `"use client"` at the top of any file that uses browser APIs, hooks, or event handlers (e.g. `components/Header.tsx` uses `usePathname` so it is a client component).

- **Styling**: Tailwind CSS v4 — config lives entirely in `app/globals.css` via `@theme` blocks. There is no `tailwind.config.js`.
- **UI components**: shadcn/ui with `radix-nova` style. Add components via `bunx shadcn add <component>`. Aliases: `@/components/ui`, `@/lib`, `@/hooks`.
- **Path alias**: `@/` resolves to `apps/web/` (set in `tsconfig.json`).
- **Fonts**: Geist Sans + Geist Mono loaded via `next/font/google` in `app/layout.tsx`.
- **Theme**: dark mode forced via `className="dark"` on `<html>`.

### Backend — `apps/api`

.NET 10 Minimal API. All routes are defined directly in `Program.cs` using `app.MapGet/Post/...`. OpenAPI docs are served at `/openapi/v1.json` in development (via `app.MapOpenApi()`).

- **Solution file**: `CoinPulse.slnx` at the repo root (new XML format introduced in .NET 10).
- **HTTP file**: `apps/api/CoinPulse.Api.http` for manually testing endpoints in VS Code REST Client or JetBrains.
