import { controller, requireParam } from '@/lib/controller';
import { parseBody } from '@/lib/validate';
import { updateLabelSchema } from '@expense-tracker/types';
import { labelService } from '../../_services';

export const PUT = controller(async (req, userId, params) => {
  const data = await parseBody(req, updateLabelSchema);
  return labelService.update(userId, requireParam(params, 'id'), data);
});

export const DELETE = controller(async (_req, userId, params) => {
  await labelService.delete(userId, requireParam(params, 'id'));
  return null;
});
