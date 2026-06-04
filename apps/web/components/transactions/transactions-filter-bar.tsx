'use client';

import { X, TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react';
import type {
  CategoryOptionDTO,
  LabelOptionDTO,
  PaymentMethodOptionDTO,
} from '@expense-tracker/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface TransactionFilterValues {
  type: string; // 'all' | income | expense | transfer
  categoryId: string; // 'all' | uuid
  labelId: string; // 'all' | uuid
  paymentMethodId: string; // 'all' | uuid
  from: string;
  to: string;
  isValidated: string; // 'all' | 'true' | 'false'
}

export const defaultFilterValues: TransactionFilterValues = {
  type: 'all',
  categoryId: 'all',
  labelId: 'all',
  paymentMethodId: 'all',
  from: '',
  to: '',
  isValidated: 'all',
};

interface Props {
  value: TransactionFilterValues;
  categories: CategoryOptionDTO[];
  labels: LabelOptionDTO[];
  paymentMethods: PaymentMethodOptionDTO[];
  onChange: (next: TransactionFilterValues) => void;
}

const typeOptions: {
  value: string;
  label: string;
  icon?: React.ElementType;
  activeClass: string;
}[] = [
  { value: 'all', label: 'All', activeClass: 'bg-primary text-primary-foreground border-primary' },
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

function isActiveFilter(v: TransactionFilterValues): boolean {
  return (
    v.type !== 'all' ||
    v.categoryId !== 'all' ||
    v.labelId !== 'all' ||
    v.paymentMethodId !== 'all' ||
    v.from !== '' ||
    v.to !== '' ||
    v.isValidated !== 'all'
  );
}

export function TransactionsFilterBar({
  value,
  categories,
  labels,
  paymentMethods,
  onChange,
}: Props) {
  const set = <K extends keyof TransactionFilterValues>(
    key: K,
    v: TransactionFilterValues[K],
  ): void => onChange({ ...value, [key]: v });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-1.5">
        {typeOptions.map((opt) => {
          const Icon = opt.icon;
          const active = value.type === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => set('type', opt.value)}
              className={cn(
                'flex items-center gap-1 rounded-md border px-2.5 py-1 text-sm font-medium transition-colors',
                active
                  ? opt.activeClass
                  : 'border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
            >
              {Icon && <Icon className="size-3" />}
              {opt.label}
            </button>
          );
        })}
      </div>

      <Select value={value.categoryId} onValueChange={(v) => set('categoryId', v)}>
        <SelectTrigger className="h-8 w-40 text-sm">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={value.labelId} onValueChange={(v) => set('labelId', v)}>
        <SelectTrigger className="h-8 w-36 text-sm">
          <SelectValue placeholder="Label" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All labels</SelectItem>
          {labels.map((l) => (
            <SelectItem key={l.id} value={l.id}>
              {l.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={value.paymentMethodId} onValueChange={(v) => set('paymentMethodId', v)}>
        <SelectTrigger className="h-8 w-40 text-sm">
          <SelectValue placeholder="Account" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All accounts</SelectItem>
          {paymentMethods.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1">
        <Input
          type="date"
          aria-label="From date"
          className="h-8 w-36 text-sm"
          value={value.from}
          onChange={(e) => set('from', e.target.value)}
        />
        <span className="text-muted-foreground text-xs">to</span>
        <Input
          type="date"
          aria-label="To date"
          className="h-8 w-36 text-sm"
          value={value.to}
          onChange={(e) => set('to', e.target.value)}
        />
      </div>

      <Select value={value.isValidated} onValueChange={(v) => set('isValidated', v)}>
        <SelectTrigger className="h-8 w-36 text-sm">
          <SelectValue placeholder="Validated" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="true">Validated</SelectItem>
          <SelectItem value="false">Unvalidated</SelectItem>
        </SelectContent>
      </Select>

      {isActiveFilter(value) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(defaultFilterValues)}
          className="h-8 gap-1.5 text-muted-foreground"
        >
          <X className="size-3.5" />
          Reset filters
        </Button>
      )}
    </div>
  );
}
