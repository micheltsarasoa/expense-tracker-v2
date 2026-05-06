import { controller, requireParam } from '@/lib/controller';
import { parseBody } from '@/lib/validate';
import { updateBudgetSchema } from '@expense-tracker/types';
import { budgetService } from '../../_services';

export const GET = controller((_req, userId, params) =>
  budgetService.findById(userId, requireParam(params, 'id')),
);

export const PUT = controller(async (req, userId, params) => {
  const data = await parseBody(req, updateBudgetSchema);
  return budgetService.update(userId, requireParam(params, 'id'), data);
});

export const DELETE = controller(async (_req, userId, params) => {
  await budgetService.delete(userId, requireParam(params, 'id'));
  return null;
});
