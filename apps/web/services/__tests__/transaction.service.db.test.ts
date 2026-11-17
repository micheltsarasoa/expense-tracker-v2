// Characterization tests (P0-32): they freeze how TransactionService behaves today on a real
// Postgres, so the driver switch (P1-10) and the balance work (P1-14) cannot change it silently.
import { describe, expect, it } from 'vitest';

import { eq, paymentMethods, type Database } from '@expense-tracker/db';
import {
  createCategory,
  createPaymentMethod,
  createUser,
  withTestDb,
  type TestDatabase,
} from '@expense-tracker/test-utils';

import { TransactionService } from '../transaction.service';

// The service is typed for the Neon driver; tests use node-postgres until P1-10 aligns them.
const serviceFor = (db: TestDatabase) => new TransactionService(db as unknown as Database);

async function balanceOf(db: TestDatabase, accountId: string): Promise<string> {
  const [account] = await db.select().from(paymentMethods).where(eq(paymentMethods.id, accountId));
  if (!account) throw new Error(`Account ${accountId} not found`);
  return account.currentBalance;
}

async function setup(db: TestDatabase) {
  const user = await createUser(db);
  const account = await createPaymentMethod(db, { userId: user.id, initialBalance: '100.00' });
  const savings = await createPaymentMethod(db, { userId: user.id, initialBalance: '50.00' });
  const groceries = await createCategory(db, { userId: user.id, type: 'expense' });
  const salary = await createCategory(db, { userId: user.id, type: 'income' });
  return { user, account, savings, groceries, salary, service: serviceFor(db) };
}

