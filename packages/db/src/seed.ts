/**
 * Seed script — populates the dev Neon branch with realistic demo data.
 * Run: pnpm --filter db seed
 *
 * Insertion order respects FK constraints:
 *   users → user_settings, payment_methods, categories, labels
 *   → transactions → budgets
 */
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(import.meta.dirname, '../../../.env.local') });

import { faker } from '@faker-js/faker';
import { db } from './client';
import {
  budgets,
  categories,
  labels,
  paymentMethods,
  transactions,
  userSettings,
  users,
} from './schema';

faker.seed(42); // deterministic runs

// ---------------------------------------------------------------------------
// 1. User
// ---------------------------------------------------------------------------
const [user] = await db
  .insert(users)
  .values({
    email: 'demo@expense-tracker.dev',
    name: 'Demo User',
  })
  .returning();

if (!user) throw new Error('Failed to insert seed user');

// ---------------------------------------------------------------------------
// 2. User settings
// ---------------------------------------------------------------------------
await db.insert(userSettings).values({ userId: user.id });

// ---------------------------------------------------------------------------
// 3. Payment methods
// ---------------------------------------------------------------------------
const [checking, savings, creditCard, cash] = await db
  .insert(paymentMethods)
  .values([
    {
      userId: user.id,
      name: 'Checking',
      type: 'bank_account',
      initialBalance: '3200.00',
      currentBalance: '3200.00',
    },
    {
      userId: user.id,
      name: 'Savings',
      type: 'bank_account',
      initialBalance: '12000.00',
      currentBalance: '12000.00',
    },
    {
      userId: user.id,
      name: 'Visa',
      type: 'credit_card',
      initialBalance: '0.00',
      currentBalance: '0.00',
    },
    {
      userId: user.id,
      name: 'Cash',
      type: 'cash',
      initialBalance: '200.00',
      currentBalance: '200.00',
    },
  ])
  .returning();

if (!checking || !savings || !creditCard || !cash)
  throw new Error('Failed to insert payment methods');

// ---------------------------------------------------------------------------
// 4. Categories (system defaults — no userId)
// ---------------------------------------------------------------------------
const expenseCategories = await db
  .insert(categories)
  .values([
    {
      name: 'Groceries',
      type: 'expense',
      icon: 'shopping-cart',
      color: '#10B981',
      isDefault: true,
    },
    { name: 'Dining Out', type: 'expense', icon: 'utensils', color: '#F59E0B', isDefault: true },
    { name: 'Transport', type: 'expense', icon: 'car', color: '#3B82F6', isDefault: true },
    { name: 'Utilities', type: 'expense', icon: 'zap', color: '#8B5CF6', isDefault: true },
    { name: 'Entertainment', type: 'expense', icon: 'film', color: '#EC4899', isDefault: true },
    { name: 'Health', type: 'expense', icon: 'heart', color: '#EF4444', isDefault: true },
    { name: 'Subscriptions', type: 'expense', icon: 'repeat', color: '#6B7280', isDefault: true },
  ])
  .returning();

const incomeCategories = await db
  .insert(categories)
  .values([
    { name: 'Salary', type: 'income', icon: 'briefcase', color: '#059669', isDefault: true },
    { name: 'Freelance', type: 'income', icon: 'code', color: '#0891B2', isDefault: true },
    { name: 'Investment', type: 'income', icon: 'trending-up', color: '#7C3AED', isDefault: true },
  ])
  .returning();

// ---------------------------------------------------------------------------
// 5. Labels
// ---------------------------------------------------------------------------
const [labelEssential, labelOptional, labelRecurring] = await db
  .insert(labels)
  .values([
    { userId: user.id, name: 'Essential', color: '#10B981' },
    { userId: user.id, name: 'Optional', color: '#F59E0B' },
    { userId: user.id, name: 'Recurring', color: '#6366F1' },
  ])
  .returning();

if (!labelEssential || !labelOptional || !labelRecurring)
  throw new Error('Failed to insert labels');

// ---------------------------------------------------------------------------
// 6. Transactions (6 months of history)
// ---------------------------------------------------------------------------
const paymentPool = [checking.id, creditCard.id, cash.id];
const now = new Date();

const txRows: (typeof transactions.$inferInsert)[] = [];

// Monthly salary (income)
for (let m = 5; m >= 0; m--) {
  const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
  txRows.push({
    userId: user.id,
    type: 'income',
    amount: '4500.00',
    transactionDate: d.toISOString().slice(0, 10),
    categoryId: incomeCategories[0]!.id, // Salary
    paymentMethodId: checking.id,
    description: 'Monthly salary',
    labelId: labelRecurring.id,
  });
}

// Monthly subscriptions (expense)
const subDescriptions = ['Netflix', 'Spotify', 'Cloud Storage', 'Gym'];
for (let m = 5; m >= 0; m--) {
  for (const sub of subDescriptions) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 5);
    txRows.push({
      userId: user.id,
      type: 'expense',
      amount: faker.finance.amount({ min: 10, max: 20, dec: 2 }),
      transactionDate: d.toISOString().slice(0, 10),
      categoryId: expenseCategories[6]!.id, // Subscriptions
      paymentMethodId: creditCard.id,
      description: sub,
      labelId: labelRecurring.id,
    });
  }
}

// Random daily expenses (~15 per month)
for (let m = 5; m >= 0; m--) {
  for (let i = 0; i < 15; i++) {
    const d = faker.date.between({
      from: new Date(now.getFullYear(), now.getMonth() - m, 1),
      to: new Date(now.getFullYear(), now.getMonth() - m + 1, 0),
    });
    const catIdx = faker.number.int({ min: 0, max: expenseCategories.length - 2 }); // skip Subscriptions
    txRows.push({
      userId: user.id,
      type: 'expense',
      amount: faker.finance.amount({ min: 5, max: 250, dec: 2 }),
      transactionDate: d.toISOString().slice(0, 10),
      categoryId: expenseCategories[catIdx]!.id,
      paymentMethodId: faker.helpers.arrayElement(paymentPool),
      description: faker.commerce.productName(),
      labelId: faker.helpers.arrayElement([labelEssential.id, labelOptional.id, null]),
    });
  }
}

// Monthly savings transfer (checking → savings)
for (let m = 5; m >= 0; m--) {
  const d = new Date(now.getFullYear(), now.getMonth() - m, 28);
  txRows.push({
    userId: user.id,
    type: 'transfer',
    amount: '500.00',
    transactionDate: d.toISOString().slice(0, 10),
    paymentMethodId: checking.id,
    toPaymentMethodId: savings.id,
    description: 'Monthly savings transfer',
  });
}

await db.insert(transactions).values(txRows);

// ---------------------------------------------------------------------------
// 7. Budgets
// ---------------------------------------------------------------------------
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

await db.insert(budgets).values([
  {
    userId: user.id,
    name: 'Groceries',
    amount: '600.00',
    startDate: monthStart,
    endDate: monthEnd,
    categoryId: expenseCategories[0]!.id,
  },
  {
    userId: user.id,
    name: 'Dining',
    amount: '300.00',
    startDate: monthStart,
    endDate: monthEnd,
    categoryId: expenseCategories[1]!.id,
  },
  {
    userId: user.id,
    name: 'Entertainment',
    amount: '150.00',
    startDate: monthStart,
    endDate: monthEnd,
    categoryId: expenseCategories[4]!.id,
  },
  {
    userId: user.id,
    name: 'Monthly Total',
    amount: '2500.00',
    startDate: monthStart,
    endDate: monthEnd,
  },
]);

console.log('✓ Seed complete — user:', user.email);
