'use client';

import { X, TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react';
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

export interface TransactionFilters {
  type: string;
  category: string;
  label: string;
  account: string;
  dateFrom: string;
  dateTo: string;
  validated: string;
}

const defaultFilters: TransactionFilters = {
  type: 'all',
  category: 'all',
  label: 'all',
  account: 'all',
  dateFrom: '',
  dateTo: '',
  validated: 'all',
};

interface TransactionsFilterBarProps {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
}

const typeOptions: {
  value: string;
  label: string;
  icon?: React.ElementType;
  activeClass: string;
}[] = [
  {
    value: 'all',
    label: 'All',
    activeClass: 'bg-primary text-primary-foreground border-primary',
  },
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

const validatedOptions = [
  { value: 'all', label: 'All' },
  { value: 'validated', label: 'Validated' },
  { value: 'unvalidated', label: 'Unvalidated' },
];

const mockCategories = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Housing',
  'Entertainment',
  'Health',
  'Salary',
];
const mockLabels = ['Personal', 'Business', 'Recurring', 'One-time'];
const mockAccounts = ['Checking Account', 'Savings Account', 'Cash', 'Credit Card'];

function hasActiveFilters(filters: TransactionFilters) {
  return (
    filters.type !== 'all' ||
    filters.category !== 'all' ||
    filters.label !== 'all' ||
    filters.account !== 'all' ||
    filters.dateFrom !== '' ||
    filters.dateTo !== '' ||
    filters.validated !== 'all'
  );
}

export function TransactionsFilterBar({ filters, onChange }: TransactionsFilterBarProps) {
  const active = hasActiveFilters(filters);

  const set = <K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) =>
    onChange({ ...filters, [key]: value });

  const reset = () => onChange(defaultFilters);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Type segmented */}
      <div className="flex gap-1.5">
        {typeOptions.map((opt) => {
          const Icon = opt.icon;
          const isActive = filters.type === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => set('type', opt.value)}
              className={cn(
                'flex items-center gap-1 rounded-md border px-2.5 py-1 text-sm font-medium transition-colors',
                isActive
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

      {/* Category */}
      <Select value={filters.category} onValueChange={(v) => set('category', v)}>
        <SelectTrigger className="h-8 w-40 text-sm">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {mockCategories.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Label */}
      <Select value={filters.label} onValueChange={(v) => set('label', v)}>
        <SelectTrigger className="h-8 w-36 text-sm">
          <SelectValue placeholder="Label" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All labels</SelectItem>
          {mockLabels.map((l) => (
            <SelectItem key={l} value={l}>
              {l}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Account */}
      <Select value={filters.account} onValueChange={(v) => set('account', v)}>
        <SelectTrigger className="h-8 w-40 text-sm">
          <SelectValue placeholder="Account" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All accounts</SelectItem>
          {mockAccounts.map((a) => (
            <SelectItem key={a} value={a}>
              {a}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date range */}
      <div className="flex items-center gap-1">
        <Input
          type="date"
          aria-label="From date"
          className="h-8 w-36 text-sm"
          value={filters.dateFrom}
          onChange={(e) => set('dateFrom', e.target.value)}
        />
        <span className="text-muted-foreground text-xs">to</span>
        <Input
          type="date"
          aria-label="To date"
          className="h-8 w-36 text-sm"
          value={filters.dateTo}
          onChange={(e) => set('dateTo', e.target.value)}
        />
      </div>

      {/* Validated */}
      <Select value={filters.validated} onValueChange={(v) => set('validated', v)}>
        <SelectTrigger className="h-8 w-36 text-sm">
          <SelectValue placeholder="Validated" />
        </SelectTrigger>
        <SelectContent>
          {validatedOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Reset */}
      {active && (
        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          className="h-8 gap-1.5 text-muted-foreground"
        >
          <X className="size-3.5" />
          Reset filters
        </Button>
      )}
    </div>
  );
}

export { defaultFilters };
