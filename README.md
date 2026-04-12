# CoinPulse

A crypto scanner app with a built-in high frequency terminal and dashboard.

## Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo + Bun workspaces |
| Frontend | Next.js 16, React 19, Tailwind CSS v4, shadcn/ui |
| Backend | .NET 10 Web API (Minimal API) |

## Prerequisites

- [Bun](https://bun.sh) >= 1.0
- [.NET SDK](https://dotnet.microsoft.com) >= 10.0

## Getting Started

Install dependencies:

```bash
bun install
```

Start both apps simultaneously:

```bash
bun run dev
```

This opens Turborepo's terminal UI with a pane for each app. Use arrow keys to switch panes, `q` to quit.

| App | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | https://localhost:5001 |
| OpenAPI docs | https://localhost:5001/openapi/v1.json |

## Running Apps Individually

### Frontend (`apps/web`)

```bash
cd apps/web
bun run dev      # http://localhost:3000
bun run build    # production build
bun run start    # serve production build
bun run lint     # lint
bun run clean    # delete .next/
```

### Backend (`apps/api`)

```bash
cd apps/api
dotnet run                            # https://localhost:5001
dotnet run --launch-profile http      # http only, http://localhost:5000
dotnet build                          # debug build
dotnet build --configuration Release  # release build
dotnet restore                        # restore NuGet packages
```

You can also scope turbo to a single app from the root without `cd`:

```bash
bun run dev --filter=@coinpulse/web
bun run dev --filter=@coinpulse/api
bun run build --filter=@coinpulse/web
```

## Other Commands

```bash
bun run build   # build all apps
bun run lint    # lint all apps
```

## Project Structure

```
apps/
  web/    Next.js frontend
  api/    .NET Web API backend
packages/ shared packages
```
