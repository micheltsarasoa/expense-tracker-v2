

# Phase 1: Foundation & Specs
**Goal**: Establish a "Source of Truth" to prevent drift during implementation.

## 1.1 Product Definition (`docs/PRD.md`)
- [x] **Feature Inventory**: Map 9 core areas (Auth, Trans, Acc, Cat, Label, Budg, Repo, Imp, Set).
- [x] **Scope Hardening**: Review and lock feature boundaries per PRD.
- [x] **Priority Matrix**: Assign P0 / P1 / P2 — see `docs/PRD.md`.

## 1.2 Tech Architecture (`docs/tech-spec.md`)
- [x] **Data Flow**: `Client → TanStack Query → Route Handler → Service → Drizzle → Neon`
- [x] **Auth Strategy**: Neon Auth — JWT cookie (web) + Bearer token (mobile). See `docs/tech-spec.md`.
- [x] **Error Contract**: `AppError` hierarchy defined in `docs/tech-spec.md`.
- [x] **Environment Mapping**: `.env.example` at root covers all required variables.

## 1.3 Schema Design (`packages/db/schema/`)
- [ ] **ERD Draft**: Mermaid diagram of the 7-table schema.
- [ ] **Type Safety**: Replace SQL `CHECK` constraints with Drizzle `pgEnum`.
- [ ] **Budget Logic**: Resolve nullable `categoryId` / `labelId` on budgets table.

## 1.4 Workspace Setup
- [x] **Project Context**: `CLAUDE.md` and `.claude/settings.json` initialized.
- [x] **Slash Commands**: `/sync`, `/commit`, `/feature`, `/component`, `/migrate`, `/seed`.
- [ ] **Quality Gates**: ESLint / Prettier / Husky — deferred to Phase 3 (requires scaffolded apps).

---

# Phase 2: Design System & UI Architecture
**Goal**: Finalize visual specs to ensure "Zero Logic" in the presentation layer.

## 2.1 Design Tokens (`docs/design-tokens.md`)
- [ ] **Tailwind v4 Mapping**: Define `@theme` variables (colors, spacing, radius).
- [ ] **Dark Mode Strategy**: Define semantic tokens (e.g., `--bg-primary` vs `bg-white`).
- [ ] **Iconography**: Standardize on Lucide icons (list required set).

## 2.2 Layout & Navigation (`docs/ux-flow.md`)
- [ ] **The "Two Dashboard" Resolution**: Define exact shared vs. platform-specific views.
- [ ] **Navigation Schema**:
    * Desktop: Persistent Sidebar.
    * Mobile: Bottom Tab Bar + Burger Menu.
- [ ] **CRUD Pattern**: Standardize on **Sheet (Side Drawer)** for forms vs. dedicated routes.

## 2.3 Component Inventory (`components/README.md`)
- [ ] **Registry**: Map planned screens to `shadcn/ui` primitives.
- [ ] **Atomic Organization**:
    * `components/ui/`: Raw shadcn (unmodified).
    * `components/shared/`: Data-agnostic (e.g., `StatCard`, `EmptyState`).
    * `components/features/`: Domain-aware (e.g., `TransactionList`).
- [ ] **Skeleton Strategy**: Define loading states for every P0 screen.

## 2.4 Figma Handoff (`docs/figma.md`)
- [ ] **Frame Audit**: Verify 375px (Mobile) and 1280px (Desktop) exists for all 13 screens.
- [ ] **Asset Export**: Extract high-res logos/placeholders to `apps/web/public/`.


---

# Phase 3: Project Setup & DevOps
**Goal**: Zero-trust infrastructure. If the build isn't perfect, the CI fails.

## 3.1 Core Initialization
- [ ] **Scaffold**: `pnpm create next-app@latest`
    * *Config*: App Router, TS (Strict), Tailwind v4, Turbopack enabled. No `--src-dir` (Next.js 16).
- [ ] **shadcn/ui**: `pnpm dlx shadcn@latest init`
    * *Note*: Use the `--preset` flag to match Figma tokens from Phase 2.
- [ ] **Agent Guard**: Verify `CLAUDE.md` and `.claude/` are at root.

