import { controller } from '@/lib/controller';
import { parseQuery } from '@/lib/validate';
import { z } from 'zod';
import { reportService } from '../../_services';

const schema = z.object({
  from: z.string().date(),
  to: z.string().date(),
});

export const GET = controller((req, userId) => {
  const { from, to } = parseQuery(req.nextUrl.searchParams, schema);
  return reportService.spendingByCategory(userId, from, to);
});
