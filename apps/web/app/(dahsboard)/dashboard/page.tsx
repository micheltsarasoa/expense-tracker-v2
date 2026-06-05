import { getUserId } from '@/lib/auth';
import {
  paymentMethodService,
  reportService,
  budgetService,
  transactionService,
} from '@/services/instances';
import { resolvePeriod, isDashboardPeriod } from '@/lib/period';
import { PeriodSelector } from '@/components/dashboard/period-selector';
import { StatCard } from '@/components/dashboard/stat-card';
import { MonthlyTrendChart } from '@/components/dashboard/monthly-trend-chart';
import { SpendingByCategoryChart } from '@/components/dashboard/spending-by-category-chart';
import { BudgetStatusWidget } from '@/components/dashboard/budget-status-widget';
import { AccountBalancesWidget } from '@/components/dashboard/account-balances-widget';
import { RecentTransactionsWidget } from '@/components/dashboard/recent-transactions-widget';
import type { AccountBalanceItem } from '@/components/dashboard/account-balances-widget';
import type { BudgetSummaryItem } from '@/components/dashboard/budget-status-widget';

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  if (!y || !m) return ym;
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', {
    month: 'short',
    timeZone: 'UTC',
  });
}

export default async function DashboardPage({
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
  const { from, to, prevFrom, prevTo, label } = resolvePeriod(period, fromParam, toParam);

  const now = new Date();
  const trendFrom = isoDay(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1)));
  const trendTo = isoDay(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)));

  const [accountRows, curRows, prevRows, spending, trend, budgetRows, txList] = await Promise.all([
    paymentMethodService.list(userId),
    reportService.incomeVsExpenses(userId, from, to),
    reportService.incomeVsExpenses(userId, prevFrom, prevTo),
    reportService.spendingByCategory(userId, from, to),
    reportService.incomeVsExpenses(userId, trendFrom, trendTo),
    budgetService.list(userId),
    transactionService.list(userId, { page: 1, pageSize: 8 }),
  ]);

  // Stat cards — selected period income/expense/net vs the previous equal period.
  const sumRows = (rows: { income: string; expenses: string }[]) =>
    rows.reduce(
      (acc, r) => ({
        income: acc.income + parseFloat(r.income),
        expense: acc.expense + parseFloat(r.expenses),
      }),
      { income: 0, expense: 0 },
    );

  const cur = sumRows(curRows);
  const prev = sumRows(prevRows);
  const income = cur.income;
  const expense = cur.expense;
  const net = income - expense;
  const prevIncome = prev.income;
  const prevExpense = prev.expense;
  const prevNet = prev.income - prev.expense;

  const accounts: AccountBalanceItem[] = accountRows.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.type,
    balance: parseFloat(a.currentBalance),
    ...(a.color ? { color: a.color } : {}),
  }));

  // Only budgets whose own date range overlaps the selected period (matches /budgets).
  const budgets: BudgetSummaryItem[] = budgetRows
    .filter((b) => b.startDate <= to && (b.endDate === null || b.endDate >= from))
    .map((b) => ({
      id: b.id,
      name: b.name,
      spent: parseFloat(b.spent),
      amount: parseFloat(b.amount),
    }));

  const categorySpending = spending.map((s) => ({
    name: s.categoryName,
    value: parseFloat(s.total),
  }));
  const totalCategorySpend = categorySpending.reduce((sum, c) => sum + c.value, 0);

  const monthlyTrend = trend.map((t) => ({
    month: monthLabel(t.month),
    income: parseFloat(t.income),
    expense: parseFloat(t.expenses),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
        </div>
        <PeriodSelector period={period} from={from} to={to} />
      </div>

      {/* Stat cards — income / expense / net */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Income"
          value={income}
          previousValue={prevIncome}
          colorClass="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Expenses"
          value={expense}
          previousValue={prevExpense}
          colorClass="text-rose-600 dark:text-rose-400"
        />
        <StatCard
          label="Net"
          value={net}
          previousValue={prevNet}
          colorClass={
            net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }
        />
      </div>

      {/* Accounts + Recent transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AccountBalancesWidget accounts={accounts} />
        <RecentTransactionsWidget transactions={txList.data} />
      </div>

      {/* Budget status + Spending by category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BudgetStatusWidget budgets={budgets} />
        <SpendingByCategoryChart data={categorySpending} total={totalCategorySpend} />
      </div>

      {/* Monthly trend */}
      <MonthlyTrendChart data={monthlyTrend} />
    </div>
  );
}