describe('TransactionService on Postgres', () => {
  describe('create', () => {
    it('an expense lowers the account balance', async () => {
      await withTestDb(async (db) => {
        const { user, account, groceries, service } = await setup(db);
        const row = await service.create(user.id, {
          type: 'expense',
          amount: '12.34',
          transactionDate: '2026-11-01',
          paymentMethodId: account.id,
          categoryId: groceries.id,
        });
        expect(row).toMatchObject({ type: 'expense', amount: '12.34', isDeleted: false });
        expect(await balanceOf(db, account.id)).toBe('87.66');
      });
    });

    it('an income raises the account balance', async () => {
      await withTestDb(async (db) => {
        const { user, account, salary, service } = await setup(db);
        await service.create(user.id, {
          type: 'income',
          amount: '2500.00',
          transactionDate: '2026-11-01',
          paymentMethodId: account.id,
          categoryId: salary.id,
        });
        expect(await balanceOf(db, account.id)).toBe('2600.00');
      });
    });

    it('a transfer moves the amount between the two accounts', async () => {
      await withTestDb(async (db) => {
        const { user, account, savings, service } = await setup(db);
        const row = await service.create(user.id, {
          type: 'transfer',
          amount: '30.00',
          transactionDate: '2026-11-02',
          paymentMethodId: account.id,
          toPaymentMethodId: savings.id,
        });
        expect(row.toPaymentMethodId).toBe(savings.id);
        expect(await balanceOf(db, account.id)).toBe('70.00');
        expect(await balanceOf(db, savings.id)).toBe('80.00');
      });
    });

    it('rejects a zero amount and leaves the balance unchanged', async () => {
      await withTestDb(async (db) => {
        const { user, account, groceries, service } = await setup(db);
        await expect(
          service.create(user.id, {
            type: 'expense',
            amount: '0',
            transactionDate: '2026-11-01',
            paymentMethodId: account.id,
            categoryId: groceries.id,
          }),
        ).rejects.toThrow();
        expect(await balanceOf(db, account.id)).toBe('100.00');
      });
    });
  });

  describe('update', () => {
    it('changing the amount applies only the difference', async () => {
      await withTestDb(async (db) => {
        const { user, account, groceries, service } = await setup(db);
        const row = await service.create(user.id, {
          type: 'expense',
          amount: '10.00',
          transactionDate: '2026-11-01',
          paymentMethodId: account.id,
          categoryId: groceries.id,
        });
        await service.update(user.id, row.id, { amount: '25.50' });
        expect(await balanceOf(db, account.id)).toBe('74.50');
      });
    });

    it('moving an expense to another account restores the first one', async () => {
      await withTestDb(async (db) => {
        const { user, account, savings, groceries, service } = await setup(db);
        const row = await service.create(user.id, {
          type: 'expense',
          amount: '10.00',
          transactionDate: '2026-11-01',
          paymentMethodId: account.id,
          categoryId: groceries.id,
        });
        await service.update(user.id, row.id, { paymentMethodId: savings.id });
        expect(await balanceOf(db, account.id)).toBe('100.00');
        expect(await balanceOf(db, savings.id)).toBe('40.00');
      });
    });

    it('turning an expense into a transfer credits the destination', async () => {
      await withTestDb(async (db) => {
        const { user, account, savings, groceries, service } = await setup(db);
        const row = await service.create(user.id, {
          type: 'expense',
          amount: '20.00',
          transactionDate: '2026-11-01',
          paymentMethodId: account.id,
          categoryId: groceries.id,
        });
        await service.update(user.id, row.id, { type: 'transfer', toPaymentMethodId: savings.id });
        expect(await balanceOf(db, account.id)).toBe('80.00');
        expect(await balanceOf(db, savings.id)).toBe('70.00');
      });
    });
  });

  describe('delete', () => {
    it('soft-deletes and reverses an expense', async () => {
      await withTestDb(async (db) => {
        const { user, account, groceries, service } = await setup(db);
        const row = await service.create(user.id, {
          type: 'expense',
          amount: '40.00',
          transactionDate: '2026-11-01',
          paymentMethodId: account.id,
          categoryId: groceries.id,
        });
        await service.delete(user.id, row.id);
        expect(await balanceOf(db, account.id)).toBe('100.00');
        await expect(service.findById(user.id, row.id)).rejects.toMatchObject({ status: 404 });
      });
    });

    it('reverses both sides of a transfer', async () => {
      await withTestDb(async (db) => {
        const { user, account, savings, service } = await setup(db);
        const row = await service.create(user.id, {
          type: 'transfer',
          amount: '30.00',
          transactionDate: '2026-11-02',
          paymentMethodId: account.id,
          toPaymentMethodId: savings.id,
        });
        await service.delete(user.id, row.id);
        expect(await balanceOf(db, account.id)).toBe('100.00');
        expect(await balanceOf(db, savings.id)).toBe('50.00');
      });
    });
  });

  describe('isolation between users', () => {
    it("another user can neither read nor delete the actor's transaction", async () => {
      await withTestDb(async (db) => {
        const { user, account, groceries, service } = await setup(db);
        const stranger = await createUser(db);
        const row = await service.create(user.id, {
          type: 'expense',
          amount: '10.00',
          transactionDate: '2026-11-01',
          paymentMethodId: account.id,
          categoryId: groceries.id,
        });
        await expect(service.findById(stranger.id, row.id)).rejects.toMatchObject({ status: 404 });
        await expect(service.delete(stranger.id, row.id)).rejects.toMatchObject({ status: 404 });
        expect(await balanceOf(db, account.id)).toBe('90.00');
      });
    });

    it("the list of another user never contains the actor's transactions", async () => {
      await withTestDb(async (db) => {
        const { user, account, groceries, service } = await setup(db);
        const stranger = await createUser(db);
        await service.create(user.id, {
          type: 'expense',
          amount: '10.00',
          transactionDate: '2026-11-01',
          paymentMethodId: account.id,
          categoryId: groceries.id,
        });
        const { data, total } = await service.list(stranger.id, { page: 1, pageSize: 50 });
        expect(data).toEqual([]);
        expect(total).toBe(0);
      });
    });
  });
});
