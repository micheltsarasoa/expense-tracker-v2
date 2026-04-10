# Expense Tracker v2

A multi-platform personal finance tracker built with Next.js 16, Expo, and Neon PostgreSQL.

[![Stack](https://img.shields.io/badge/Stack-Turborepo-ef4444)](https://turborepo.org/)
[![Framework](https://img.shields.io/badge/Framework-Next.js%2016-black)](https://nextjs.org/)
[![Database](https://img.shields.io/badge/Database-Neon%20PostgreSQL-00e599)](https://neon.tech/)

## Architecture

Turborepo monorepo with two apps sharing common packages:

```
apps/
  web/      Next.js 16 — App Router, owns all /api/v1/* routes
  mobile/   Expo + Expo Router — calls apps/web API (ships after web)
packages/
  db/       Drizzle schema + migrations (single DB entry point)
  types/    Zod schemas + shared TypeScript types
```

Auth: **Neon Auth** (web: HTTP-only cookie · mobile: Bearer token in SecureStore)  
Data flow: `Client → TanStack Query → Route Handler → Service → Drizzle → Neon`

## Documentation

### Product

| File | Description |
|------|-------------|
| [docs/PRD.md](docs/PRD.md) | Goals, feature list, priority matrix (P0/P1/P2) |
| [docs/PLAN.md](docs/PLAN.md) | 7-phase implementation roadmap |
| [docs/user-stories.md](docs/user-stories.md) | Full user story backlog |

### Technical

| File | Description |
|------|-------------|
| [docs/tech-spec.md](docs/tech-spec.md) | Stack, data flow, auth strategy, ERD, error contract |
| [docs/api-reference.md](docs/api-reference.md) | All `/api/v1/*` endpoints with request/response shapes |
| [CLAUDE.md](CLAUDE.md) | Agent instructions — stack, conventions, package boundaries |

### Feature Specs

| File | Feature |
|------|---------|
| [docs/specs/spec-auth.md](docs/specs/spec-auth.md) | Registration, login, session, Neon Auth |
| [docs/specs/spec-transactions.md](docs/specs/spec-transactions.md) | Transaction CRUD (income / expense / transfer) |
| [docs/specs/spec-import.md](docs/specs/spec-import.md) | CSV / Excel bulk import |
| [docs/specs/spec-budgets.md](docs/specs/spec-budgets.md) | Budgets, suggestions (rule-based), forecast |
| [docs/specs/spec-dashboard.md](docs/specs/spec-dashboard.md) | Dashboard widgets and data sources |
| [docs/specs/spec-reports.md](docs/specs/spec-reports.md) | Analytics views and charts |
| [docs/specs/spec-params.md](docs/specs/spec-params.md) | Categories, labels, accounts |
| [docs/specs/spec-settings.md](docs/specs/spec-settings.md) | User settings and formatting |
| [docs/specs/spec-monorepo.md](docs/specs/spec-monorepo.md) | Monorepo structure and package boundaries |

### Architecture Decisions

| File | Decision |
|------|---------|
| [docs/decisions/ADR-001](docs/decisions/ADR-001-neon-auth.md) | Neon Auth over NextAuth |
| [docs/decisions/ADR-002](docs/decisions/ADR-002-explicit-budget-dates.md) | Explicit budget dates (no recurring types) |
| [docs/decisions/ADR-003](docs/decisions/ADR-003-no-sql-triggers.md) | No SQL triggers for balance updates |
| [docs/decisions/ADR-004](docs/decisions/ADR-004-shadcn-charts.md) | shadcn/ui Charts over raw Recharts |

## Setup

See [docs/manual/installation-manual.md](docs/manual/installation-manual.md) for full bootstrap instructions.

Quick start:
```bash
cp .env.example .env        # fill in DATABASE_URL and NEON_AUTH_SECRET
pnpm install
pnpm dev
```