## 3.2 Quality Gates (The "Janitor" Layer)
- [ ] **Strict Linting**:
    * Add `typescript-eslint` strict & stylistic presets.
    * Add `eslint-plugin-react-compiler` (for React 19 optimization).
- [ ] **Git Hooks (Husky)**:
    * `pre-commit`: Run `lint-staged` (ESLint + Prettier + `tsc --noEmit`).
    * `commit-msg`: Enforce Conventional Commits (`feat:`, `fix:`, `chore:`).

## 3.3 Database & Local Dev
- [ ] **Drizzle Setup**: Initialize `drizzle-kit` in `packages/db`.
- [ ] **Seed Engine**: Create `db:seed` script with `@faker-js/faker` for realistic test data.

## 3.4 CI/CD Pipeline (GitHub Actions)
- [ ] **The "Triple Check" Workflow**:
    1. **Static**: Lint, Type-check, Secret Scanning.
    2. **Logic**: Vitest (Unit) + Playwright (E2E).
    3. **Deploy**: Vercel Preview + **Neon Database Branching**.
- [ ] **Neon Integration**: Automate `neon-create-branch` on every Pull Request.


---

# Phase 4: Data Layer & Persistence
**Goal**: Establish a single source of truth with 100% Type-Safe Querying.

## 4.1 Schema Porting (`packages/db/src/schema/`)
- [ ] **Multi-File Schema**: Split the 7-table schema into domain files (e.g., `transactions.ts`, `budgets.ts`).
- [ ] **Functional Enums**: Use `pgEnum` for Category types and Transaction status.
- [ ] **Audit Trail**: Implement `updatedAt` using Drizzle's `.$onUpdate()` hook for all tables.
- [ ] **Multi-Label Logic**: ~~junction table~~ — deferred to scope 2. Single label per transaction for v2 launch.

## 4.2 Neon Infrastructure
- [ ] **Client Initialization**: Setup `drizzle-orm/neon-http` for Edge compatibility.
- [ ] **Migration Hub**: Configure `drizzle.config.ts` to support both local and Neon branching.
- [ ] **Type Inference**: Export `InsertTransaction` and `SelectTransaction` types for use in `packages/types`.

## 4.3 Service Layer & Logic
- [ ] **Balance Strategy**: No SQL triggers. `TransactionService` handles balance updates as a **DB transaction**.
- [ ] **Query Repository**: Port all queries to Drizzle Relational Queries (RQB).
- [ ] **Multi-Tenant Scoping**: `withUserScope` helper for Drizzle queries to auto-inject `userId`.

## 4.4 Seeding & Validation
- [ ] **Data Factory**: Standalone `seed.ts` script using `@faker-js/faker`.
- [ ] **Migration Drill**: Run `generate` → `migrate` → `seed` cycle to verify schema integrity.


---

# Phase 5: API & Backend Logic
**Goal**: Industrial-grade security and type-safe business logic.

## 5.1 Service Layer (`services/`)
- [ ] **Domain Services**: `TransactionService`, `BudgetService`, `CategoryService`, etc.
    * *Rule*: Services must be framework-agnostic (no `next/headers`).
- [ ] **Error Mapping**: Implement `AppError` (code, message, status) for predictable failures.
- [ ] **Transaction Wrappers**: Multi-step logic uses `db.transaction()`.

## 5.2 Auth & Route Protection
- [ ] **Neon Auth**: Configure SDK in `apps/web` — token issuance, refresh, session.
- [ ] **proxy.ts**: Enforce route protection and `userId` extraction at `apps/web/proxy.ts`.
- [ ] **Password Security**: Delegated to Neon Auth (no manual bcrypt/argon2 needed).

## 5.3 Request Validation & API (`app/api/v1/`)
- [ ] **Zod Integration**: Shared schemas from `packages/types` for all inputs.
- [ ] **Route Handlers**: Build `GET/POST/PATCH/DELETE` for mobile app consumption.
- [ ] **Server Actions**: Build the mutation layer for the web app (using `useActionState`).

