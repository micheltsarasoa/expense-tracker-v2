import { sql } from 'drizzle-orm';
import {
  boolean,
  date,
  foreignKey,
  index,
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { categories } from './categories';
import { labels } from './labels';
import { users } from './users';

export const budgets = pgTable(
  'budgets',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    name: varchar({ length: 255 }).notNull(),
    amount: numeric({ precision: 15, scale: 2 }).notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date'),
    categoryId: uuid('category_id'), // nullable — budget can be unscoped
    labelId: uuid('label_id'), // nullable — budget can be unscoped
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('idx_budgets_user').using('btree', table.userId.asc().nullsLast()),
    index('idx_budgets_dates').using(
      'btree',
      table.startDate.asc().nullsLast(),
      table.endDate.asc().nullsLast(),
    ),
    index('idx_budgets_category').using('btree', table.categoryId.asc().nullsLast()),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'budgets_user_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
      name: 'budgets_category_id_fkey',
    }).onDelete('set null'),
    foreignKey({
      columns: [table.labelId],
      foreignColumns: [labels.id],
      name: 'budgets_label_id_fkey',
    }).onDelete('cascade'),
  ],
);
