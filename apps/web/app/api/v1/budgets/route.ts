import { parseBody } from '@/lib/validate';
import { createBudgetSchema } from '@expense-tracker/types';
import { budgetService } from '../_services';
import { controller } from '@/lib/controller';

export const GET = controller((_req, userId) => budgetService.list(userId));

export const POST = controller(async (req, userId) => {
  const data = await parseBody(req, createBudgetSchema);
  return budgetService.create(userId, data);
}, 201);
