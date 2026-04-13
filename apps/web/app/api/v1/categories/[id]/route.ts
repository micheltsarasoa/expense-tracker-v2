import { controller, requireParam } from '@/lib/controller';
import { parseBody } from '@/lib/validate';
import { updateCategorySchema } from '@expense-tracker/types';
import { categoryService } from '../../_services';

export const PUT = controller(async (req, userId, params) => {
  const data = await parseBody(req, updateCategorySchema);
  return categoryService.update(userId, requireParam(params, 'id'), data);
});

export const DELETE = controller(async (_req, userId, params) => {
  await categoryService.delete(userId, requireParam(params, 'id'));
  return null;
});
