import { controller } from '@/lib/controller';
import { parseQuery } from '@/lib/validate';
import { z } from 'zod';
import { reportService } from '../../_services';

const schema = z.object({
  months: z.coerce.number().int().min(1).max(24).default(6),
});

export const GET = controller((req, userId) => {
  const { months } = parseQuery(req.nextUrl.searchParams, schema);
  return reportService.incomeVsExpenses(userId, months);
});
