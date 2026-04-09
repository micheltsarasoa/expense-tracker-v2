

# Phase 1: Foundation & Specs
**Goal**: Establish a "Source of Truth" to prevent drift during implementation.

## 1.1 Product Definition (`docs/prd.md`)
- [ ] **Feature Inventory**: Map 9 core areas (Auth, Trans, Acc, Cat, Label, Budg, Repo, Imp, Set).
- [ ] **Scope Hardening**: Review 0-byte stubs (`account-card.tsx`, etc.). 
  * *Constraint*: If not defined in PRD, Claude must refuse implementation.
- [ ] **Priority Matrix**: Assign P0 (Core Tracking) vs P1/P2 (Reporting/UI Polish).

## 1.2 Tech Architecture (`docs/tech-spec.md`)
- [ ] **Data Flow Enforcement**: 
    `Client -> TanStack Query -> Route Handler -> Service -> Drizzle -> Neon`
- [ ] **Auth Strategy**: Formalize Auth.js v5 + JWT Middleware logic.
- [ ] **Error Contract**: Define `AppError` hierarchy (validation, auth, database).
- [ ] **Environment Mapping**: Validate `.env.example` against tech selections.

## 1.3 Schema Design (`packages/db/schema/`)
- [ ] **ERD Draft**: Mermaid diagram of the 7-table schema.
- [ ] **Type Safety**: Replace SQL `CHECK` constraints with Drizzle Enums.
- [ ] **Budget Logic**: Resolve `NOT NULL` constraints for `categoryId`/`labelId`.

## 1.4 Workspace Setup (The "Claude-Ready" Repo)
- [ ] **Project Context**: Initialize `CLAUDE.md` and `.claude/settings.json`.
- [ ] **Standardization**: Configure ESlint/Prettier to enforce the "Strict TS" and "Kebab-case" rules.

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
    * *Config*: App Router, TS (Strict), Tailwind v4, `src/` directory, Turbopack enabled.
- [ ] **shadcn/ui v2026**: `pnpm dlx shadcn@latest init`
    * *Note*: Use the `--preset` flag to match Figma tokens from Phase 2.
- [ ] **Agent Guard**: Verify `CLAUDE.md` and `AGENTS.md` are at root.

## 3.2 Quality Gates (The "Janitor" Layer)
- [ ] **Strict Linting**: 
    * Add `typescript-eslint` strict & stylistic presets.
    * Add `eslint-plugin-react-compiler` (for React 19 optimization).
- [ ] **Git Hooks (Husky)**:
    * `pre-commit`: Run `lint-staged` (ESLint + Prettier + `tsc --noEmit`).
    * `commit-msg`: Enforce Conventional Commits (feat:, fix:, chore:).

## 3.3 Database & Local Dev (`docker/`)
- [ ] **Containerization**: `docker-compose.yml` for PostgreSQL 16 + Redis (for caching).
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
- [ ] **Multi-Label Logic**: Implement `transactionLabels` junction table for M:N relationships.

## 4.2 Neon Infrastructure
- [ ] **Client Initialization**: Setup `drizzle-orm/neon-http` for Edge compatibility.
- [ ] **Migration Hub**: Configure `drizzle.config.ts` to support both local Docker and Neon branching.
- [ ] **Type Inference**: Export `InsertTransaction` and `SelectTransaction` types for use in `packages/types`.

## 4.3 Service Layer & Logic
- [ ] **Balance Strategy**: 
    * *Decision*: Deprecate SQL Triggers. 
    * *Action*: Implement a `TransactionService` that handles balance updates as a **Database Transaction**.
- [ ] **Query Repository**: Port all raw SQL queries to Drizzle Relational Queries (RQB).
- [ ] **Multi-Tenant Scoping**: Create a `withUserScope` middleware for Drizzle queries to auto-inject `userId`.

## 4.4 Seeding & Validation
- [ ] **Data Factory**: Convert legacy `seed/route.ts` into a standalone TS script using `@faker-js/faker`.
- [ ] **Migration Drill**: Run `generate` -> `migrate` -> `seed` cycle to verify schema integrity.


--- 

# Phase 5: API & Backend Logic
**Goal**: Industrial-grade security and type-safe business logic.

## 5.1 Service Layer (`src/services/`)
- [ ] **Domain Services**: Port `TransactionService`, `BudgetService`, etc.
    * *Rule*: Services must be framework-agnostic (no `next/headers`).
- [ ] **Error Mapping**: Implement `AppError` (code, message, status) for predictable failures.
- [ ] **Transaction Wrappers**: Ensure multi-step logic (e.g., adding an expense + updating budget) uses `db.transaction`.

## 5.2 Next.js 15 Auth & Middleware
- [ ] **Auth.js v5**: Implement the new `auth.ts` config with JWT + Neon Adapter.
- [ ] **Edge Middleware**: Enforce route protection and `userId` extraction at the Edge.
- [ ] **Password Security**: Use `argon2` (2026 standard) over `bcrypt` for hashing.

## 5.3 Request Validation & API (`src/app/api/`)
- [ ] **Zod Integration**: Shared schemas from `packages/types` for all inputs.
- [ ] **Route Handlers**: Build `GET/POST/PATCH/DELETE` for mobile app consumption.
- [ ] **Server Actions**: Build the mutation layer for the web app (utilizing `useActionState`).

## 5.4 API Docs & Observability
- [ ] **OpenAPI / Swagger**: Auto-generate `openapi.json` from Zod schemas using `zod-to-openapi`.
- [ ] **Logger**: Setup a structured logger (e.g., `pino`) for production debugging.

