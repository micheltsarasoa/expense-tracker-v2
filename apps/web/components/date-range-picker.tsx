'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useFormat } from '@/lib/settings-context';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
  placeholder?: string;
  numberOfMonths?: number;
  align?: 'start' | 'center' | 'end';
  id?: string;
  className?: string;
}

function toRange(from: string, to: string): DateRange | undefined {
  if (!from) return undefined;
  return { from: parseISO(from), to: to ? parseISO(to) : undefined };
}

export function DateRangePicker({
  from,
  to,
  onChange,
  placeholder = 'Date range',
  numberOfMonths = 2,
  align = 'start',
  id,
  className,
}: DateRangePickerProps) {
  const { date } = useFormat();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>(toRange(from, to));

  function handleOpenChange(next: boolean): void {
    if (next) setDraft(toRange(from, to));
    setOpen(next);
  }

  function applyDraft(): void {
    if (draft?.from && draft.to) {
      onChange(format(draft.from, 'yyyy-MM-dd'), format(draft.to, 'yyyy-MM-dd'));
    } else if (!draft) {
      onChange('', '');
    }
    setOpen(false);
  }

  function cancelDraft(): void {
    setDraft(toRange(from, to));
    setOpen(false);
  }

  const canApply = !draft || (!!draft.from && !!draft.to);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          aria-label={placeholder}
          className={cn(
            'h-8 justify-start px-2.5 text-sm font-normal',
            !from && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="size-3.5" />
          {from ? (
            to ? (
              <>
                {date(from)} – {date(to)}
              </>
            ) : (
              date(from)
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          mode="range"
          {...(draft?.from ? { defaultMonth: draft.from } : {})}
          selected={draft}
          onSelect={setDraft}
          numberOfMonths={numberOfMonths}
          autoFocus
        />
        <div className="flex items-center justify-end gap-2 border-t border-border p-2">
          <Button variant="ghost" size="sm" className="h-8" onClick={cancelDraft}>
            Cancel
          </Button>
          <Button size="sm" className="h-8" onClick={applyDraft} disabled={!canApply}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
