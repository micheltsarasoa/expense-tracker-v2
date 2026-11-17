import { randomUUID } from 'node:crypto';

import type {
  InsertCategory,
  InsertPaymentMethod,
  InsertUser,
  SelectCategory,
  SelectPaymentMethod,
  SelectUser,
} from '@expense-tracker/db';
import { categories, paymentMethods, users } from '@expense-tracker/db/schema';

import type { TestDatabase } from './with-test-db';

/** A user with a unique email unless one is given. */
export async function createUser(
  db: TestDatabase,
  overrides: Partial<InsertUser> = {},
): Promise<SelectUser> {
  const [user] = await db
    .insert(users)
    .values({ email: `user-${randomUUID()}@example.test`, name: 'Test user', ...overrides })
    .returning();
  return user!;
}

/** An account (`payment_methods` row). The current balance starts at the initial balance. */
export async function createPaymentMethod(
  db: TestDatabase,
  values: Pick<InsertPaymentMethod, 'userId'> & Partial<InsertPaymentMethod>,
): Promise<SelectPaymentMethod> {
  const initialBalance = values.initialBalance ?? '0.00';
  const [account] = await db
    .insert(paymentMethods)
    .values({
      name: `Account ${randomUUID().slice(0, 8)}`,
      type: 'bank_account',
      initialBalance,
      currentBalance: initialBalance,
      ...values,
    })
    .returning();
  return account!;
}

/** A category of the given type (expense by default). */
export async function createCategory(
  db: TestDatabase,
  values: Pick<InsertCategory, 'userId'> & Partial<InsertCategory>,
): Promise<SelectCategory> {
  const [category] = await db
    .insert(categories)
    .values({ name: `Category ${randomUUID().slice(0, 8)}`, type: 'expense', ...values })
    .returning();
  return category!;
}
