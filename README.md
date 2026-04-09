# 💰 Expense Tracker v2
A high-performance, multi-platform financial tracking ecosystem built with **Next.js 15**, **Expo**, and **PostgreSQL**.

[![Stack](https://img.shields.io/badge/Stack-Turborepo-ef4444)](https://turborepo.org/)
[![Framework](https://img.shields.io/badge/Framework-Next.js%2015-black)](https://nextjs.org/)
[![Database](https://img.shields.io/badge/Database-Neon%20PostgreSQL-00e599)](https://neon.tech/)

## 🏗 v2 Architecture & Decisions
This project has transitioned to a **Monorepo** to support a unified web and mobile experience with shared logic.

- **Monorepo Strategy**: Powered by **Turborepo** and `pnpm` workspaces for maximum build speed and clean dependency management.
- **Authentication**: Migrating to **Neon Auth** for native edge-readiness and seamless multi-platform sessions.
- **Data Flow**: `packages/db` (Drizzle) acts as the single source of truth; `apps/web` provides the REST API consumed by `apps/mobile`.
- **UI System**: **Tailwind CSS v4** + **shadcn/ui** primitives for a design-system-first implementation.


## Documents

| File | Description |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Claude Code instructions for v2 — stack, conventions, package boundaries, rules |
| [PRD.md](docs/PRD.md) | Problem, goals, feature list, v1/v2 architecture diagrams |
| [spec-auth.md](docs/specs/spec-auth.md) | Registration, login, session, rate limiting, v2 Neon Auth migration |
| [spec-transactions.md](docs/specs/spec-transactions.md) | Transaction CRUD, types, import, modals |
| [spec-budgets.md](docs/specs/spec-budgets.md) | Budgets, suggestions, forecast view, modals |
| [spec-dashboard.md](docs/specs/spec-dashboard.md) | Dashboard widgets and data sources |
| [spec-reports.md](docs/specs/spec-reports.md) | Analytics views, charts, filters |
| [spec-params.md](docs/specs/spec-params.md) | Categories, labels, accounts, user settings, modals |
| [spec-monorepo.md](docs/specs/spec-monorepo.md) | v2 Turborepo structure, shared packages, data flow diagrams |
| [user-stories.md](docs/user-stories.md) | Full user story backlog across all features |

## v2 Key Decisions

- **Monorepo**: Turborepo — `apps/web` (Next.js) + `apps/mobile` (Expo) + `packages/db` + `packages/types`
- **Auth**: Neon Auth (replaces NextAuth)
- **API**: `/api/v1` REST routes in `apps/web`, consumed by both platforms
- **New**: budget suggestions (rule-based first, AI second) + forecast view
- **Process**: Figma design before any implementation
