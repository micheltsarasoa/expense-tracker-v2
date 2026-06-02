'use server';

import { revalidatePath } from 'next/cache';
import {
  createBudgetSchema,
  updateBudgetSchema,
  duplicateBudgetSchema,
} from '@expense-tracker/types';
import { getUserId } from '@/lib/auth';
import { parseInput } from '@/lib/validate';
import { runAction } from '@/lib/action';
import { budgetService } from '@/services/instances';

// `getUserId()` is called OUTSIDE `runAction`: when unauthenticated it redirects
// (a Next.js control-flow throw) which must not be caught/converted by runAction.

export async function createBudget(input: unknown) {
  const userId = await getUserId();
  return runAction(async () => {
    const data = parseInput(input, createBudgetSchema);
    const budget = await budgetService.create(userId, data);
    revalidatePath('/budgets');
    return budget;
  });
}

export async function updateBudget(id: string, input: unknown) {
  const userId = await getUserId();
  return runAction(async () => {
    const data = parseInput(input, updateBudgetSchema);
    const budget = await budgetService.update(userId, id, data);
    revalidatePath('/budgets');
    return budget;
  });
}

export async function deleteBudget(id: string) {
  const userId = await getUserId();
  return runAction(async () => {
    await budgetService.delete(userId, id);
    revalidatePath('/budgets');
  });
}

export async function duplicateBudget(id: string, input: unknown) {
  const userId = await getUserId();
  return runAction(async () => {
    const data = parseInput(input, duplicateBudgetSchema);
    const budget = await budgetService.duplicate(userId, id, data);
    revalidatePath('/budgets');
    return budget;
  });
}
