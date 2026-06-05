import {
  boolean,
  foreignKey,
  index,
  numeric,
  pgTable,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { paymentMethodType } from './enums';
import { timestamps } from './_shared';
import { users } from './users';

export const paymentMethods = pgTable(
  'payment_methods',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    name: varchar({ length: 100 }).notNull(),
    type: paymentMethodType().notNull(),
    initialBalance: numeric('initial_balance', { precision: 15, scale: 2 })
      .default('0.00')
      .notNull(),
    currentBalance: numeric('current_balance', { precision: 15, scale: 2 })
      .default('0.00')
      .notNull(),
    icon: varchar({ length: 50 }),
    color: varchar({ length: 7 }),
    isActive: boolean('is_active').default(true).notNull(),
    ...timestamps,
  },
  (table) => [
    index('idx_payment_methods_user_id').using('btree', table.userId.asc().nullsLast()),
    index('idx_payment_methods_active').using(
      'btree',
      table.userId.asc().nullsLast(),
      table.isActive.asc().nullsLast(),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'payment_methods_user_id_fkey',
    }).onDelete('cascade'),
    unique('unique_user_payment_name').on(table.userId, table.name),
  ],
);
