import { controller } from '@/lib/controller';
import { parseBody } from '@/lib/validate';
import { updateSettingsSchema } from '@expense-tracker/types';
import { settingsService } from '../_services';

export const GET = controller((_req, userId) => settingsService.getByUserId(userId));

export const PUT = controller(async (req, userId) => {
  const data = await parseBody(req, updateSettingsSchema);
  return settingsService.upsert(userId, data);
});
