'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  previousValue?: number;
  colorClass: string;
  loading?: boolean;
}

export function StatCard({ label, value, previousValue, colorClass, loading }: StatCardProps) {
  const diff = previousValue !== undefined ? value - previousValue : undefined;
  const pct =
    previousValue !== undefined && previousValue !== 0
      ? ((value - previousValue) / Math.abs(previousValue)) * 100
      : undefined;

  const trendUp = diff !== undefined && diff > 0;
  const trendDown = diff !== undefined && diff < 0;

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-5 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={cn('text-2xl font-bold tabular-nums mt-1', colorClass)}>
          €{value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        {pct !== undefined && diff !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 mt-2 text-xs font-medium',
              trendUp && 'text-emerald-600 dark:text-emerald-400',
              trendDown && 'text-rose-600 dark:text-rose-400',
              !trendUp && !trendDown && 'text-muted-foreground',
            )}
          >
            {trendUp ? (
              <TrendingUp className="size-3.5" />
            ) : trendDown ? (
              <TrendingDown className="size-3.5" />
            ) : (
              <Minus className="size-3.5" />
            )}
            <span>
              {trendUp ? '+' : ''}
              {pct.toFixed(1)}% vs previous period
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
