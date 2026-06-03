'use server';

import { revalidatePath } from 'next/cache';
import { createCategorySchema, updateCategorySchema } from '@expense-tracker/types';
import { getUserId } from '@/lib/auth';
import { parseInput } from '@/lib/validate';
import { runAction } from '@/lib/action';
import { categoryService } from '@/services/instances';

export async function createCategory(input: unknown) {
  const userId = await getUserId();
  return runAction(async () => {
    const data = parseInput(input, createCategorySchema);
    const category = await categoryService.create(userId, data);
    revalidatePath('/categories');
    return category;
  });
}

export async function updateCategory(id: string, input: unknown) {
  const userId = await getUserId();
  return runAction(async () => {
    const data = parseInput(input, updateCategorySchema);
    const category = await categoryService.update(userId, id, data);
    revalidatePath('/categories');
    return category;
  });
}

export async function deleteCategory(id: string) {
  const userId = await getUserId();
  return runAction(async () => {
    await categoryService.delete(userId, id);
    revalidatePath('/categories');
  });
}
