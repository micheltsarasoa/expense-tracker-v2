'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  const [range, setRange] = useState<DateRange | undefined>({
    from: parseISO(from),
    to: parseISO(to),
  });
  const [open, setOpen] = useState(false);

  function onPresetChange(value: string) {
    const next = value as DashboardPeriod;
    setSelected(next);
    if (next !== 'custom') {
      router.push(`${pathname}?period=${next}`);
    }
  }

  function onRangeSelect(next: DateRange | undefined) {
    setRange(next);
    if (next?.from && next.to) {
      setOpen(false);
      const params = new URLSearchParams({
        period: 'custom',
        from: format(next.from, 'yyyy-MM-dd'),
        to: format(next.to, 'yyyy-MM-dd'),
      });
      router.push(`${pathname}?${params.toString()}`);
    }
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
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="period-range"
              variant="outline"
              className="h-8 justify-start px-2.5 text-sm font-normal"
            >
              <CalendarIcon className="size-3.5" />
              {range?.from ? (
                range.to ? (
                  <>
                    {format(range.from, 'LLL dd, y')} – {format(range.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(range.from, 'LLL dd, y')
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              {...(range?.from ? { defaultMonth: range.from } : {})}
              selected={range}
              onSelect={onRangeSelect}
              numberOfMonths={2}
              autoFocus
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
