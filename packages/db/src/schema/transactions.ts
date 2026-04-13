import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  foreignKey,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { transactionType } from './enums';
import { categories } from './categories';
import { labels } from './labels';
import { paymentMethods } from './payment-methods';
import { users } from './users';

export const transactions = pgTable(
  'transactions',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    type: transactionType().notNull(),
    amount: numeric({ precision: 15, scale: 2 }).notNull(),
    transactionDate: date('transaction_date').notNull(),
    categoryId: uuid('category_id'),
    labelId: uuid('label_id'),
    paymentMethodId: uuid('payment_method_id').notNull(),
    toPaymentMethodId: uuid('to_payment_method_id'),
    description: text(),
    isValidated: boolean('is_validated').default(false).notNull(),
    isDeleted: boolean('is_deleted').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('idx_transactions_user_id').using('btree', table.userId.asc().nullsLast()),
    index('idx_transactions_date').using(
      'btree',
      table.userId.asc().nullsLast(),
      table.transactionDate.desc().nullsFirst(),
    ),
    index('idx_transactions_type').using(
      'btree',
      table.userId.asc().nullsLast(),
      table.type.asc().nullsLast(),
    ),
    index('idx_transactions_not_deleted').using(
      'btree',
      table.userId.asc().nullsLast(),
      table.isDeleted.asc().nullsLast(),
    ),
    index('idx_transactions_category').using('btree', table.categoryId.asc().nullsLast()),
    index('idx_transactions_label').using('btree', table.labelId.asc().nullsLast()),
    index('idx_transactions_payment_method').using(
      'btree',
      table.paymentMethodId.asc().nullsLast(),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'transactions_user_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
      name: 'transactions_category_id_fkey',
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.labelId],
      foreignColumns: [labels.id],
      name: 'transactions_label_id_fkey',
    }).onDelete('set null'),
    foreignKey({
      columns: [table.paymentMethodId],
      foreignColumns: [paymentMethods.id],
      name: 'transactions_payment_method_id_fkey',
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.toPaymentMethodId],
      foreignColumns: [paymentMethods.id],
      name: 'transactions_to_payment_method_id_fkey',
    }).onDelete('restrict'),
    check('transactions_amount_check', sql`amount > 0`),
    check('check_category_for_non_transfer', sql`type = 'transfer' OR category_id IS NOT NULL`),
    check('check_transfer_to_payment', sql`type <> 'transfer' OR to_payment_method_id IS NOT NULL`),
    check(
      'check_transfer_different_accounts',
      sql`type <> 'transfer' OR payment_method_id <> to_payment_method_id`,
    ),
  ],
);
