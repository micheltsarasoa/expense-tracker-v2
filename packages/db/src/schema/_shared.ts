import { sql } from 'drizzle-orm';
import { timestamp } from 'drizzle-orm/pg-core';

/**
 * Shared `created_at` / `updated_at` columns (timestamptz, default now, not null).
 * Spread into a table's column object: `{ ...columns, ...timestamps }`.
 */
export const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
};
