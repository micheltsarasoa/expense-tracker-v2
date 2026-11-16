import { describe, expect, it } from 'vitest';

import { eq, users } from '@expense-tracker/db';

import { asUser, createPaymentMethod, createUser, withTestDb } from './index';

describe('withTestDb', () => {
  it('gives each call its own migrated database, even in parallel', async () => {
    const email = 'same@example.test';

    const [first, second] = await Promise.all([
      withTestDb(async (db) => {
        await createUser(db, { email });
        return db.select().from(users).where(eq(users.email, email));
      }),
      withTestDb(async (db) => {
        await createUser(db, { email });
        return db.select().from(users).where(eq(users.email, email));
      }),
    ]);

    expect(first).toHaveLength(1);
    expect(second).toHaveLength(1);
  });

  it('starts empty: rows from another call are not visible', async () => {
    await withTestDb(async (db) => {
      await createUser(db);
    });
    const count = await withTestDb(async (db) => (await db.select().from(users)).length);
    expect(count).toBe(0);
  });
});

describe('factories', () => {
  it('create a user with an account owned by that user', async () => {
    await withTestDb(async (db) => {
      const user = await createUser(db);
      const account = await createPaymentMethod(db, { userId: user.id, initialBalance: '100.00' });
      expect(account.userId).toBe(user.id);
      expect(account.currentBalance).toBe('100.00');
    });
  });
});

describe('asUser', () => {
  it('builds the actor a service call runs as', async () => {
    await withTestDb(async (db) => {
      const user = await createUser(db);
      expect(asUser(user)).toEqual({ userId: user.id });
    });
  });
});
