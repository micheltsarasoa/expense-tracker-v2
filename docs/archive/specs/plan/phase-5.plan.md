> **Outdated.** Archived in phase 0; it may contradict the code. Sources of truth: [docs/agents/README.md](../../../agents/README.md).

# Phase 5: API & Backend Logic

## Context

Phase 3 (monorepo scaffold) and Phase 4 (DB schema + client) are merged. The codebase now has:

- `packages/db`: 7-table Drizzle schema, Neon HTTP client, `SelectX`/`InsertX` types, `withUserScope` helper
- `packages/types`: stub only (`export {}`) — needs full implementation
- `apps/web`: bare Next.js 16 scaffold (layout + page only — no auth, no routes, no services)

Phase 5 builds the entire backend: shared types, auth, API infrastructure, service layer, route handlers, and unit tests.

**Critical first action before coding:** Confirm the Neon Auth SDK package name from the Neon dashboard. Expected: `@stackframe/stack`. All auth file signatures below assume this — swap if different.

---

## Architecture Patterns

### 1. `BaseService<TTable>` — Shared Error Handling

All domain services extend this abstract class. It owns the two most common guard patterns so they're never duplicated.

```ts
// apps/web/services/base.service.ts
import { AppError } from '@expense-tracker/types';
import type { Database } from '@expense-tracker/db';

export abstract class BaseService {
  constructor(protected readonly db: Database) {}

  /** Throw NotFound if the row doesn't belong to this user (or doesn't exist). */
  protected assertOwned<T extends { userId: string } | null>(
    row: T,
    id: string,
  ): asserts row is NonNullable<T> {
    if (!row) throw AppError.notFound(`Resource ${id} not found`);
  }

  /** Throw Forbidden if the caller doesn't own the row. */
  protected assertNotSystem<T extends { isDefault?: boolean }>(row: T): void {
    if (row.isDefault) throw AppError.forbidden('Cannot modify a system default');
  }
}
```

Every domain service then just does:

```ts
export class CategoryService extends BaseService {
  constructor(db: Database) {
    super(db);
  }
  // ...
}
```

---

### 2. Full Class Signatures

#### `TransactionService`

```ts
// apps/web/services/transaction.service.ts
import { BaseService } from './base.service';
import type { Database, SelectTransaction } from '@expense-tracker/db';
import type {
  CreateTransactionInput, // z.infer<typeof createTransactionSchema>
  UpdateTransactionInput, // z.infer<typeof updateTransactionSchema>
  TransactionFilters, // z.infer<typeof transactionFiltersSchema>
} from '@expense-tracker/types';

/** Pure helper — exported for unit tests (no DB needed). */
export function balanceDelta(
  type: 'income' | 'expense' | 'transfer',
  amount: string,
): { fromDelta: string; toDelta: string | null } {
  /* ... */
}

export class TransactionService extends BaseService {
  constructor(db: Database) {
    super(db);
  }

  async list(
    userId: string,
    filters: TransactionFilters,
  ): Promise<{ data: SelectTransaction[]; total: number }>;

  async findById(userId: string, id: string): Promise<SelectTransaction>;

  /** Opens db.transaction() — inserts row + updates paymentMethod balance(s). */
  async create(userId: string, data: CreateTransactionInput): Promise<SelectTransaction>;

  /** Opens db.transaction() — reverses old delta, applies new delta, updates row. */
  async update(
    userId: string,
    id: string,
    data: UpdateTransactionInput,
  ): Promise<SelectTransaction>;

  /** Opens db.transaction() — reverses delta, sets isDeleted = true. */
  async delete(userId: string, id: string): Promise<void>;

  /** No balance effect — toggles isValidated only. */
  async toggleValidate(userId: string, id: string): Promise<SelectTransaction>;
}
```

#### `BudgetService`

