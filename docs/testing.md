# Testing

Test-driven: write the failing test first, then the code (`.claude/rules/tdd.md`). One test per acceptance criterion of the task in [phases.md](roadmap/phases.md).

## Pyramid

| Level            | Tool                                                                       | Where                                                         | Runs against                        | Use for                                                      |
| ---------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------ |
| Unit             | Vitest                                                                     | next to the file (`foo.test.ts`) or the folder's `__tests__/` | nothing (pure code)                 | Domain rules, `Money`, formatting, Zod schemas, pure helpers |
| Integration (db) | Vitest + [`@expense-tracker/test-utils`](../packages/test-utils/README.md) | `*.db.test.ts`                                                | real PostgreSQL 16 (Testcontainers) | Services, queries, balances, tenant isolation                |
| Route            | Vitest                                                                     | `app/api/**/__tests__/`                                       | mocked services or test db          | Status codes, validation, error envelope                     |
| End to end       | Playwright                                                                 | `apps/<app>/e2e/*.spec.ts`                                    | the built app                       | Main user paths, desktop and 390 px                          |
| Hooks and config | `node:test`                                                                | `.claude/hooks/test/`, `packages/config/test/`                | spawned scripts, ESLint API         | Agent guards, lint boundaries                                |

Prefer the lowest level that proves the criterion. Never mock Drizzle or Postgres: use `withTestDb`.

## Naming

- Files: `<subject>.test.ts`, `<subject>.db.test.ts`, `<flow>.spec.ts`.
- `describe` names the unit (`TransactionService`), `it` states the behaviour in plain English with [GLOSSARY.md](../GLOSSARY.md) terms: `it('an expense lowers the account balance')`, not `it('works')` or `it('pocketMoney…')`.
- Every route, server action or service method has negative access tests (skill `tenant-isolation-tests`).

## Commands

```bash
pnpm test                                  # all workspaces (Docker needed for *.db.test.ts)
pnpm test:coverage                         # with coverage and the merged summary
pnpm --filter web exec vitest run --project unit   # web unit tests only, no Docker
pnpm --filter web test:e2e                 # Playwright smoke (needs a build and placeholder env)
pnpm test:hooks                            # agent hooks
```

No Docker? Point `TEST_DATABASE_URL` at a Postgres 16 server where the user may create databases.

## Coverage (D-26)

- `apps/web`: ratchet. Thresholds in `apps/web/vitest.config.ts` sit at the current floor and rise automatically when coverage grows (commit the change); CI fails on any drop. Target 80 % before 1.0.
- New packages start with blocking thresholds: 80 % (`packages/test-utils`), 90 % for `packages/core` when it is created.
- CI prints one merged table and uploads the reports.

## Test data

- Factories in `@expense-tracker/test-utils` (`createUser`, `createPaymentMethod`, `createCategory`); add new ones there, not in test files.
- Amounts are decimal strings (`'12.34'`), never numbers.
- No real personal data, and never data about a real child.