## 5.4 API Docs & Observability
- [ ] **OpenAPI**: Auto-generate `openapi.json` from Zod schemas via `zod-to-openapi`.
- [ ] **Logger**: Structured logger (`pino`) for production debugging.

## 5.5 Testing Suite
- [ ] **Vitest**: Unit tests for services.
- [ ] **MSW**: Mock Service Worker for integration testing.


---

# Phase 6: Frontend Implementation
**Goal**: Pixel-perfect, high-performance UI with optimistic state management.

## 6.1 Core Architecture
- [ ] **Root Layout**: Auth + QueryClient + Theme providers.
- [ ] **Responsive Navigation**:
    * Desktop: Sidebar.
    * Mobile: Bottom Tab Bar + Navigation Drawer.
- [ ] **Loading Strategy**: `loading.tsx` at route level with Skeleton components.

## 6.2 Data Fetching Layer
- [ ] **Domain Hooks**: `useTransactions`, `useBudgets`, etc. via TanStack Query v5.
- [ ] **Optimistic UI**: `onMutate` for all CRUD actions.
- [ ] **Prefetching**: `queryClient.prefetchQuery` in Server Components.

## 6.3 Feature Implementation
- [ ] **Dashboard**: Multi-card layout with shadcn/ui Charts + `DateRange` sync via URL params.
- [ ] **Transaction Engine**: Paginated `DataTable` (server-side filtering) + Sheet-based Create/Edit.
- [ ] **CRUD Modules**: Categories, Labels, Budgets — same pattern as transactions.

## 6.4 Reporting & Visualization
- [ ] **Charts**: shadcn/ui Charts (built on Recharts) for period-over-period analysis.
- [ ] **Export**: CSV / JSON transaction export.

## 6.5 Quality & Accessibility
- [ ] **A11y Audit**: ARIA labels and keyboard focus trapping via shadcn/ui.
- [ ] **Performance**: LCP < 2.5s, zero CLS on data-heavy tables.


---

# Phase 7: Hardening & Launch
**Goal**: Transition from "Functional" to "Production-Ready".

## 7.1 Resilience Testing
- [ ] **Critical Path (Playwright)**:
    * Golden Path: Signup → Import → Create Transaction → Budget Alert.
    * Auth Resilience: Session expiry handling.

## 7.2 Performance & Edge Optimization
- [ ] **Core Web Vitals**: Lighthouse 95+ across the board.
- [ ] **PPR**: Enable Next.js 16 Partial Prerendering on the Dashboard.
- [ ] **DB Pooling**: Switch to Neon Serverless Driver with connection pooling.

## 7.3 Security & Compliance
- [ ] **Headers & CSP**: Strict Content Security Policy via `next.config.ts`.
- [ ] **Rate Limiting**: `@upstash/ratelimit` on all `/api/*` and Server Action entry points.
- [ ] **Sanitization**: Audit all Drizzle queries for `userId` scoping.

## 7.4 Monitoring & Observability
- [ ] **Error Tracking**: Sentry with Source Maps (web + mobile).
- [ ] **Performance**: Vercel Speed Insights + OpenTelemetry.

## 7.5 Final Handoff
- [ ] **Documentation**: Update `ARCHITECTURE.md` with final data flow.
- [ ] **Production Env**: Lock Vercel environment variables and rotate secrets.


---

## Timeline Summary

| Phase | Duration | Effort | Dependencies |
|-------|----------|--------|--------------|
| 1. Planning & Specs | 3–5 days | 12–20 hrs | None |
| 2. Design System | 5–7 days | 20–30 hrs | Phase 1 |
| 3. Project Setup & DevOps | 3–4 days | 12–16 hrs | Phase 1 |
| 4. Data Layer | 5–7 days | 20–30 hrs | Phase 3 |
| 5. Backend / API | 7–10 days | 30–40 hrs | Phase 4 |
| 6. Frontend | 10–14 days | 40–60 hrs | Phases 2, 5 |
| 7. Hardening | 5–7 days | 20–30 hrs | Phase 6 |
| **Total** | **8–12 weeks** | **~155–225 hrs** | |

Critical path: Phase 1 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
Parallelizable: Phase 2 (design) runs alongside Phases 3–4.
