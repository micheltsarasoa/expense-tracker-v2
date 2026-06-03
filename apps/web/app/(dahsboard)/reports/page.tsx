import { getUserId } from '@/lib/auth';
import { reportService } from '@/services/instances';
import type { CategorySlice } from '@/components/reports/spending-by-category-tab';
import type { MonthlyEntry } from '@/components/reports/income-vs-expenses-tab';
import type { BalanceDataPoint, AccountLine } from '@/components/reports/balance-history-tab';
import type { BudgetActualRow } from '@/components/reports/budget-vs-actual-tab';
import { ReportsClient } from './reports-client';

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  if (!y || !m) return ym;
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC',
  });
}

const BALANCE_PALETTE = ['#3b82f6', '#10b981', '#f43f5e', '#8b5cf6', '#f59e0b', '#06b6d4'];

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const userId = await getUserId();
  const sp = await searchParams;

  const now = new Date();
  const defFrom = isoDay(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1)));
  const defTo = isoDay(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)));
  const from = typeof sp.from === 'string' ? sp.from : defFrom;
  const to = typeof sp.to === 'string' ? sp.to : defTo;

  const [spendingRows, incomeRows, balanceRows, budgetRows] = await Promise.all([
    reportService.spendingByCategory(userId, from, to),
    reportService.incomeVsExpenses(userId, from, to),
    reportService.balanceHistory(userId),
    reportService.budgetVsActual(userId),
  ]);

  const spending: CategorySlice[] = spendingRows.map((s) => ({
    name: s.categoryName,
    value: parseFloat(s.total),
  }));

  const monthly: MonthlyEntry[] = incomeRows.map((m) => ({
    month: monthLabel(m.month),
    income: parseFloat(m.income),
    expense: parseFloat(m.expenses),
  }));

  // Pivot flat balance points → one row per date with a column per account.
  const dateMap = new Map<string, BalanceDataPoint>();
  const accountNames: string[] = [];
  for (const r of balanceRows) {
    if (!accountNames.includes(r.accountName)) accountNames.push(r.accountName);
    const point = dateMap.get(r.date) ?? { date: r.date };
    point[r.accountName] = parseFloat(r.runningBalance);
    dateMap.set(r.date, point);
  }
  const balanceData = Array.from(dateMap.values()).sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  );
  const balanceAccounts: AccountLine[] = accountNames.map((name, i) => ({
    name,
    color: BALANCE_PALETTE[i % BALANCE_PALETTE.length] ?? '#6b7280',
  }));

  const budgets: BudgetActualRow[] = budgetRows.map((b) => ({
    id: b.budgetId,
    name: b.name,
    budgeted: parseFloat(b.amount),
    spent: parseFloat(b.spent),
  }));

  return (
    <ReportsClient
      from={from}
      to={to}
      spending={spending}
      monthly={monthly}
      balanceData={balanceData}
      balanceAccounts={balanceAccounts}
      budgets={budgets}
    />
  );
}
