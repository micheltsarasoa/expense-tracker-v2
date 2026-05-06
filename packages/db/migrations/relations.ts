import { relations } from 'drizzle-orm/relations';
import {
  users,
  paymentMethods,
  categories,
  labels,
  transactions,
  budgets,
  userSettings,
} from './schema';

export const paymentMethodsRelations = relations(paymentMethods, ({ one, many }) => ({
  user: one(users, {
    fields: [paymentMethods.userId],
    references: [users.id],
  }),
  transactions_paymentMethodId: many(transactions, {
    relationName: 'transactions_paymentMethodId_paymentMethods_id',
  }),
  transactions_toPaymentMethodId: many(transactions, {
    relationName: 'transactions_toPaymentMethodId_paymentMethods_id',
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  paymentMethods: many(paymentMethods),
  categories: many(categories),
  labels: many(labels),
  transactions: many(transactions),
  budgets: many(budgets),
  userSettings: many(userSettings),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'categories_parentId_categories_id',
  }),
  categories: many(categories, {
    relationName: 'categories_parentId_categories_id',
  }),
  transactions: many(transactions),
  budgets: many(budgets),
}));

export const labelsRelations = relations(labels, ({ one, many }) => ({
  user: one(users, {
    fields: [labels.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
  budgets: many(budgets),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  paymentMethod_paymentMethodId: one(paymentMethods, {
    fields: [transactions.paymentMethodId],
    references: [paymentMethods.id],
    relationName: 'transactions_paymentMethodId_paymentMethods_id',
  }),
  paymentMethod_toPaymentMethodId: one(paymentMethods, {
    fields: [transactions.toPaymentMethodId],
    references: [paymentMethods.id],
    relationName: 'transactions_toPaymentMethodId_paymentMethods_id',
  }),
  label: one(labels, {
    fields: [transactions.labelId],
    references: [labels.id],
  }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, {
    fields: [budgets.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [budgets.categoryId],
    references: [categories.id],
  }),
  label: one(labels, {
    fields: [budgets.labelId],
    references: [labels.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));
