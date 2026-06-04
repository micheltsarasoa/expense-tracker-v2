import { controller } from '@/lib/controller';
import { parseQuery } from '@/lib/validate';
import { z } from 'zod';
import { reportService } from '../../_services';

const schema = z.object({
  from: z.string().date().optional(),
  to: z.string().date().optional(),
});

function defaultRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1))
    .toISOString()
    .slice(0, 10);
  const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0))
    .toISOString()
    .slice(0, 10);
  return { from, to };
}

export const GET = controller((req, userId) => {
  const { from, to } = parseQuery(req.nextUrl.searchParams, schema);
  const range = defaultRange();
  return reportService.incomeVsExpenses(userId, from ?? range.from, to ?? range.to);
});
