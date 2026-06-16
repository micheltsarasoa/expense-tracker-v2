import { TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TransactionType } from './transaction-type-tab';

export const transactionTypeConfig: Record<
  TransactionType,
  {
    label: string;
    icon: React.ElementType;
    badgeClass: string;
    amountClass: string;
    prefix: string;
  }
> = {
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

interface TransactionTypeBadgeProps {
  type: TransactionType;
  className?: string;
}

export function TransactionTypeBadge({ type, className }: TransactionTypeBadgeProps) {
  const config = transactionTypeConfig[type];
  const Icon = config.icon;
  return (
    <Badge
      variant="outline"
      className={cn('flex items-center gap-1 text-xs font-medium', config.badgeClass, className)}
    >
      <Icon className="size-3" />
      {config.label}
    </Badge>
  );
}