```ts
// apps/web/services/budget.service.ts
import { BaseService } from './base.service';
import type { Database, SelectBudget } from '@expense-tracker/db';
import type {
  CreateBudgetInput,
  UpdateBudgetInput,
  DuplicateBudgetInput,
} from '@expense-tracker/types';

/** Budget row enriched with computed spending fields. */
export type BudgetWithSpending = SelectBudget & {
  spent: string; // SUM of matching expense transactions
  remaining: string; // amount - spent (can be negative)
  pct: number; // spent / amount * 100, capped at 999
};

export class BudgetService extends BaseService {
  constructor(db: Database) {
    super(db);
  }

  /** Single query with conditional aggregation — no N+1. */
  async list(userId: string): Promise<BudgetWithSpending[]>;

  async findById(userId: string, id: string): Promise<BudgetWithSpending>;

  async create(userId: string, data: CreateBudgetInput): Promise<SelectBudget>;

  async update(userId: string, id: string, data: UpdateBudgetInput): Promise<SelectBudget>;

  async delete(userId: string, id: string): Promise<void>;

  /** Copies name/amount/categoryId/labelId — only dates change. */
  async duplicate(
    userId: string,
    id: string,
    data: DuplicateBudgetInput, // { startDate, endDate }
  ): Promise<SelectBudget>;
}
```

---

### 3. The Controller Pattern

Every route handler reduces to the same four-step pipeline: **Auth → Validate → Service → Respond**. Rather than repeating the try/catch in 20+ files, a single wrapper enforces it.

```ts
// apps/web/lib/controller.ts
import type { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from './auth';
import { apiSuccess, handleError } from './api';

type RouteContext = { params: Promise<Record<string, string>> };

type Handler<TResult> = (
  req: NextRequest,
  userId: string,
  params: Record<string, string>,
) => Promise<TResult>;

/**
 * Wraps a route handler with the standard Auth → Execute → Respond pipeline.
 * The wrapped function is a valid Next.js Route Handler export.
 *
 * Usage:
 *   export const GET = controller(async (req, userId) => {
 *     return categoryService.list(userId);
 *   });
 */
export function controller<TResult>(
  handler: Handler<TResult>,
  status = 200,
): (req: NextRequest, ctx: RouteContext) => Promise<NextResponse> {
  return async (req, ctx) => {
    try {
      const { userId } = await getAuthenticatedUser();
      const params = await ctx.params;
      const result = await handler(req, userId, params);
      return apiSuccess(result, status);
    } catch (err) {
      return handleError(err);
    }
  };
}
```

A complete route file using the pattern (categories example):

```ts
// apps/web/app/api/v1/categories/route.ts
import { parseBody, parseQuery } from '@/lib/validate';
import { createCategorySchema } from '@expense-tracker/types';
import { controller } from '@/lib/controller';
import { categoryService } from '../_services'; // module-level singleton

export const GET = controller(async (_req, userId) => categoryService.list(userId));

export const POST = controller(async (req, userId) => {
  const data = await parseBody(req, createCategorySchema);
  return categoryService.create(userId, data);
}, 201);
```

Services are instantiated once per module in `apps/web/app/api/v1/_services.ts`:

```ts
// apps/web/app/api/v1/_services.ts
import { db } from '@expense-tracker/db';
import { CategoryService } from '@/services/category.service';
import { TransactionService } from '@/services/transaction.service';
// ... etc.

export const categoryService = new CategoryService(db);
export const transactionService = new TransactionService(db);
// ...
```

---

### 4. Data Flow: `Transaction.create()` (Atomic Balance Update)

This is the highest-risk operation — a failure mid-flight must roll back everything.

