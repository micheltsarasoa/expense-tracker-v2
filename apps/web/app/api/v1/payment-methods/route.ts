import { controller } from '@/lib/controller';
import { parseBody, parseQuery } from '@/lib/validate';
import { createPaymentMethodSchema } from '@expense-tracker/types';
import { z } from 'zod';
import { paymentMethodService } from '../_services';

const listQuerySchema = z.object({
  includeInactive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

export const GET = controller((req, userId) => {
  const q = parseQuery(req.nextUrl.searchParams, listQuerySchema);
  return paymentMethodService.list(userId, q.includeInactive);
});

export const POST = controller(async (req, userId) => {
  const data = await parseBody(req, createPaymentMethodSchema);
  return paymentMethodService.create(userId, data);
}, 201);
