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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import type { Budget } from './budget-card';

interface DuplicateBudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: Budget | null;
  onDuplicate: (startDate: string, endDate: string) => void;
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
    if (open && budget) {
      // Pre-fill: first day of month after original's start, last day of that month
      try {
        const orig = new Date(budget.startDate);
        const nextMonth = new Date(orig.getFullYear(), orig.getMonth() + 1, 1);
        const lastDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStartDate(nextMonth.toISOString().split('T')[0]);
        setEndDate(lastDay.toISOString().split('T')[0]);
      } catch {
        setStartDate('');
        setEndDate('');
      }
      setDateError('');
      setSaving(false);
    }
  }, [open, budget]);

  function handleSave() {
    if (endDate && endDate < startDate) {
      setDateError('End date must be after start date.');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      onDuplicate(startDate, endDate);
      setSaving(false);
      onOpenChange(false);
    }, 600);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Duplicate — {budget?.name}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Name, amount, and filters will be copied from the original.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dup-start">Start date</Label>
            <Input
              id="dup-start"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDateError('');
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dup-end">End date (optional)</Label>
            <Input
              id="dup-end"
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDateError('');
              }}
            />
            {dateError && <p className="text-xs text-destructive">{dateError}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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
