'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { useFormat } from '@/lib/settings-context';
import type { Account, AccountType } from './balance-card';

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_account', label: 'Bank account' },
  { value: 'credit_card', label: 'Credit card' },
  { value: 'debit_card', label: 'Debit card' },
  { value: 'digital_wallet', label: 'Digital wallet' },
  { value: 'other', label: 'Other' },
];

const PRESET_COLORS = [
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#ef4444',
  '#f59e0b',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
  '#f97316',
  '#6366f1',
  '#14b8a6',
  '#64748b',
];

export interface AccountFormValues {
  name: string;
  type: AccountType;
  initialBalance: string;
  color?: string;
}

interface AccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account | null;
  /** Returns true on success (modal then closes), false on failure. */
  onSubmit: (values: AccountFormValues) => Promise<boolean>;
}

interface FormState {
  name: string;
  type: AccountType;
  initialBalance: string;
  color: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  type: 'bank_account',
  initialBalance: '0',
  color: '',
};

export function AccountModal({ open, onOpenChange, account, onSubmit }: AccountModalProps) {
  const { money, settings } = useFormat();
  const isEdit = !!account;
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  useEffect(() => {
    if (open) {
      const nextForm = account
        ? {
            name: account.name,
            type: account.type,
            initialBalance: String(account.initialBalance),
            color: account.color ?? '',
          }
        : EMPTY_FORM;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(nextForm);
      setErrors({});
      setSaving(false);
    }
  }, [open, account]);

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const next: Partial<FormState> = {};
    if (!form.name.trim()) next.name = 'Name is required.';
    if (!isEdit && isNaN(Number(form.initialBalance)))
      next.initialBalance = 'Enter a valid number.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    const ok = await onSubmit({
      name: form.name.trim(),
      type: form.type,
      initialBalance: form.initialBalance,
      ...(form.color ? { color: form.color } : {}),
    });
    setSaving(false);
    if (ok) onOpenChange(false);
  }

  const isValid = form.name.trim() !== '' && (isEdit || !isNaN(Number(form.initialBalance)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Account' : 'New Account'}</DialogTitle>
          <DialogDescription className="sr-only">
            {isEdit ? 'Edit the account details.' : 'Add a new account or payment method.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="acc-name">Name</Label>
            <Input
              id="acc-name"
              placeholder="e.g. Main checking"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Type — read-only in edit mode */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="acc-type">Type</Label>
            {isEdit ? (
              <div className="flex h-9 items-center rounded-md border border-border bg-muted px-3 text-sm text-muted-foreground">
                {ACCOUNT_TYPES.find((t) => t.value === account?.type)?.label}
              </div>
            ) : (
              <Select value={form.type} onValueChange={(v) => set('type', v as AccountType)}>
                <SelectTrigger id="acc-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Initial balance — read-only in edit mode */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="acc-balance">Initial balance</Label>
            {isEdit ? (
              <>
                <div className="flex h-9 items-center rounded-md border border-border bg-muted px-3 text-sm text-muted-foreground">
                  {money(account?.initialBalance ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">Cannot be changed after saving.</p>
              </>
            ) : (
              <>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    {settings.currencySymbol}
                  </span>
                  <Input
                    id="acc-balance"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.initialBalance}
                    onChange={(e) => set('initialBalance', e.target.value)}
                    className="pl-7"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Cannot be changed after saving.</p>
                {errors.initialBalance && (
                  <p className="text-xs text-destructive">{errors.initialBalance}</p>
                )}
              </>
            )}
          </div>

          {/* Color picker */}
          <div className="flex flex-col gap-1.5">
            <Label>Color (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => set('color', form.color === color ? '' : color)}
                  className="size-7 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: color,
                    borderColor: form.color === color ? color : 'transparent',
                    outline: form.color === color ? `2px solid ${color}` : 'none',
                    outlineOffset: '2px',
                  }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
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