```
POST /api/v1/transactions
        │
        ▼
[controller wrapper]
  1. getAuthenticatedUser()          → userId (throws 401 if no session)
  2. parseBody(req, createTransactionSchema)
     → validates discriminated union (income/expense/transfer)
     → throws 422 if Zod parse fails
        │
        ▼
[TransactionService.create(userId, data)]
  3. Compute deltas (pure, no I/O):
       balanceDelta(data.type, data.amount)
       → { fromDelta: '+4500.00', toDelta: null }   (example: income)

  4. Open db.transaction(async (tx) => {
       ┌─────────────────────────────────────────────┐
       │  a. INSERT INTO transactions (...)           │
       │     RETURNING *  → newRow                   │
       │                                             │
       │  b. UPDATE payment_methods                  │
       │     SET current_balance =                   │
       │       current_balance + fromDelta           │
       │     WHERE id = data.paymentMethodId         │
       │       AND user_id = userId   ← scope guard  │
       │                                             │
       │  c. (transfer only)                         │
       │     UPDATE payment_methods                  │
       │     SET current_balance =                   │
       │       current_balance + toDelta             │
       │     WHERE id = data.toPaymentMethodId       │
       │       AND user_id = userId                  │
       └─────────────────────────────────────────────┘
       If any step throws → Postgres rolls back all three writes atomically.
     })

  5. Return newRow
        │
        ▼
[controller wrapper]
  6. apiSuccess(newRow, 201)  → { success: true, data: { id, amount, ... } }
```

**What can go wrong and how it's handled:**

| Failure point                             | Error thrown                                                        | HTTP status |
| ----------------------------------------- | ------------------------------------------------------------------- | ----------- |
| No session cookie                         | `AppError.unauthorized()`                                           | 401         |
| Zod validation fails                      | `AppError.validation(zodMsg)`                                       | 422         |
| `paymentMethodId` not owned by user       | UPDATE matches 0 rows → throw `AppError.notFound()`                 | 404         |
| Both accounts are the same (transfer)     | Caught by `createTransactionSchema` `.refine()`                     | 422         |
| Postgres constraint violation             | Caught by `handleError` → `AppError.internal()`                     | 500         |
| Any step inside `db.transaction()` throws | Full rollback — `transactions` and `payment_methods` both unchanged | varies      |

---

## Implementation Order (strict — each step unblocks the next)

### Step 1 — `packages/types`: Errors, Schemas, Formatting

**New files:**

`packages/types/src/errors.ts`

- `ErrorCode` const object (not TS enum — required by `verbatimModuleSyntax`): `VALIDATION_ERROR` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `UNPROCESSABLE` (422), `INTERNAL` (500)
- `ErrorCodeValue` union type derived from the const object
- `AppError extends Error`: fields `readonly code: ErrorCodeValue`, `readonly status: number`; derives status from a static map; static factories: `AppError.notFound()`, `.unauthorized()`, `.forbidden()`, `.conflict(msg)`, `.validation(msg)`, `.unprocessable(msg)`, `.internal(msg)` — only constructors services should use
- `ApiResponse<T>` discriminated union: `{ success: true; data: T } | { success: false; error: { code: ErrorCodeValue; message: string } }`

`packages/types/src/schemas/settings.ts` — `updateSettingsSchema` (all optional, `.refine()` that decimal ≠ thousand separator), `settingsResponseSchema`

`packages/types/src/schemas/category.ts` — `createCategorySchema`, `updateCategorySchema` (partial); hex color regex, max-length guards

`packages/types/src/schemas/label.ts` — `createLabelSchema`, `updateLabelSchema`

`packages/types/src/schemas/payment-method.ts` — `createPaymentMethodSchema`, `updatePaymentMethodSchema`; note: `initialBalance` excluded from update (immutable after create)

`packages/types/src/schemas/transaction.ts` — most complex; discriminated union on `type`:

- `incomeExpenseSchema`: requires `categoryId`, no `toPaymentMethodId`
- `transferSchema`: requires `toPaymentMethodId`, no `categoryId`, `.refine()` that both accounts differ
- `createTransactionSchema = z.discriminatedUnion('type', [incomeExpenseSchema, transferSchema])`
- `transactionFiltersSchema`: query params (type, categoryId, labelId, paymentMethodId, from/to dates, isValidated, page/pageSize)

`packages/types/src/schemas/budget.ts` — `createBudgetSchema`, `updateBudgetSchema`, `duplicateBudgetSchema` (startDate + endDate only); all with `.refine()` that endDate > startDate

