'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRangePicker } from '@/components/date-range-picker';
import type { DashboardPeriod } from '@/lib/period';

const PRESETS: { value: DashboardPeriod; label: string }[] = [
  { value: 'this-month', label: 'This month' },
  { value: 'last-month', label: 'Last month' },
  { value: 'last-3-months', label: 'Last 3 months' },
  { value: 'this-year', label: 'This year' },
  { value: 'custom', label: 'Custom range' },
];

interface PeriodSelectorProps {
  period: DashboardPeriod;
  from: string;
  to: string;
}

export function PeriodSelector({ period, from, to }: PeriodSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [selected, setSelected] = useState<DashboardPeriod>(period);

  function onPresetChange(value: string) {
    const next = value as DashboardPeriod;
    setSelected(next);
    if (next !== 'custom') {
      router.push(`${pathname}?period=${next}`);
    }
  }

  function handleRangeChange(nextFrom: string, nextTo: string): void {
    const params = new URLSearchParams({ period: 'custom', from: nextFrom, to: nextTo });
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <Select value={selected} onValueChange={onPresetChange}>
        <SelectTrigger className="h-8 w-40 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selected === 'custom' && (
        <DateRangePicker
          id="period-range"
          from={from}
          to={to}
          onChange={handleRangeChange}
          placeholder="Pick a date range"
        />
      )}
    </div>
  );
}
