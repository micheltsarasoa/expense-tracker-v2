# @expense-tracker/test-utils

Test helpers for every workspace: a real PostgreSQL 16 per test run (Testcontainers, D-25), one isolated database per test, factories and actors.

## Use it in a workspace

```ts
// vitest.config.ts
export default defineConfig({
  test: { globalSetup: ['@expense-tracker/test-utils/global-setup'], hookTimeout: 120_000 },
});
```

```ts
import { asUser, createPaymentMethod, createUser, withTestDb } from '@expense-tracker/test-utils';

it('creates an expense on the actor account', async () => {
  await withTestDb(async (db) => {
    const user = await createUser(db);
    const account = await createPaymentMethod(db, { userId: user.id, initialBalance: '100.00' });
    // call the service with `db` and `asUser(user)`
  });
});
```

## How it works

- The global setup starts `postgres:16-alpine` once, builds a template database from the Drizzle schema in `packages/db/src/schema`, and shares its URL with the workers.
- `withTestDb` clones the template (`CREATE DATABASE … TEMPLATE`), runs the callback, then drops the clone. Parallel calls never see each other's rows.
- The template comes from the schema, not from the migrations, because the migration history cannot yet build an empty database (baseline is empty). A Phase 1 task replaces this with migrations.

## Requirements

Docker, or set `TEST_DATABASE_URL` to a Postgres 16 server where the test user may create databases (for example a CI service).