`packages/types/src/schemas/import.ts` — `importRowSchema`, `importRowResultSchema`, `importResponseSchema`

`packages/types/src/formatting.ts` — `formatAmount()`, `formatDate()`, `formatDateTime()`; uses `import type { SelectUserSettings } from '@expense-tracker/db'` (type-only → zero runtime dep, allowed by `verbatimModuleSyntax`)

**Modify:**
`packages/types/src/index.ts` — replace stub with `export *` for all of the above

**No new deps** — zod already installed.

---

### Step 2 — Neon Auth Setup

**Install (verify package name first):**

```bash
pnpm --filter @expense-tracker/web add @stackframe/stack
```

**New env vars** (add to `.env.local` + Vercel env):

```
NEXT_PUBLIC_STACK_PROJECT_ID=
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=
STACK_SECRET_SERVER_KEY=
```

**New files:**

`apps/web/lib/stack.ts` — initializes and exports `stackServerApp = new StackServerApp({ tokenStore: 'nextjs-cookie' })`; this is the singleton used everywhere

`apps/web/proxy.ts` — exports `neonAuthMiddleware({ loginUrl: '/auth/sign-in' })` as default; matcher excludes `/auth/*`, `/api/auth/*`, `/_next/*`, `/favicon.ico`

`apps/web/app/api/auth/[...path]/route.ts` — single line: `export const { GET, POST } = stackServerApp.createNextjsHandler()`

`apps/web/lib/auth.ts` — `getAuthenticatedUser(): Promise<{ userId: string }>` wraps `stackServerApp.getUser()`; throws `AppError.unauthorized()` if no session; this is the only auth call route handlers should make

---

### Step 3 — API Infrastructure

**Install:**

```bash
pnpm --filter @expense-tracker/web add pino
```

**New files:**

`apps/web/lib/logger.ts` — pino instance; `level` from `LOG_LEVEL` env var; do NOT set `transport` in production (Vercel captures stdout as structured JSON)

`apps/web/lib/api.ts` — three exports:

- `apiSuccess<T>(data: T, status = 200): NextResponse` — wraps in `{ success: true, data }`
- `apiError(err: AppError): NextResponse` — wraps in `{ success: false, error: { code, message } }`, uses `err.status`
- `handleError(err: unknown): NextResponse` — if `AppError` delegate to `apiError`; else `logger.error` + return `AppError.internal()` (never leak stack traces to clients)

`apps/web/lib/validate.ts` — two exports:

- `parseBody<T>(req: NextRequest, schema: ZodSchema<T>): Promise<T>` — parses JSON, safeParse, throws `AppError.validation()` on failure with formatted Zod message
- `parseQuery<T>(searchParams: URLSearchParams, schema: ZodSchema<T>): T` — same for query strings

`apps/web/lib/controller.ts` — the `controller()` wrapper (see Architecture Patterns §3)

---

### Step 4 — Service Layer

All services live in `apps/web/services/`. Rules:

- No `next/headers` or any Next.js import — framework-agnostic
- Extend `BaseService` (see Architecture Patterns §1) — constructor receives `db: Database`
- Every public method takes `userId: string` as first arg
- Always use `withUserScope` for inserts; always scope selects with `eq(table.userId, userId)` + `isDeleted = false` where applicable
- Multi-tenant violation is a P0 bug

**Build in this order:**

`apps/web/services/base.service.ts` — `BaseService` abstract class (see Architecture Patterns §1). Build this first.

`apps/web/services/settings.service.ts`

- `getByUserId(userId)` — select + throw `notFound` if missing
- `upsert(userId, data)` — `INSERT ... ON CONFLICT (user_id) DO UPDATE SET ...`

`apps/web/services/category.service.ts`

- `list(userId)` — user's categories UNION system defaults (userId IS NULL); order: isDefault DESC, name ASC
- `findById(userId, id)` — must be owned by userId OR be a system default
- `create(userId, data)` — if parentId provided: verify parent is root-level and same type
- `update(userId, id, data)` — throws `forbidden` if trying to modify a system default
- `delete(userId, id)` — throws `conflict` if any non-deleted transactions reference this categoryId

