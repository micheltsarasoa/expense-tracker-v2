import { controller, requireParam } from '@/lib/controller';
import { parseBody } from '@/lib/validate';
import { duplicateBudgetSchema } from '@expense-tracker/types';
import { budgetService } from '../../../_services';

export const POST = controller(async (req, userId, params) => {
  const data = await parseBody(req, duplicateBudgetSchema);
  return budgetService.duplicate(userId, requireParam(params, 'id'), data);
}, 201);
