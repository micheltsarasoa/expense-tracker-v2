import { controller, requireParam } from '@/lib/controller';
import { transactionService } from '../../../_services';

export const PATCH = controller((_req, userId, params) =>
  transactionService.toggleValidate(userId, requireParam(params, 'id')),
);
