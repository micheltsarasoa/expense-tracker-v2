import { sql } from 'drizzle-orm';
import { foreignKey, index, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { users } from './users';

export const labels = pgTable(
  'labels',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    name: varchar({ length: 255 }).notNull(),
    color: varchar({ length: 7 }).default('#6B7280').notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('idx_labels_user').using('btree', table.userId.asc().nullsLast()),
    index('idx_labels_name').using(
      'btree',
      table.userId.asc().nullsLast(),
      table.name.asc().nullsLast(),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'labels_user_id_fkey',
    }).onDelete('cascade'),
  ],
);
