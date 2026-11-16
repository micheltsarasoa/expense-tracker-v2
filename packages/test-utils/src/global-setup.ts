import { createRequire } from 'node:module';

import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import pg from 'pg';
import type { TestProject } from 'vitest/node';

import * as schema from '@expense-tracker/db/schema';

import { TEMPLATE_DATABASE } from './constants';

// drizzle-kit/api is a CommonJS bundle that Vite cannot transform; load it with Node's require.
const { generateDrizzleJson, generateMigration } = createRequire(import.meta.url)(
  'drizzle-kit/api',
) as typeof import('drizzle-kit/api');

let container: StartedPostgreSqlContainer | undefined;

async function buildTemplate(adminUrl: string): Promise<void> {
  const admin = new pg.Client({ connectionString: adminUrl });
  await admin.connect();
  try {
    await admin.query(`DROP DATABASE IF EXISTS ${TEMPLATE_DATABASE} WITH (FORCE)`);
    await admin.query(`CREATE DATABASE ${TEMPLATE_DATABASE}`);
  } finally {
    await admin.end();
  }

  const statements = await generateMigration(
    generateDrizzleJson({}),
    generateDrizzleJson(schema as Record<string, unknown>),
  );
  const url = new URL(adminUrl);
  url.pathname = `/${TEMPLATE_DATABASE}`;
  const template = new pg.Client({ connectionString: url.toString() });
  await template.connect();
  try {
    for (const statement of statements) await template.query(statement);
  } finally {
    await template.end();
  }
}

/**
 * Vitest global setup: one Postgres 16 per test run, with a template database built from the
 * Drizzle schema. Set TEST_DATABASE_URL to reuse an existing server (CI service) instead of Docker.
 */
export async function setup(project: TestProject): Promise<void> {
  let adminUrl = process.env['TEST_DATABASE_URL'];
  if (!adminUrl) {
    container = await new PostgreSqlContainer('postgres:16-alpine').start();
    adminUrl = container.getConnectionUri();
  }
  await buildTemplate(adminUrl);
  project.provide('testDatabaseUrl', adminUrl);
}

export async function teardown(): Promise<void> {
  await container?.stop();
}
