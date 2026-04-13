import { controller, requireParam } from '@/lib/controller';
import { parseBody } from '@/lib/validate';
import { updateTransactionSchema } from '@expense-tracker/types';
import { transactionService } from '../../_services';

export const GET = controller((_req, userId, params) =>
  transactionService.findById(userId, requireParam(params, 'id')),
);

export const PUT = controller(async (req, userId, params) => {
  const data = await parseBody(req, updateTransactionSchema);
  return transactionService.update(userId, requireParam(params, 'id'), data);
});

export const DELETE = controller(async (_req, userId, params) => {
  await transactionService.delete(userId, requireParam(params, 'id'));
  return null;
});
