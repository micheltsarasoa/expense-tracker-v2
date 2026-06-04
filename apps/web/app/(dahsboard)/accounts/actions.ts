'use server';

import { revalidatePath } from 'next/cache';
import { createPaymentMethodSchema, updatePaymentMethodSchema } from '@expense-tracker/types';
import { getUserId } from '@/lib/auth';
import { parseInput } from '@/lib/validate';
import { runAction } from '@/lib/action';
import { paymentMethodService } from '@/services/instances';

export async function createAccount(input: unknown) {
  const userId = await getUserId();
  return runAction(async () => {
    const data = parseInput(input, createPaymentMethodSchema);
    const account = await paymentMethodService.create(userId, data);
    revalidatePath('/accounts');
    return account;
  });
}

export async function updateAccount(id: string, input: unknown) {
  const userId = await getUserId();
  return runAction(async () => {
    const data = parseInput(input, updatePaymentMethodSchema);
    const account = await paymentMethodService.update(userId, id, data);
    revalidatePath('/accounts');
    return account;
  });
}

/** Soft-deactivates if the account has transactions, hard-deletes otherwise. */
export async function removeAccount(id: string) {
  const userId = await getUserId();
  return runAction(async () => {
    const result = await paymentMethodService.deactivateOrDelete(userId, id);
    revalidatePath('/accounts');
    return result; // { action: 'deactivated' | 'deleted' }
  });
}
