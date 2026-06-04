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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  const [localFrom, setLocalFrom] = useState(from);
  const [localTo, setLocalTo] = useState(to);

  function pushPeriod(next: DashboardPeriod) {
    const params = new URLSearchParams();
    params.set('period', next);
    if (next === 'custom') {
      if (localFrom) params.set('from', localFrom);
      if (localTo) params.set('to', localTo);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function onPresetChange(value: string) {
    const next = value as DashboardPeriod;
    setSelected(next);
    if (next !== 'custom') pushPeriod(next);
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
        <>
          <Input
            type="date"
            value={localFrom}
            onChange={(e) => setLocalFrom(e.target.value)}
            className="h-8 text-sm"
            aria-label="From date"
          />
          <Input
            type="date"
            value={localTo}
            onChange={(e) => setLocalTo(e.target.value)}
            className="h-8 text-sm"
            aria-label="To date"
          />
          <Button size="sm" className="h-8" onClick={() => pushPeriod('custom')}>
            Apply
          </Button>
        </>
      )}
    </div>
  );
}
