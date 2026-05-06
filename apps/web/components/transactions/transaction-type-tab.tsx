'use client';

import { TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TransactionType = 'income' | 'expense' | 'transfer';

interface TransactionTypeTabsProps {
  value: TransactionType;
  onChange: (value: TransactionType) => void;
}

const tabs: {
  value: TransactionType;
  label: string;
  icon: React.ElementType;
  activeClass: string;
}[] = [
  {
    value: 'income',
    label: 'Income',
    icon: TrendingUp,
    activeClass:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
  },
  {
    value: 'expense',
    label: 'Expense',
    icon: TrendingDown,
    activeClass:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800',
  },
  {
    value: 'transfer',
    label: 'Transfer',
    icon: ArrowLeftRight,
    activeClass:
      'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-400 dark:border-violet-800',
  },
];

export function TransactionTypeTabs({ value, onChange }: TransactionTypeTabsProps) {
  return (
    <div className="flex gap-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = value === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? tab.activeClass
                : 'border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted',
            )}
          >
            <Icon className="size-3.5" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
