import { controller } from '@/lib/controller';
import { parseBody, parseQuery } from '@/lib/validate';
import { createTransactionSchema, transactionFiltersSchema } from '@expense-tracker/types';
import { transactionService } from '../_services';

export const GET = controller((req, userId) => {
  const filters = parseQuery(req.nextUrl.searchParams, transactionFiltersSchema);
  return transactionService.list(userId, filters);
});

export const POST = controller(async (req, userId) => {
  const data = await parseBody(req, createTransactionSchema);
  return transactionService.create(userId, data);
}, 201);
