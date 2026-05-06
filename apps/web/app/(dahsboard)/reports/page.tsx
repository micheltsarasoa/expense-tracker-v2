'use client';

import { useState } from 'react';
import { BarChart3, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  SpendingByCategoryTab,
  type CategorySlice,
} from '@/components/reports/spending-by-category-tab';
import {
  IncomeVsExpensesTab,
  type MonthlyEntry,
} from '@/components/reports/income-vs-expenses-tab';
import {
  BalanceHistoryTab,
  type BalanceDataPoint,
  type AccountLine,
} from '@/components/reports/balance-history-tab';
import { BudgetVsActualTab, type BudgetActualRow } from '@/components/reports/budget-vs-actual-tab';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const CATEGORY_DATA: CategorySlice[] = [
  { name: 'Food & Dining', value: 610, color: '#f59e0b' },
  { name: 'Transport', value: 133, color: '#3b82f6' },
  { name: 'Housing', value: 920, color: '#8b5cf6' },
  { name: 'Health', value: 85, color: '#ef4444' },
  { name: 'Entertainment', value: 185, color: '#ec4899' },
  { name: 'Shopping', value: 278, color: '#f97316' },
  { name: 'Other', value: 96, color: '#6b7280' },
];

const MONTHLY_DATA: MonthlyEntry[] = [
  { month: 'Nov', income: 3_200, expense: 2_100 },
  { month: 'Dec', income: 4_100, expense: 3_400 },
  { month: 'Jan', income: 3_200, expense: 1_980 },
  { month: 'Feb', income: 3_200, expense: 2_340 },
  { month: 'Mar', income: 3_750, expense: 2_560 },
  { month: 'Apr', income: 3_200, expense: 2_307 },
];

const BALANCE_ACCOUNTS: AccountLine[] = [
  { name: 'Main Checking', color: '#3b82f6' },
  { name: 'Savings', color: '#10b981' },
  { name: 'Visa Credit', color: '#f43f5e' },
];

const BALANCE_DATA: BalanceDataPoint[] = [
  { date: '1 Nov', 'Main Checking': 3_200, Savings: 10_000, 'Visa Credit': -150 },
  { date: '15 Nov', 'Main Checking': 2_800, Savings: 10_200, 'Visa Credit': -380 },
  { date: '1 Dec', 'Main Checking': 3_900, Savings: 10_500, 'Visa Credit': -200 },
  { date: '15 Dec', 'Main Checking': 3_100, Savings: 10_500, 'Visa Credit': -620 },
  { date: '1 Jan', 'Main Checking': 4_250, Savings: 11_000, 'Visa Credit': -320 },
  { date: '15 Jan', 'Main Checking': 3_700, Savings: 11_200, 'Visa Credit': -180 },
  { date: '1 Feb', 'Main Checking': 4_800, Savings: 11_500, 'Visa Credit': -90 },
  { date: '15 Feb', 'Main Checking': 4_200, Savings: 11_800, 'Visa Credit': -410 },
  { date: '1 Mar', 'Main Checking': 5_100, Savings: 12_000, 'Visa Credit': -220 },
  { date: '15 Mar', 'Main Checking': 4_500, Savings: 12_200, 'Visa Credit': -320 },
  { date: '1 Apr', 'Main Checking': 4_900, Savings: 12_500, 'Visa Credit': -100 },
  { date: '15 Apr', 'Main Checking': 4_251, Savings: 12_000, 'Visa Credit': -320 },
];

const BUDGET_DATA: BudgetActualRow[] = [
  { id: 'b1', name: 'Groceries', budgeted: 400, spent: 380 },
  { id: 'b2', name: 'Dining Out', budgeted: 200, spent: 230 },
  { id: 'b3', name: 'Transport', budgeted: 150, spent: 133 },
  { id: 'b4', name: 'Entertainment', budgeted: 200, spent: 185 },
  { id: 'b5', name: 'Utilities', budgeted: 120, spent: 60 },
  { id: 'b6', name: 'Shopping', budgeted: 250, spent: 278 },
  { id: 'b7', name: 'Health', budgeted: 100, spent: 85 },
];

// ---------------------------------------------------------------------------
// Filter bar
// ---------------------------------------------------------------------------

interface Filters {
  from: string;
  to: string;
  accountId: string;
  categoryId: string;
}

