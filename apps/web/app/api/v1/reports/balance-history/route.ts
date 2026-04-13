import { controller } from '@/lib/controller';
import { reportService } from '../../_services';

export const GET = controller((_req, userId) => reportService.balanceHistory(userId));
