import type { CategoryOptionDTO } from '@expense-tracker/types';
import { getUserId } from '@/lib/auth';
import { budgetService, categoryService } from '@/services/instances';
import { BudgetsClient } from './budgets-client';

export default async function BudgetsPage() {
  const userId = await getUserId();
  const [budgets, categoryRows] = await Promise.all([
    budgetService.list(userId),
    categoryService.list(userId),
  ]);

  const categories: CategoryOptionDTO[] = categoryRows.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    color: c.color,
  }));

  return <BudgetsClient budgets={budgets} categories={categories} />;
}
