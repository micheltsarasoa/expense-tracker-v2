import { randomUUID } from 'node:crypto';

import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { inject } from 'vitest';

import * as schema from '@expense-tracker/db/schema';

import { TEMPLATE_DATABASE } from './constants';

export type TestDatabase = NodePgDatabase<typeof schema>;

async function admin<T>(adminUrl: string, run: (client: pg.Client) => Promise<T>): Promise<T> {
  const client = new pg.Client({ connectionString: adminUrl });
  await client.connect();
  try {
    return await run(client);
  } finally {
    await client.end();
  }
}

/**
 * Runs `fn` against a fresh database cloned from the schema template, then drops it.
 * Calls are isolated from each other, including when they run in parallel.
 * Requires the global setup from `@expense-tracker/test-utils/global-setup`.
 */
export async function withTestDb<T>(fn: (db: TestDatabase) => Promise<T>): Promise<T> {
  const adminUrl = inject('testDatabaseUrl');
  const name = `test_${randomUUID().replaceAll('-', '')}`;
  await admin(adminUrl, (client) =>
    client.query(`CREATE DATABASE ${name} TEMPLATE ${TEMPLATE_DATABASE}`),
  );

  const url = new URL(adminUrl);
  url.pathname = `/${name}`;
  const pool = new pg.Pool({ connectionString: url.toString(), max: 4 });
  try {
    return await fn(drizzle({ client: pool, schema }));
  } finally {
    await pool.end();
    await admin(adminUrl, (client) => client.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`));
  }
}
