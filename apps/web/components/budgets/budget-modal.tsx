'use client';

import { useState, useEffect } from 'react';
import type { BudgetWithSpendingDTO, CategoryOptionDTO } from '@expense-tracker/types';
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

export interface BudgetFormValues {
  name: string;
  amount: string;
  startDate: string;
  endDate: string;
  categoryId: string;
}

interface BudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: BudgetWithSpendingDTO | null;
  categories: CategoryOptionDTO[];
  /** Returns true on success (modal then closes), false on failure (stays open). */
  onSubmit: (values: BudgetFormValues) => Promise<boolean>;
}

interface FormState {
  name: string;
  amount: string;
  startDate: string;
  endDate: string;
  categoryId: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  amount: '',
  startDate: '',
  endDate: '',
  categoryId: '',
};

function monthBounds(): { firstDay: string; lastDay: string } {
  const now = new Date();
  const first = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const last = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
  return { firstDay: first.toISOString().slice(0, 10), lastDay: last.toISOString().slice(0, 10) };
}

export function BudgetModal({
  open,
  onOpenChange,
  budget,
  categories,
  onSubmit,
}: BudgetModalProps) {
  const isEdit = !!budget;
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  useEffect(() => {
    if (!open) return;
    if (budget) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        name: budget.name,
        amount: budget.amount,
        startDate: budget.startDate,
        endDate: budget.endDate ?? '',
        categoryId: budget.categoryId ?? '',
      });
    } else {
      const { firstDay, lastDay } = monthBounds();
      setForm({ ...EMPTY_FORM, startDate: firstDay, endDate: lastDay });
    }
    setErrors({});
    setSaving(false);
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
    if (!form.endDate) next.endDate = 'End date is required.';
    else if (form.startDate && form.endDate <= form.startDate)
      next.endDate = 'End date must be after start date.';
    if (!form.categoryId) next.categoryId = 'Category is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    const ok = await onSubmit({
      name: form.name.trim(),
      amount: form.amount,
      startDate: form.startDate,
      endDate: form.endDate,
      categoryId: form.categoryId,
    });
    setSaving(false);
    if (ok) onOpenChange(false);
  }

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
            <Label htmlFor="budget-category">Category</Label>
            <Select value={form.categoryId} onValueChange={(v) => set('categoryId', v)}>
              <SelectTrigger id="budget-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: c.color ?? '#6b7280' }}
                      />
                      {c.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Spinner className="mr-2 size-4" /> : null}
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
