'use client';

import { AlertCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { cn } from '@/lib/utils';
import { useFormat } from '@/lib/settings-context';

export interface BudgetSummaryItem {
  id: string;
  name: string;
  spent: number;
  amount: number;
}

interface BudgetStatusWidgetProps {
  budgets: BudgetSummaryItem[];
  loading?: boolean;
}

function getProgressColor(pct: number) {
  if (pct >= 100) return 'bg-rose-500';
  if (pct >= 75) return 'bg-amber-500';
  return 'bg-emerald-500';
}

export function BudgetStatusWidget({ budgets, loading }: BudgetStatusWidgetProps) {
  const { money } = useFormat();
  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-10" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Sort: over-limit first, then warning, then normal
  const sorted = [...budgets].sort((a, b) => {
    const pctA = a.amount > 0 ? (a.spent / a.amount) * 100 : 0;
    const pctB = b.amount > 0 ? (b.spent / b.amount) * 100 : 0;
    if (pctA >= 100 && pctB < 100) return -1;
    if (pctB >= 100 && pctA < 100) return 1;
    if (pctA >= 75 && pctB < 75) return -1;
    if (pctB >= 75 && pctA < 75) return 1;
    return pctB - pctA;
  });

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Budget Status</CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyTitle>No budgets</EmptyTitle>
              <EmptyDescription>Create a budget to track your spending.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="space-y-4">
            {sorted.map((budget) => {
              const rawPct = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
              const pct = Math.min(rawPct, 100);
              const isOver = rawPct >= 100;
              const isWarn = rawPct >= 75 && rawPct < 100;
              const progressColor = getProgressColor(rawPct);

              return (
                <li key={budget.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {isOver && <AlertCircle className="size-3.5 shrink-0 text-rose-500" />}
                      {isWarn && !isOver && (
                        <AlertTriangle className="size-3.5 shrink-0 text-amber-500" />
                      )}
                      <span className="text-sm font-medium truncate">{budget.name}</span>
                    </div>
                    <span
                      className={cn(
                        'text-xs tabular-nums shrink-0 font-medium',
                        isOver
                          ? 'text-rose-600 dark:text-rose-400'
                          : isWarn
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-muted-foreground',
                      )}
                    >
                      {Math.round(rawPct)}%
                    </span>
                  </div>
                  <Progress value={pct} className="h-1.5" indicatorClassName={progressColor} />
                  <div className="flex items-center justify-between text-xs text-muted-foreground tabular-nums">
                    <span>{money(budget.spent)} spent</span>
                    <span>of {money(budget.amount)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