`apps/web/services/label.service.ts` — standard CRUD; delete is safe (ON DELETE SET NULL in schema)

`apps/web/services/payment-method.service.ts`

- `list(userId, includeInactive?)` — default isActive = true only
- `create(userId, data)` — sets `currentBalance = initialBalance`; pre-check name uniqueness for better error message (DB unique constraint is the enforcement)
- `update(userId, id, data)` — cannot update `initialBalance` or `currentBalance`
- `deactivateOrDelete(userId, id)` — if transactions exist: `isActive = false` + return `{ action: 'deactivated' }`; else hard delete + return `{ action: 'deleted' }`

`apps/web/services/transaction.service.ts` — most complex; extract a module-level (exported for testing) pure helper:

```ts
export function balanceDelta(
  type: 'income' | 'expense' | 'transfer',
  amount: string,
): { fromDelta: string; toDelta: string | null };
// income:   fromDelta = +amount, toDelta = null
// expense:  fromDelta = -amount, toDelta = null
// transfer: fromDelta = -amount, toDelta = +amount
```

All three mutating methods (`create`, `update`, `delete`) run inside `db.transaction()`:

- `create`: insert row → apply balance delta to paymentMethod(s)
- `update`: load old row → reverse old delta → apply new delta → update row (handles type changes)
- `delete`: load row → reverse delta → set `isDeleted = true`
- `list(userId, filters)` — applies all filters + `isDeleted = false`; returns `{ data, total }` for pagination
- `toggleValidate(userId, id)` — no balance effect; simple boolean toggle

`apps/web/services/budget.service.ts`

- `list`/`findById` both compute `spent` and `remaining` alongside each budget; `spent` = SUM of expense transactions in date range matching the budget's optional categoryId/labelId filters; use a single query with conditional aggregation rather than N+1
- `duplicate(userId, id, data)` — copies name/amount/categoryId/labelId with new startDate/endDate

`apps/web/services/report.service.ts`

- `spendingByCategory` — GROUP BY categoryId with JOIN for name; compute percentages
- `incomeVsExpenses` — DATE_TRUNC('month') GROUP BY month + type; pivot into `{ month, income, expenses, net }`
- `balanceHistory` — running SUM window function per account (use `sql` template for the window clause)
- `budgetVsActual` — same as budget list but shaped for chart output with percentage field

`apps/web/services/import.service.ts`

- Constructor also takes `transactionService: TransactionService` (dependency injection)
- `validate(userId, fileBuffer, mimeType)` — parse CSV/Excel, enforce 1000-row max, resolve entity names to IDs in bulk (load accounts/categories/labels once — avoid N+1), return per-row validation results; NO writes
- `commit(userId, fileBuffer, mimeType)` — re-runs validate internally; batches all valid rows into a single `db.transaction()` call using `transactionService.create()`

**Install for import:**

```bash
pnpm --filter @expense-tracker/web add papaparse xlsx
pnpm --filter @expense-tracker/web add -D @types/papaparse
```

---

### Step 5 — Route Handlers

All live under `apps/web/app/api/v1/`. Every handler uses the `controller()` wrapper (see Architecture Patterns §3) — no raw try/catch in any route file.

Services are instantiated once in `apps/web/app/api/v1/_services.ts` and imported by each route (stateless — safe to share across requests).

**Files to create (create static segments before dynamic to avoid Next.js route conflicts):**

Settings (2 handlers in 1 file):

- `settings/route.ts` — GET, PUT

Categories (4 handlers, 2 files):

- `categories/route.ts` — GET, POST
- `categories/[id]/route.ts` — PUT, DELETE

Labels (4 handlers, 2 files):

- `labels/route.ts` — GET, POST
- `labels/[id]/route.ts` — PUT, DELETE

Payment methods (4 handlers, 2 files):