const ACCOUNTS_OPTS = [
  { value: 'all', label: 'All accounts' },
  { value: 'checking', label: 'Main Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'visa', label: 'Visa Credit' },
];

const CATEGORY_OPTS = [
  { value: 'all', label: 'All categories' },
  { value: 'food', label: 'Food & Dining' },
  { value: 'transport', label: 'Transport' },
  { value: 'housing', label: 'Housing' },
  { value: 'health', label: 'Health' },
  { value: 'entertainment', label: 'Entertainment' },
];

function hasActiveFilters(f: Filters) {
  return f.from !== '' || f.to !== '' || f.accountId !== 'all' || f.categoryId !== 'all';
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const TABS = [
  { value: 'spending', label: 'Spending by Category' },
  { value: 'income-expenses', label: 'Income vs Expenses' },
  { value: 'balance', label: 'Balance History' },
  { value: 'budget', label: 'Budget vs Actual' },
];

export default function ReportsPage() {
  const [tab, setTab] = useState('spending');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    from: '2026-04-01',
    to: '2026-04-15',
    accountId: 'all',
    categoryId: 'all',
  });

  function set<K extends keyof Filters>(key: K, val: Filters[K]) {
    setFilters((f) => ({ ...f, [key]: val }));
  }

  function resetFilters() {
    setFilters({ from: '2026-04-01', to: '2026-04-15', accountId: 'all', categoryId: 'all' });
  }

  const activeFilterCount = [
    filters.from !== '2026-04-01',
    filters.to !== '2026-04-15',
    filters.accountId !== 'all',
    filters.categoryId !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
            <BarChart3 className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Reports</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Analyse your financial data across periods, accounts, and categories.
            </p>
          </div>
        </div>

        {/* Mobile filter toggle */}
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 sm:hidden"
          onClick={() => setFiltersOpen((v) => !v)}
        >
          <SlidersHorizontal className="size-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-1 size-4 rounded-full p-0 flex items-center justify-center text-[10px]">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Global filter bar */}
      <div
        className={cn(
          'rounded-xl border border-border bg-card shadow-sm p-4',
          'sm:block',
          filtersOpen ? 'block' : 'hidden',
        )}
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1 min-w-32.5">
            <label className="text-xs font-medium text-muted-foreground">From</label>
            <Input
              type="date"
              value={filters.from}
              onChange={(e) => set('from', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1 min-w-32.5">
            <label className="text-xs font-medium text-muted-foreground">To</label>
            <Input
              type="date"
              value={filters.to}
              onChange={(e) => set('to', e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1 min-w-40">
            <label className="text-xs font-medium text-muted-foreground">Account</label>
            <Select value={filters.accountId} onValueChange={(v) => set('accountId', v)}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNTS_OPTS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category filter — only meaningful for Spending tab */}
          <div
            className={cn(
              'flex flex-col gap-1 min-w-40',
              tab !== 'spending' && 'opacity-40 pointer-events-none',
            )}
          >
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <Select value={filters.categoryId} onValueChange={(v) => set('categoryId', v)}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters(filters) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-muted-foreground hover:text-foreground self-end"
              onClick={resetFilters}
            >
              <X className="size-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-9 w-full justify-start overflow-x-auto bg-muted/60 rounded-lg p-1 gap-0.5 flex-wrap sm:flex-nowrap">
          {TABS.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="text-xs sm:text-sm h-7 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          <TabsContent value="spending" forceMount className={tab !== 'spending' ? 'hidden' : ''}>
            <SpendingByCategoryTab data={CATEGORY_DATA} />
          </TabsContent>

          <TabsContent
            value="income-expenses"
            forceMount
            className={tab !== 'income-expenses' ? 'hidden' : ''}
          >
            <IncomeVsExpensesTab data={MONTHLY_DATA} />
          </TabsContent>

          <TabsContent value="balance" forceMount className={tab !== 'balance' ? 'hidden' : ''}>
            <BalanceHistoryTab data={BALANCE_DATA} accounts={BALANCE_ACCOUNTS} />
          </TabsContent>

          <TabsContent value="budget" forceMount className={tab !== 'budget' ? 'hidden' : ''}>
            <BudgetVsActualTab data={BUDGET_DATA} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
