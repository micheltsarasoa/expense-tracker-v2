import type { CategoryOptionDTO, LabelOptionDTO } from '@expense-tracker/types';
import { getUserId } from '@/lib/auth';
import { budgetService, categoryService, labelService } from '@/services/instances';
import { resolvePeriod, isDashboardPeriod } from '@/lib/period';
import { BudgetsClient } from './budgets-client';

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const userId = await getUserId();
  const sp = await searchParams;

  const periodParam = typeof sp.period === 'string' ? sp.period : 'this-month';
  const period = isDashboardPeriod(periodParam) ? periodParam : 'this-month';
  const fromParam = typeof sp.from === 'string' ? sp.from : undefined;
  const toParam = typeof sp.to === 'string' ? sp.to : undefined;
  const { from, to, label } = resolvePeriod(period, fromParam, toParam);

  const [allBudgets, categoryRows, labelRows] = await Promise.all([
    budgetService.list(userId),
    categoryService.list(userId),
    labelService.list(userId),
  ]);

  // Keep budgets whose own date range overlaps the selected period.
  const budgets = allBudgets.filter(
    (b) => b.startDate <= to && (b.endDate === null || b.endDate >= from),
  );

  const categories: CategoryOptionDTO[] = categoryRows.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    color: c.color,
  }));

  const labels: LabelOptionDTO[] = labelRows.map((l) => ({
    id: l.id,
    name: l.name,
    color: l.color,
  }));

  return (
    <BudgetsClient
      budgets={budgets}
      categories={categories}
      labels={labels}
      hasAnyBudgets={allBudgets.length > 0}
      period={period}
      from={from}
      to={to}
      periodLabel={label}
    />
  );
}
