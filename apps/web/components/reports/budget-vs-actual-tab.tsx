'use client';

import { Download, AlertCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { cn } from '@/lib/utils';

export interface BudgetActualRow {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
}

interface Props {
  data: BudgetActualRow[];
  loading?: boolean;
}

function getBudgetMeta(spent: number, budgeted: number) {
  const pct = budgeted > 0 ? (spent / budgeted) * 100 : 0;
  const clamped = Math.min(pct, 100);
  if (pct >= 100) {
    return {
      pct,
      clamped,
      indicatorClass: 'bg-rose-500',
      textClass: 'text-rose-600 dark:text-rose-400',
      icon: <AlertCircle className="size-3.5 text-rose-500 shrink-0" />,
      label: 'Over budget',
    };
  }
  if (pct >= 75) {
    return {
      pct,
      clamped,
      indicatorClass: 'bg-amber-500',
      textClass: 'text-amber-600 dark:text-amber-400',
      icon: <AlertTriangle className="size-3.5 text-amber-500 shrink-0" />,
      label: 'Near limit',
    };
  }
  return {
    pct,
    clamped,
    indicatorClass: 'bg-emerald-500',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    icon: null,
    label: null,
  };
}

export function BudgetVsActualTab({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyTitle>No budgets in this period</EmptyTitle>
          <EmptyDescription>
            Create budgets or adjust the date range to see budget performance.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  // Sort: over-limit first, then by % desc
  const sorted = [...data].sort((a, b) => {
    const pctA = a.budgeted > 0 ? a.spent / a.budgeted : 0;
    const pctB = b.budgeted > 0 ? b.spent / b.budgeted : 0;
    return pctB - pctA;
  });

  const totalBudgeted = data.reduce((s, d) => s + d.budgeted, 0);
  const totalSpent = data.reduce((s, d) => s + d.spent, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="size-3.5" />
          Export CSV
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardContent className="py-4 px-6 divide-y divide-border">
          {sorted.map((row) => {
            const { pct, clamped, indicatorClass, textClass, icon, label } = getBudgetMeta(
              row.spent,
              row.budgeted,
            );
            const remaining = row.budgeted - row.spent;

            return (
              <div key={row.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {icon}
                    <span className="text-sm font-medium truncate">{row.name}</span>
                    {label && (
                      <span className={cn('text-xs font-medium hidden sm:inline', textClass)}>
                        — {label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-sm tabular-nums">
                    <span className={cn('font-semibold', textClass)}>{pct.toFixed(0)}%</span>
                    <span className="text-muted-foreground">
                      €{row.spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      {' / '}€{row.budgeted.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Progress
                    value={clamped}
                    className="flex-1 h-2"
                    indicatorClassName={indicatorClass}
                  />
                  <span className="text-xs text-muted-foreground tabular-nums w-24 text-right shrink-0">
                    {remaining >= 0
                      ? `€${remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })} left`
                      : `-€${Math.abs(remaining).toLocaleString('en-US', { minimumFractionDigits: 2 })} over`}
                  </span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Summary footer */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total budgeted', value: totalBudgeted, colorClass: 'text-foreground' },
          {
            label: 'Total spent',
            value: totalSpent,
            colorClass:
              totalSpent > totalBudgeted ? 'text-rose-600 dark:text-rose-400' : 'text-foreground',
          },
          {
            label: 'Remaining',
            value: totalBudgeted - totalSpent,
            colorClass:
              totalBudgeted - totalSpent >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400',
          },
        ].map((item) => (
          <Card key={item.label} className="shadow-sm">
            <CardContent className="py-4 px-5">
              <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
              <p className={cn('text-xl font-bold tabular-nums', item.colorClass)}>
                {item.label === 'Remaining' && item.value < 0 ? '-' : ''}€
                {Math.abs(item.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
