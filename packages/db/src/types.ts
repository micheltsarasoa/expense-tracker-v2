import type {
  budgets,
  categories,
  labels,
  paymentMethods,
  transactions,
  userSettings,
  users,
} from './schema';

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type SelectUserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;

export type SelectPaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = typeof paymentMethods.$inferInsert;

export type SelectCategory = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export type SelectLabel = typeof labels.$inferSelect;
export type InsertLabel = typeof labels.$inferInsert;

export type SelectTransaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

export type SelectBudget = typeof budgets.$inferSelect;
export type InsertBudget = typeof budgets.$inferInsert;
