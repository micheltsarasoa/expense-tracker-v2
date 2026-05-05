'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import type { Budget } from './budget-card';

const CATEGORIES = [
  { id: 'food', name: 'Food & Dining', color: '#10b981' },
  { id: 'transport', name: 'Transport', color: '#3b82f6' },
  { id: 'housing', name: 'Housing', color: '#8b5cf6' },
  { id: 'health', name: 'Health', color: '#ef4444' },
  { id: 'entertainment', name: 'Entertainment', color: '#f59e0b' },
  { id: 'shopping', name: 'Shopping', color: '#ec4899' },
];

const LABELS = ['Personal', 'Work', 'Family', 'Vacation'];

interface BudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: Budget | null;
  onSave: (budget: Partial<Budget>) => void;
}

interface FormState {
  name: string;
  amount: string;
  startDate: string;
  endDate: string;
  category: string;
  label: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  amount: '',
  startDate: '',
  endDate: '',
  category: '',
  label: '',
};

function toInputDate(display: string): string {
  // expects "D MMM YYYY", converts to YYYY-MM-DD for <input type="date">
  if (!display) return '';
  try {
    return new Date(display).toISOString().split('T')[0];
  } catch {
    return '';
  }
}

function fromInputDate(value: string): string {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

export function BudgetModal({ open, onOpenChange, budget, onSave }: BudgetModalProps) {
  const isEdit = !!budget;
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  useEffect(() => {
    if (open) {
      if (budget) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm({
          name: budget.name,
          amount: String(budget.amount),
          startDate: toInputDate(budget.startDate),
          endDate: toInputDate(budget.endDate),
          category: budget.category ?? '',
          label: budget.label ?? '',
        });
      } else {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          .toISOString()
          .split('T')[0];
        setForm({ ...EMPTY_FORM, startDate: firstDay, endDate: lastDay });
      }
      setErrors({});
      setSaving(false);
    }
  }, [open, budget]);

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<FormState> = {};
    if (!form.name.trim()) next.name = 'Name is required.';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      next.amount = 'Enter a valid positive amount.';
    if (!form.startDate) next.startDate = 'Start date is required.';
    if (form.endDate && form.startDate && form.endDate < form.startDate)
      next.endDate = 'End date must be after start date.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    const cat = CATEGORIES.find((c) => c.id === form.category);
    onSave({
      name: form.name.trim(),
      amount: Number(form.amount),
      spent: budget?.spent ?? 0,
      startDate: fromInputDate(form.startDate),
      endDate: form.endDate ? fromInputDate(form.endDate) : 'No end date',
      category: cat?.name,
      categoryColor: cat?.color,
      label: form.label || undefined,
    });
    setSaving(false);
    onOpenChange(false);
  }

  const isValid =
    form.name.trim() !== '' &&
    form.amount !== '' &&
    !isNaN(Number(form.amount)) &&
    Number(form.amount) > 0 &&
    form.startDate !== '' &&
    (!form.endDate || form.endDate >= form.startDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Budget' : 'New Budget'}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="budget-name">Name</Label>
            <Input
              id="budget-name"
              placeholder="e.g. Monthly groceries"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="budget-amount">Amount</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                €
              </span>
              <Input
                id="budget-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => set('amount', e.target.value)}
                className="pl-7"
              />
            </div>
            {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="budget-start">Start date</Label>
              <Input
                id="budget-start"
                type="date"
                value={form.startDate}
                onChange={(e) => set('startDate', e.target.value)}
              />
              {errors.startDate && <p className="text-xs text-destructive">{errors.startDate}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="budget-end">End date</Label>
              <Input
                id="budget-end"
                type="date"
                value={form.endDate}
                onChange={(e) => set('endDate', e.target.value)}
              />
              {errors.endDate && <p className="text-xs text-destructive">{errors.endDate}</p>}
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="budget-category">Category (optional)</Label>
            <Select value={form.category} onValueChange={(v) => set('category', v)}>
              <SelectTrigger id="budget-category">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: c.color }}
                      />
                      {c.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Label */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="budget-label">Label (optional)</Label>
            <Select value={form.label} onValueChange={(v) => set('label', v)}>
              <SelectTrigger id="budget-label">
                <SelectValue placeholder="No label" />
              </SelectTrigger>
              <SelectContent>
                {LABELS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid || saving}>
            {saving ? <Spinner className="mr-2 size-4" /> : null}
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
