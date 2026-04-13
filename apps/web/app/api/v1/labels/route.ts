import { controller } from '@/lib/controller';
import { parseBody } from '@/lib/validate';
import { createLabelSchema } from '@expense-tracker/types';
import { labelService } from '../_services';

export const GET = controller((_req, userId) => labelService.list(userId));

export const POST = controller(async (req, userId) => {
  const data = await parseBody(req, createLabelSchema);
  return labelService.create(userId, data);
}, 201);
