'use server';

import { revalidatePath } from 'next/cache';
import { createTransactionSchema, updateTransactionSchema } from '@expense-tracker/types';
import { getUserId } from '@/lib/auth';
import { parseInput } from '@/lib/validate';
import { runAction } from '@/lib/action';
import { transactionService } from '@/services/instances';

export async function createTransaction(input: unknown) {
  const userId = await getUserId();
  return runAction(async () => {
    const data = parseInput(input, createTransactionSchema);
    const tx = await transactionService.create(userId, data);
    revalidatePath('/transactions');
    return tx;
  });
}

export async function updateTransaction(id: string, input: unknown) {
  const userId = await getUserId();
  return runAction(async () => {
    const data = parseInput(input, updateTransactionSchema);
    const tx = await transactionService.update(userId, id, data);
    revalidatePath('/transactions');
    return tx;
  });
}

export async function deleteTransaction(id: string) {
  const userId = await getUserId();
  return runAction(async () => {
    await transactionService.delete(userId, id);
    revalidatePath('/transactions');
  });
}

export async function toggleTransactionValidated(id: string) {
  const userId = await getUserId();
  return runAction(async () => {
    const tx = await transactionService.toggleValidate(userId, id);
    revalidatePath('/transactions');
    return tx;
  });
}
