'use server';

import { revalidatePath } from 'next/cache';
import { updateSettingsSchema } from '@expense-tracker/types';
import { getUserId } from '@/lib/auth';
import { parseInput } from '@/lib/validate';
import { runAction } from '@/lib/action';
import { settingsService } from '@/services/instances';

export async function updateSettings(input: unknown) {
  const userId = await getUserId();
  return runAction(async () => {
    const data = parseInput(input, updateSettingsSchema);
    const settings = await settingsService.upsert(userId, data);
    // A changed dateFormat/currency affects every page, so refresh the whole tree.
    revalidatePath('/', 'layout');
    return settings;
  });
}