## 5.5 Testing Suite
- [ ] **Vitest Integration**: Unit tests for services with 100% logic coverage.
- [ ] **API Mocks**: Setup `msw` (Mock Service Worker) for integration testing.


--- 

# Phase 6: Frontend implementation
**Goal**: Pixel-perfect, high-performance UI with optimistic state management.

## 6.1 Core Architecture (`src/components/layout/`)
- [ ] **The "Global Shell"**: Implement the Root Layout with `Auth`, `QueryClient`, and `Theme` providers.
- [ ] **Responsive Navigation**: 
    * Desktop: Sidebar.
    * Mobile: Bottom Tab Bar + Navigation Drawer.
- [ ] **Loading Strategy**: Implement `loading.tsx` at the route level using the Skeleton components from Phase 2.

## 6.2 Data Fetching Layer (`src/hooks/`)
- [ ] **Domain Hooks**: Create `useTransactions`, `useBudgets`, etc., using TanStack Query v5.
- [ ] **Optimistic UI**: Implement `onMutate` for all CRUD actions to ensure "instant" feeling.
- [ ] **Prefetching**: Use `queryClient.prefetchQuery` in Server Components to eliminate waterfall loads.

## 6.3 Feature Implementation (`src/components/features/`)
- [ ] **Dashboard**: Multi-card layout with spending charts (Recharts) and `DateRange` sync via URL params.
- [ ] **The "Transaction Engine"**: 
    * Paginated `DataTable` with server-side filtering.
    * Modal-based Create/Edit flows using `useActionState` (React 19).
- [ ] **CRUD Modules**: Deploy identical patterns for Categories, Labels, and Budgets to maintain consistency.

## 6.4 Reporting & Visualization
- [ ] **Dynamic Charts**: Interactive Recharts for period-over-period spending analysis.
- [ ] **PDF/Export**: Implement CSV/JSON export for transaction data.

## 6.5 Quality & Accessibility
- [ ] **A11y Audit**: Ensure all components have ARIA labels and keyboard focus trapping (via shadcn/ui).
- [ ] **Performance Check**: Verify LCP < 2.5s and zero Layout Shift (CLS) on data-heavy tables.


--- 

# Phase 7: Hardening & Launch
**Goal**: Transition from "Functional" to "Production-Ready" with 99.9% confidence.

## 7.1 Resilience Testing (`tests/e2e/`)
- [ ] **Critical Path Automation**: Playwright scripts for:
    * *The Golden Path*: Signup -> Connect Bank/Import -> Create Transaction -> Budget Alert.
    * *Auth Resilience*: Password reset and Session expiry handling.
- [ ] **Mobile Parity Check**: Run Playwright against the Expo web-build to ensure touch-targets work.

## 7.2 Performance & Edge Optimization
- [ ] **Core Web Vitals**: Hit Lighthouse 95+ across the board.
- [ ] **PPR (Partial Prerendering)**: Enable Next.js 15 PPR on the Dashboard to show static shells instantly while streaming dynamic data.
- [ ] **DB Pooling**: Switch from `neon-http` to the Neon `Serverless Driver` with connection pooling for high-concurrency production traffic.

## 7.3 Security & Compliance
- [ ] **Headers & CSP**: Strict Content Security Policy via `next.config.js`.
- [ ] **Rate Limiting**: Implement `upstash/ratelimit` on all `/api/*` and Server Action entry points.
- [ ] **Sanitization**: Audit all Drizzle queries for `userId` scoping (Multi-tenant leak check).

## 7.4 Monitoring & Observability
- [ ] **Error Tracking**: Initialize **Sentry** with Source Maps for both Web and Mobile.
- [ ] **Performance Insights**: Enable Vercel Speed Insights and OpenTelemetry (OTEL) collectors.
- [ ] **Usage Analytics**: Setup basic event tracking for core feature usage.

## 7.5 Final Handoff
- [ ] **Documentation**: Update `ARCHITECTURE.md` with the final data flow.
- [ ] **Production Env**: Lockdown Vercel environment variables and rotate secrets.


--- 

Timeline Summary

|  Phase|Duration |Effort |Dependencies |
|-------|---------|-------|-------------|
| 1. Planning and Documentation	| 3-5 days	| 12-20 hrs	| None|
| 2. UI/UX Design	| 5-7 days	| 20-30 hrs	| Phase 1|
| 3. Project Setup and DevOps	| 3-4 days	| 12-16 hrs	| Phase 1|
| 4. Data Layer	| 5-7 days	| 20-30 hrs	| Phase 3|
| 5. Backend/API	| 7-10 days	| 30-40 hrs	| Phase 4|
| 6. Frontend Development	| 10-14 days	| 40-60 hrs	| Phases 2, 5|
| 7. Finalization	| 5-7 days	| 20-30 hrs	| Phase 6|
| Total	| 8-12 weeks	| ~155-225 hrs	| |


Critical path: Phase 1 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
Parallelizable: Phase 2 (design) runs in parallel with Phases 3-4 (setup and data layer).

---

Next Steps

    [ ] Start Phase 1 by drafting the PRD and tech spec
    [ ] Lock architectural decisions using the Decision Matrix above
    [ ] Create a CONTRIBUTING.md that documents the development workflow
    [ ] Set up Phase 3 (project initialization) once Phase 1 decisions are finalized
    [ ] Run Phase 2 (design) in parallel with Phase 3 to save time

This roadmap is your blueprint. Reference it as you execute each phase, and update it if new decisions emerge.