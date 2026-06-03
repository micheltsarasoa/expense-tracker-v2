'use client';

import Link from 'next/link';
import { TrendingUp, TrendingDown, ArrowLeftRight, ArrowRight } from 'lucide-react';
import type { TransactionListItemDTO } from '@expense-tracker/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { eur, formatDay } from '@/lib/format';

const typeConfig = {
  income: {
    label: 'Income',
    icon: TrendingUp,
    badgeClass:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
    amountClass: 'text-emerald-600 dark:text-emerald-400',
    prefix: '+',
  },
  expense: {
    label: 'Expense',
    icon: TrendingDown,
    badgeClass:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800',
    amountClass: 'text-rose-600 dark:text-rose-400',
    prefix: '-',
  },
  transfer: {
    label: 'Transfer',
    icon: ArrowLeftRight,
    badgeClass:
      'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-400 dark:border-violet-800',
    amountClass: 'text-violet-600 dark:text-violet-400',
    prefix: '',
  },
};

interface RecentTransactionsWidgetProps {
  transactions: TransactionListItemDTO[];
  loading?: boolean;
}

export function RecentTransactionsWidget({ transactions, loading }: RecentTransactionsWidgetProps) {
  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-44" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Recent Transactions</CardTitle>
        <Button variant="ghost" size="sm" asChild className="text-xs gap-1 h-7 px-2">
          <Link href="/transactions">
            View all
            <ArrowRight className="size-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyTitle>No transactions yet</EmptyTitle>
              <EmptyDescription>Add your first transaction to get started.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="sm" asChild>
                <Link href="/transactions">Add transaction</Link>
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <ul className="divide-y divide-border">
            {transactions.map((tx) => {
              const config = typeConfig[tx.type];
              const Icon = config.icon;
              return (
                <li key={tx.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <Badge
                    variant="outline"
                    className={cn(
                      'flex shrink-0 items-center gap-1 text-xs font-medium',
                      config.badgeClass,
                    )}
                  >
                    <Icon className="size-3" />
                    {config.label}
                  </Badge>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm truncate">
                      {tx.description || (
                        <span className="text-muted-foreground italic">No description</span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {tx.paymentMethodName}
                      {tx.categoryName ? ` · ${tx.categoryName}` : ''}
                    </span>
                  </div>
                  <div className="flex flex-col items-end shrink-0 gap-0.5">
                    <span className={cn('text-sm font-medium tabular-nums', config.amountClass)}>
                      {config.prefix}
                      {eur(tx.amount)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDay(tx.transactionDate)}
                    </span>
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
