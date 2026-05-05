'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatCard } from '@/components/dashboard/stat-card';
import { MonthlyTrendChart } from '@/components/dashboard/monthly-trend-chart';
import { SpendingByCategoryChart } from '@/components/dashboard/spending-by-category-chart';
import { BudgetStatusWidget } from '@/components/dashboard/budget-status-widget';
import { AccountBalancesWidget } from '@/components/dashboard/account-balances-widget';
import { RecentTransactionsWidget } from '@/components/dashboard/recent-transactions-widget';
import type { Transaction } from '@/components/transactions/transaction-modal';
import type { AccountBalanceItem } from '@/components/dashboard/account-balances-widget';
import type { BudgetSummaryItem } from '@/components/dashboard/budget-status-widget';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const ACCOUNTS: AccountBalanceItem[] = [
  { id: '1', name: 'Main Checking', type: 'bank_account', balance: 4_250.8 },
  { id: '2', name: 'Savings', type: 'bank_account', balance: 12_000.0 },
  { id: '3', name: 'Visa Credit', type: 'credit_card', balance: -320.45 },
  { id: '4', name: 'Cash Wallet', type: 'cash', balance: 85.0 },
  { id: '5', name: 'PayPal', type: 'digital_wallet', balance: 210.6 },
];

const BUDGETS: BudgetSummaryItem[] = [
  { id: 'b1', name: 'Groceries', spent: 380, amount: 400 },
  { id: 'b2', name: 'Dining Out', spent: 230, amount: 200 },
  { id: 'b3', name: 'Transport', spent: 95, amount: 150 },
  { id: 'b4', name: 'Entertainment', spent: 185, amount: 200 },
  { id: 'b5', name: 'Utilities', spent: 60, amount: 120 },
];

const CATEGORY_SPENDING = [
  { name: 'Groceries', value: 380, color: '#10b981' },
  { name: 'Dining', value: 230, color: '#f43f5e' },
  { name: 'Transport', value: 95, color: '#8b5cf6' },
  { name: 'Entertainment', value: 185, color: '#f59e0b' },
  { name: 'Utilities', value: 60, color: '#3b82f6' },
  { name: 'Other', value: 142, color: '#6b7280' },
];

const MONTHLY_TREND = [
  { month: 'Nov', income: 3_200, expense: 2_100 },
  { month: 'Dec', income: 4_100, expense: 3_400 },
  { month: 'Jan', income: 3_200, expense: 1_980 },
  { month: 'Feb', income: 3_200, expense: 2_340 },
  { month: 'Mar', income: 3_750, expense: 2_560 },
  { month: 'Apr', income: 3_200, expense: 1_092 },
];

const RECENT_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    type: 'expense',
    date: 'Apr 14, 2026',
    description: 'Supermarket — weekly shop',
    amount: '94.30',
    accountFrom: 'Main Checking',
    category: 'Groceries',
    label: '',
    accountTo: '',
  },
  {
    id: 't2',
    type: 'income',
    date: 'Apr 1, 2026',
    description: 'Monthly salary',
    amount: '3200.00',
    accountFrom: 'Main Checking',
    category: 'Salary',
    label: '',
    accountTo: '',
  },
  {
    id: 't3',
    type: 'expense',
    date: 'Apr 13, 2026',
    description: 'Netflix subscription',
    amount: '15.99',
    accountFrom: 'Visa Credit',
    category: 'Entertainment',
    label: '',
    accountTo: '',
  },
  {
    id: 't4',
    type: 'transfer',
    date: 'Apr 10, 2026',
    description: 'Savings transfer',
    amount: '500.00',
    accountFrom: 'Main Checking',
    category: '',
    label: '',
    accountTo: 'Savings',
  },
  {
    id: 't5',
    type: 'expense',
    date: 'Apr 9, 2026',
    description: 'Restaurant dinner',
    amount: '64.00',
    accountFrom: 'Visa Credit',
    category: 'Dining',
    label: '',
    accountTo: '',
  },
  {
    id: 't6',
    type: 'expense',
    date: 'Apr 8, 2026',
    description: 'Monthly metro pass',
    amount: '38.50',
    accountFrom: 'Main Checking',
    category: 'Transport',
    label: '',
    accountTo: '',
  },
  {
    id: 't7',
    type: 'expense',
    date: 'Apr 7, 2026',
    description: 'Electricity bill',
    amount: '60.20',
    accountFrom: 'Main Checking',
    category: 'Utilities',
    label: '',
    accountTo: '',
  },
  {
    id: 't8',
    type: 'income',
    date: 'Apr 5, 2026',
    description: 'Freelance invoice #12',
    amount: '550.00',
    accountFrom: 'Main Checking',
    category: 'Freelance',
    label: '',
    accountTo: '',
  },
];

// Period-dependent stats
const PERIOD_STATS: Record<
  string,
  { income: number; prevIncome: number; expense: number; prevExpense: number }
> = {
  current_month: {
    income: 3_750,
    prevIncome: 3_200,
    expense: 1_092,
    prevExpense: 2_560,
  },
  last_30_days: {
    income: 4_100,
    prevIncome: 3_750,
    expense: 2_340,
    prevExpense: 2_100,
  },
  current_year: {
    income: 19_650,
    prevIncome: 16_200,
    expense: 13_472,
    prevExpense: 12_980,
  },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [period, setPeriod] = useState('current_month');

  const stats = PERIOD_STATS[period];
  const totalCategorySpend = CATEGORY_SPENDING.reduce((s, c) => s + c.value, 0);

  const periodLabel: Record<string, string> = {
    current_month: 'April 2026',
    last_30_days: 'Last 30 days',
    current_year: 'Year 2026',
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{periodLabel[period]}</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-44 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current_month">Current month</SelectItem>
            <SelectItem value="last_30_days">Last 30 days</SelectItem>
            <SelectItem value="current_year">Current year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stat cards — 2 col */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          label="Income this period"
          value={stats.income || 0}
          previousValue={stats.prevIncome}
          colorClass="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Expenses this period"
          value={stats.expense}
          previousValue={stats.prevExpense}
          colorClass="text-rose-600 dark:text-rose-400"
        />
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Account Balances — full width */}
        <AccountBalancesWidget accounts={ACCOUNTS} />
        {/* Recent Transactions — full width */}
        <RecentTransactionsWidget transactions={RECENT_TRANSACTIONS} />

        <BudgetStatusWidget budgets={BUDGETS} />
      </div>

      {/* Budget Status + Spending by Category — 2 col */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BudgetStatusWidget budgets={BUDGETS} />
        <SpendingByCategoryChart data={CATEGORY_SPENDING} total={totalCategorySpend} />
      </div>

      {/* Monthly Trend — full width */}
      <MonthlyTrendChart data={MONTHLY_TREND} />
    </div>
  );
}
