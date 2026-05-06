import { controller, requireParam } from '@/lib/controller';
import { parseBody } from '@/lib/validate';
import { updatePaymentMethodSchema } from '@expense-tracker/types';
import { paymentMethodService } from '../../_services';

export const PUT = controller(async (req, userId, params) => {
  const data = await parseBody(req, updatePaymentMethodSchema);
  return paymentMethodService.update(userId, requireParam(params, 'id'), data);
});

export const DELETE = controller((_req, userId, params) =>
  paymentMethodService.deactivateOrDelete(userId, requireParam(params, 'id')),
);
