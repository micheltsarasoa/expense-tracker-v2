'use client';

import { cn } from '@/lib/utils';
import { useFormat } from '@/lib/settings-context';

interface MoneyProps {
  value: number | string;
  className?: string;
}

export function Money({ value, className }: MoneyProps) {
  const { money } = useFormat();
  return <span className={cn('font-mono tabular-nums', className)}>{money(value)}</span>;
}
