'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/date-picker';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import type { BudgetWithSpendingDTO } from '@expense-tracker/types';

interface DuplicateBudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: BudgetWithSpendingDTO | null;
  /** Returns true on success (modal then closes). Dates are ISO YYYY-MM-DD. */
  onDuplicate: (startDate: string, endDate: string) => Promise<boolean>;
}

function nextMonthBounds(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 2, 0));
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

export function DuplicateBudgetModal({
  open,
  onOpenChange,
  budget,
  onDuplicate,
}: DuplicateBudgetModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateError, setDateError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const { start, end } = nextMonthBounds();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStartDate(start);
    setEndDate(end);
    setDateError('');
    setSaving(false);
  }, [open]);

  async function handleSave() {
    if (!startDate) {
      setDateError('Start date is required.');
      return;
    }
    if (endDate && endDate <= startDate) {
      setDateError('End date must be after start date.');
      return;
    }
    setSaving(true);
    const ok = await onDuplicate(startDate, endDate);
    setSaving(false);
    if (ok) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Duplicate — {budget?.name}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Name, amount, and filters are copied from the original; pick a new date range.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dup-start">Start date</Label>
            <DatePicker
              id="dup-start"
              value={startDate}
              onChange={(v) => {
                setStartDate(v);
                setDateError('');
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dup-end">End date</Label>
            <DatePicker
              id="dup-end"
              value={endDate}
              onChange={(v) => {
                setEndDate(v);
                setDateError('');
              }}
            />
            {dateError && <p className="text-xs text-destructive">{dateError}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!startDate || saving}>
            {saving ? <Spinner className="mr-2 size-4" /> : null}
            {saving ? 'Duplicating…' : 'Duplicate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
