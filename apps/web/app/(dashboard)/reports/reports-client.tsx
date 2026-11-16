'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from '@/components/date-range-picker';
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

interface ReportsClientProps {
  from: string;
  to: string;
  spending: CategorySlice[];
  monthly: MonthlyEntry[];
  balanceData: BalanceDataPoint[];
  balanceAccounts: AccountLine[];
  budgets: BudgetActualRow[];
}

const TABS = [
  { value: 'spending', label: 'Spending by Category' },
  { value: 'income-expenses', label: 'Income vs Expenses' },
  { value: 'balance', label: 'Balance History' },
  { value: 'budget', label: 'Budget vs Actual' },
];

export function ReportsClient({
  from,
  to,
  spending,
  monthly,
  balanceData,
  balanceAccounts,
  budgets,
}: ReportsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [tab, setTab] = useState('spending');

  function handleRangeChange(nextFrom: string, nextTo: string): void {
    const params = new URLSearchParams({ from: nextFrom, to: nextTo });
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
          <BarChart3 className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Analyse your spending, income, and budgets over a date range.
          </p>
        </div>
      </div>

      {/* Date-range filter */}
      <div className="rounded-xl border border-border bg-card shadow-sm p-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="rep-range" className="text-xs font-medium text-muted-foreground">
            Date range
          </label>
          <DateRangePicker
            id="rep-range"
            from={from}
            to={to}
            onChange={handleRangeChange}
            placeholder="Pick a date range"
            className="w-fit"
          />
        </div>
      </div>

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
          <TabsContent value="spending">
            <SpendingByCategoryTab data={spending} />
          </TabsContent>
          <TabsContent value="income-expenses">
            <IncomeVsExpensesTab data={monthly} />
          </TabsContent>
          <TabsContent value="balance">
            <BalanceHistoryTab data={balanceData} accounts={balanceAccounts} />
          </TabsContent>
          <TabsContent value="budget">
            <BudgetVsActualTab data={budgets} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
