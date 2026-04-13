import { sql } from 'drizzle-orm';
import { index, pgTable, timestamp, unique, uuid, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    email: varchar({ length: 255 }).notNull(),
    name: varchar({ length: 100 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('idx_users_email').using('btree', table.email.asc().nullsLast()),
    unique('users_email_key').on(table.email),
  ],
);

export const userSettings = pgTable(
  'user_settings',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    currencySymbol: varchar('currency_symbol', { length: 3 }).default('$').notNull(),
    currencyPosition: varchar('currency_position', { length: 6 }).default('before').notNull(),
    decimalSeparator: varchar('decimal_separator', { length: 1 }).default('.').notNull(),
    thousandSeparator: varchar('thousand_separator', { length: 1 }).default(',').notNull(),
    dateFormat: varchar('date_format', { length: 10 }).default('MM/DD/YYYY').notNull(),
    timeFormat: varchar('time_format', { length: 3 }).default('12h').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('idx_user_settings_user_id').using('btree', table.userId.asc().nullsLast()),
    unique('user_settings_user_id_key').on(table.userId),
  ],
);