- `payment-methods/route.ts` — GET, POST
- `payment-methods/[id]/route.ts` — PUT, DELETE

Transactions (create in this order to avoid routing conflicts):

- `transactions/import/template/route.ts` — GET (returns CSV with headers, `Content-Disposition: attachment`)
- `transactions/import/validate/route.ts` — POST (multipart via `req.formData()`)
- `transactions/import/route.ts` — POST (multipart)
- `transactions/route.ts` — GET, POST
- `transactions/[id]/validate/route.ts` — PATCH (toggle isValidated)
- `transactions/[id]/route.ts` — GET, PUT, DELETE

Budgets:

- `budgets/route.ts` — GET, POST
- `budgets/[id]/duplicate/route.ts` — POST
- `budgets/[id]/route.ts` — GET, PUT, DELETE

Reports (4 files, GET only):

- `reports/spending-by-category/route.ts`
- `reports/income-vs-expenses/route.ts`
- `reports/balance-history/route.ts`
- `reports/budget-vs-actual/route.ts`

---

### Step 6 — Vitest + Unit Tests

**Install:**

```bash
pnpm --filter @expense-tracker/web add -D vitest @vitest/coverage-v8
```

`apps/web/vitest.config.ts` — `environment: 'node'`, `globals: true`, path alias `@` → repo root

**Add to `apps/web/package.json` scripts:** `"test": "vitest run"`, `"test:watch": "vitest"`, `"test:coverage": "vitest run --coverage"`

`apps/web/services/__tests__/transaction.service.test.ts` — tests for the exported `balanceDelta` pure function (no DB mock needed):

- income → `fromDelta = +amount`, `toDelta = null`
- expense → `fromDelta = -amount`, `toDelta = null`
- transfer → `fromDelta = -amount`, `toDelta = +amount`

`apps/web/services/__tests__/budget.service.test.ts` — tests for `spent`/`remaining` computation using a mock `db` that returns canned transaction rows

---

## Deferred (out of scope for Phase 5)

| Item                         | Reason                          | Phase |
| ---------------------------- | ------------------------------- | ----- |
| OpenAPI / zod-to-openapi     | Polish, not blocking            | 7     |
| MSW (Mock Service Worker)    | Integration testing layer       | 7     |
| Budget suggestions algorithm | P1 scope 1, rule-based AI       | 7     |
| shadcn/ui init               | Blocked on Phase 2 Figma tokens | 2 → 6 |

---

## Critical Files

| File                                        | Risk                                                             |
| ------------------------------------------- | ---------------------------------------------------------------- |
| `apps/web/proxy.ts`                         | Wrong matcher silently breaks auth for all routes                |
| `apps/web/services/base.service.ts`         | All services inherit from this — wrong guards cascade everywhere |
| `apps/web/services/transaction.service.ts`  | Balance update atomicity is the highest-risk logic in the app    |
| `apps/web/lib/controller.ts`                | All 20+ route handlers depend on this for auth + error pipeline  |
| `apps/web/lib/api.ts`                       | Every route handler depends on this for consistent error shapes  |
| `apps/web/app/api/v1/_services.ts`          | Module-level singletons — wrong `db` instance breaks all routes  |
| `packages/types/src/errors.ts`              | AppError is the error vocabulary for the entire stack            |
| `packages/types/src/schemas/transaction.ts` | Discriminated union must match DB check constraints exactly      |

## Verification (end-to-end check after implementation)

1. `pnpm typecheck` — zero errors across all workspaces
2. `pnpm --filter @expense-tracker/web test` — all unit tests pass
3. Manual: `POST /api/v1/auth/...` → sign up → receive cookie
4. Manual: `POST /api/v1/transactions` (income) → verify paymentMethod.currentBalance increased in DB
5. Manual: `POST /api/v1/transactions` (transfer) → verify both accounts updated atomically
6. Manual: `GET /api/v1/budgets` → `spent` field matches sum of matching transactions
7. Manual: `POST /api/v1/transactions/import` with a CSV file → verify rows inserted + balances updated
