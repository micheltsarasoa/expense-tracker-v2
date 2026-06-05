import { boolean, foreignKey, index, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

import { categoryType } from './enums';
import { timestamps } from './_shared';
import { users } from './users';

export const categories = pgTable(
  'categories',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id'), // nullable — system/default categories have no owner
    parentId: uuid('parent_id'),
    name: varchar({ length: 100 }).notNull(),
    type: categoryType().notNull(),
    icon: varchar({ length: 50 }),
    color: varchar({ length: 7 }),
    isDefault: boolean('is_default').default(false).notNull(),
    ...timestamps,
  },
  (table) => [
    index('idx_categories_user_id').using('btree', table.userId.asc().nullsLast()),
    index('idx_categories_type').using(
      'btree',
      table.userId.asc().nullsLast(),
      table.type.asc().nullsLast(),
    ),
    index('idx_categories_parent_id').using('btree', table.parentId.asc().nullsLast()),
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
