import { controller } from '@/lib/controller';
import { parseBody } from '@/lib/validate';
import { createCategorySchema } from '@expense-tracker/types';
import { categoryService } from '../_services';

export const GET = controller((_req, userId) => categoryService.list(userId));

export const POST = controller(async (req, userId) => {
  const data = await parseBody(req, createCategorySchema);
  return categoryService.create(userId, data);
}, 201);
