import { getUserId } from '@/lib/auth';
import {
  paymentMethodService,
  reportService,
  budgetService,
  transactionService,
} from '@/services/instances';
import { formatDay } from '@/lib/format';
import { StatCard } from '@/components/dashboard/stat-card';
import { MonthlyTrendChart } from '@/components/dashboard/monthly-trend-chart';
import { SpendingByCategoryChart } from '@/components/dashboard/spending-by-category-chart';
import { BudgetStatusWidget } from '@/components/dashboard/budget-status-widget';
import { AccountBalancesWidget } from '@/components/dashboard/account-balances-widget';
import { RecentTransactionsWidget } from '@/components/dashboard/recent-transactions-widget';
import type { AccountBalanceItem } from '@/components/dashboard/account-balances-widget';
import type { BudgetSummaryItem } from '@/components/dashboard/budget-status-widget';
import type { Transaction } from '@/components/transactions/transaction-modal';

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

export default async function DashboardPage() {
  const userId = await getUserId();

  const now = new Date();
  const monthStart = isoDay(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
  const monthEnd = isoDay(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)));
  const curKey = monthStart.slice(0, 7);
  const prevKey = isoDay(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1))).slice(
    0,
    7,
  );

  const [accountRows, trend, spending, budgetRows, txList] = await Promise.all([
    paymentMethodService.list(userId),
    reportService.incomeVsExpenses(userId, 6),
    reportService.spendingByCategory(userId, monthStart, monthEnd),
    budgetService.list(userId),
    transactionService.list(userId, { page: 1, pageSize: 8 }),
  ]);

  // Stat cards — current month income/expense/net vs the previous month.
  const cur = trend.find((t) => t.month === curKey);
  const prev = trend.find((t) => t.month === prevKey);
  const income = cur ? parseFloat(cur.income) : 0;
  const expense = cur ? parseFloat(cur.expenses) : 0;
  const net = income - expense;
  const prevIncome = prev ? parseFloat(prev.income) : 0;
  const prevExpense = prev ? parseFloat(prev.expenses) : 0;

  const accounts: AccountBalanceItem[] = accountRows.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.type,
    balance: parseFloat(a.currentBalance),
    ...(a.color ? { color: a.color } : {}),
  }));

  const budgets: BudgetSummaryItem[] = budgetRows.map((b) => ({
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

  const recentTransactions: Transaction[] = txList.data.map((t) => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    date: formatDay(t.transactionDate),
    accountFrom: t.paymentMethodName,
    ...(t.toPaymentMethodName ? { accountTo: t.toPaymentMethodName } : {}),
    ...(t.categoryName ? { category: t.categoryName } : {}),
    ...(t.labelName ? { label: t.labelName } : {}),
    ...(t.description ? { description: t.description } : {}),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stat cards — income / expense / net */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Income this month"
          value={income}
          previousValue={prevIncome}
          colorClass="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Expenses this month"
          value={expense}
          previousValue={prevExpense}
          colorClass="text-rose-600 dark:text-rose-400"
        />
        <StatCard
          label="Net this month"
          value={net}
          colorClass={
            net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }
        />
      </div>

      {/* Accounts + Recent transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AccountBalancesWidget accounts={accounts} />
        <RecentTransactionsWidget transactions={recentTransactions} />
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
