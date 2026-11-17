# Expense Tracker

Self-hostable, open source personal and family finance app: adults, shared households and children, on the web and as an installable child app.

Licence: [AGPL-3.0-or-later](LICENSE). Status: pre-1.0. The path to 1.0 is in [docs/roadmap/](docs/roadmap/README.md).

## Architecture

Turborepo monorepo, strict TypeScript.

```
apps/
  web/      Next.js 16 (App Router) — adult web app and /api/v1
packages/
  db/       Drizzle schema and migrations (the only database entry point)
  types/    Zod schemas and shared types
```

Target layout (kid PWA, worker, design system, domain core): see [AGENTS.md](AGENTS.md#layout-and-boundaries).

## Quick start

Requirements: Node 22 (`.nvmrc`), pnpm 10, PostgreSQL 16.

```bash
cp .env.example apps/web/.env.local   # fill in the values; the server refuses to start otherwise
cp .env.example .env                  # for drizzle-kit and scripts
pnpm install
pnpm --filter db migrate              # local database only
pnpm dev
```

Checks: `pnpm lint && pnpm typecheck && pnpm test && pnpm docs:links`.

## Documentation

Start with [docs/agents/README.md](docs/agents/README.md): it lists the sources of truth (glossary, decisions, specs, roadmap). Outdated documents live in [docs/archive/](docs/archive/).
