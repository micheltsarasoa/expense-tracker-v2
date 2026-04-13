import {
  pgTable,
  index,
  unique,
  uuid,
  varchar,
  timestamp,
  foreignKey,
  numeric,
  boolean,
  check,
  text,
  date,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const categoryType = pgEnum('category_type', ['income', 'expense']);
export const paymentMethodType = pgEnum('payment_method_type', [
  'cash',
  'bank_account',
  'credit_card',
  'debit_card',
  'digital_wallet',
  'other',
]);
export const transactionType = pgEnum('transaction_type', ['income', 'expense', 'transfer']);

export const users = pgTable(
  'users',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    email: varchar({ length: 255 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    name: varchar({ length: 100 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    index('idx_users_email').using('btree', table.email.asc().nullsLast().op('text_ops')),
    unique('users_email_key').on(table.email),
  ],
);

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
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    index('idx_payment_methods_active').using(
      'btree',
      table.userId.asc().nullsLast().op('bool_ops'),
      table.isActive.asc().nullsLast().op('uuid_ops'),
    ),
    index('idx_payment_methods_user_id').using(
      'btree',
      table.userId.asc().nullsLast().op('uuid_ops'),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'payment_methods_user_id_fkey',
    }).onDelete('cascade'),
    unique('unique_user_payment_name').on(table.userId, table.name),
  ],
);

export const categories = pgTable(
  'categories',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id'),
    parentId: uuid('parent_id'),
    name: varchar({ length: 100 }).notNull(),
    type: categoryType().notNull(),
    icon: varchar({ length: 50 }),
    color: varchar({ length: 7 }),
    isDefault: boolean('is_default').default(false),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    index('idx_categories_parent_id').using(
      'btree',
      table.parentId.asc().nullsLast().op('uuid_ops'),
    ),
    index('idx_categories_type').using(
      'btree',
      table.userId.asc().nullsLast().op('uuid_ops'),
      table.type.asc().nullsLast().op('enum_ops'),
    ),
    index('idx_categories_user_id').using('btree', table.userId.asc().nullsLast().op('uuid_ops')),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'categories_user_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: 'categories_parent_id_fkey',
    }).onDelete('cascade'),
  ],
);

export const labels = pgTable(
  'labels',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    name: varchar({ length: 255 }).notNull(),
    color: varchar({ length: 7 }).default('#6B7280'),
    createdAt: timestamp('created_at', { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('idx_labels_name').using(
      'btree',
      table.userId.asc().nullsLast().op('text_ops'),
      table.name.asc().nullsLast().op('text_ops'),
    ),
    index('idx_labels_user').using('btree', table.userId.asc().nullsLast().op('uuid_ops')),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'labels_user_id_fkey',
    }).onDelete('cascade'),
  ],
);

export const transactions = pgTable(
  'transactions',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    type: transactionType().notNull(),
    amount: numeric({ precision: 15, scale: 2 }).notNull(),
    description: text(),
    transactionDate: timestamp('transaction_date', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    categoryId: uuid('category_id'),
    paymentMethodId: uuid('payment_method_id').notNull(),
    toPaymentMethodId: uuid('to_payment_method_id'),
    isDeleted: boolean('is_deleted').default(false),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    isValidated: boolean('is_validated').default(false).notNull(),
    labelId: uuid('label_id'),
  },
  (table) => [
    index('idx_transactions_category').using(
      'btree',
      table.categoryId.asc().nullsLast().op('uuid_ops'),
    ),
    index('idx_transactions_date').using(
      'btree',
      table.userId.asc().nullsLast().op('timestamptz_ops'),
      table.transactionDate.desc().nullsFirst().op('timestamptz_ops'),
    ),
    index('idx_transactions_label').using('btree', table.labelId.asc().nullsLast().op('uuid_ops')),
    index('idx_transactions_not_deleted').using(
      'btree',
      table.userId.asc().nullsLast().op('uuid_ops'),
      table.isDeleted.asc().nullsLast().op('uuid_ops'),
    ),
    index('idx_transactions_payment_method').using(
      'btree',
      table.paymentMethodId.asc().nullsLast().op('uuid_ops'),
    ),
    index('idx_transactions_type').using(
      'btree',
      table.userId.asc().nullsLast().op('uuid_ops'),
      table.type.asc().nullsLast().op('uuid_ops'),
    ),
    index('idx_transactions_user_id').using('btree', table.userId.asc().nullsLast().op('uuid_ops')),
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
      columns: [table.paymentMethodId],
      foreignColumns: [paymentMethods.id],
      name: 'transactions_payment_method_id_fkey',
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.toPaymentMethodId],
      foreignColumns: [paymentMethods.id],
      name: 'transactions_to_payment_method_id_fkey',
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.labelId],
      foreignColumns: [labels.id],
      name: 'transactions_label_id_fkey',
    }).onDelete('set null'),
    check('transactions_amount_check', sql`amount > (0)::numeric`),
    check(
      'check_category_for_non_transfer',
      sql`(type = 'transfer'::transaction_type) OR (category_id IS NOT NULL)`,
    ),
    check(
      'check_transfer_to_payment',
      sql`(type <> 'transfer'::transaction_type) OR (to_payment_method_id IS NOT NULL)`,
    ),
    check(
      'check_transfer_different_accounts',
      sql`(type <> 'transfer'::transaction_type) OR (payment_method_id <> to_payment_method_id)`,
    ),
  ],
);

export const budgets = pgTable(
  'budgets',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    name: varchar({ length: 255 }).notNull(),
    amount: numeric({ precision: 15, scale: 2 }).notNull(),
    periodType: varchar('period_type', { length: 50 }).notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date'),
    categoryId: uuid('category_id').notNull(),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
    labelId: uuid('label_id').notNull(),
  },
  (table) => [
    index('idx_budgets_category').using('btree', table.categoryId.asc().nullsLast().op('uuid_ops')),
    index('idx_budgets_dates').using(
      'btree',
      table.startDate.asc().nullsLast().op('date_ops'),
      table.endDate.asc().nullsLast().op('date_ops'),
    ),
    index('idx_budgets_user').using('btree', table.userId.asc().nullsLast().op('uuid_ops')),
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
    check(
      'budgets_period_type_check',
      sql`(period_type)::text = ANY ((ARRAY['one_time'::character varying, 'monthly'::character varying, 'weekly'::character varying, 'yearly'::character varying])::text[])`,
    ),
  ],
);

export const userSettings = pgTable(
  'user_settings',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    decimalSeparator: varchar('decimal_separator', { length: 1 }).default('.').notNull(),
    thousandSeparator: varchar('thousand_separator', { length: 1 }).default(',').notNull(),
    dateFormat: varchar('date_format', { length: 10 }).default('MM/DD/YYYY').notNull(),
    timeFormat: varchar('time_format', { length: 3 }).default('12h').notNull(),
    currencySymbol: varchar('currency_symbol', { length: 3 }).default('$').notNull(),
    currencyPosition: varchar('currency_position', { length: 6 }).default('before').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    index('idx_user_settings_user_id').using(
      'btree',
      table.userId.asc().nullsLast().op('uuid_ops'),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'user_settings_user_id_fkey',
    }).onDelete('cascade'),
    unique('user_settings_user_id_key').on(table.userId),
  ],
);
