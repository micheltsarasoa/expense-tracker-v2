'use server';

import { revalidatePath } from 'next/cache';
import { createLabelSchema, updateLabelSchema } from '@expense-tracker/types';
import { getUserId } from '@/lib/auth';
import { parseInput } from '@/lib/validate';
import { runAction } from '@/lib/action';
import { labelService } from '@/services/instances';

export async function createLabel(input: unknown) {
  const userId = await getUserId();
  return runAction(async () => {
    const data = parseInput(input, createLabelSchema);
    const label = await labelService.create(userId, data);
    revalidatePath('/labels');
    return label;
  });
}

export async function updateLabel(id: string, input: unknown) {
  const userId = await getUserId();
  return runAction(async () => {
    const data = parseInput(input, updateLabelSchema);
    const label = await labelService.update(userId, id, data);
    revalidatePath('/labels');
    return label;
  });
}

export async function deleteLabel(id: string) {
  const userId = await getUserId();
  return runAction(async () => {
    await labelService.delete(userId, id);
    revalidatePath('/labels');
  });
}
