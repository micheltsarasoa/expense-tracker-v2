'use client';

import { useState, useEffect } from 'react';
import type {
  CategoryOptionDTO,
  LabelOptionDTO,
  PaymentMethodOptionDTO,
  TransactionListItemDTO,
} from '@expense-tracker/types';
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
import { DatePicker } from '@/components/date-picker';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { TransactionTypeTabs, type TransactionType } from './transaction-type-tab';
import { cn } from '@/lib/utils';

const borderByType: Record<TransactionType, string> = {
  income: 'border-emerald-500',
  expense: 'border-rose-500',
  transfer: 'border-violet-500',
};

/** Normalized values the modal emits; cleared fields are null. */
export interface TransactionFormValues {
  type: TransactionType;
  amount: string;
  transactionDate: string;
  paymentMethodId: string;
  toPaymentMethodId: string | null;
  categoryId: string | null;
  labelId: string | null;
  description: string | null;
}

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: TransactionListItemDTO | null;
  categories: CategoryOptionDTO[];
  labels: LabelOptionDTO[];
  paymentMethods: PaymentMethodOptionDTO[];
  onSubmit: (values: TransactionFormValues) => Promise<boolean>;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionModal({
  open,
  onOpenChange,
  transaction,
  categories,
  labels,
  paymentMethods,
  onSubmit,
}: TransactionModalProps) {
  const isEdit = !!transaction;

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayIso());
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [toPaymentMethodId, setToPaymentMethodId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [labelId, setLabelId] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setErrors({});
    setSubmitting(false);
    if (transaction) {
      setType(transaction.type);
      setAmount(transaction.amount);
      setDate(transaction.transactionDate);
      setPaymentMethodId(transaction.paymentMethodId);
      setToPaymentMethodId(transaction.toPaymentMethodId ?? '');
      setCategoryId(transaction.categoryId ?? '');
      setLabelId(transaction.labelId ?? '');
      setDescription(transaction.description ?? '');
    } else {
      setType('expense');
      setAmount('');
      setDate(todayIso());
      setPaymentMethodId('');
      setToPaymentMethodId('');
      setCategoryId('');
      setLabelId('');
      setDescription('');
    }
  }, [open, transaction]);

  function handleTypeChange(next: TransactionType) {
    setType(next);
    setErrors({});
    if (next !== 'transfer') setToPaymentMethodId('');
  }

  const categoryOptions =
    type === 'transfer' ? categories : categories.filter((c) => c.type === type);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      next.amount = 'Enter a valid positive amount.';
    if (!date) next.date = 'Date is required.';
    if (!paymentMethodId) next.paymentMethodId = 'Account is required.';
    if (type === 'transfer') {
      if (!toPaymentMethodId) next.toPaymentMethodId = 'Destination account is required.';
      else if (toPaymentMethodId === paymentMethodId)
        next.toPaymentMethodId = 'Destination must differ from source.';
    } else if (!categoryId) {
      next.categoryId = 'Category is required.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSubmitting(true);
    const ok = await onSubmit({
      type,
      amount,
      transactionDate: date,
      paymentMethodId,
      toPaymentMethodId: type === 'transfer' ? toPaymentMethodId : null,
      categoryId: categoryId || null,
      labelId: labelId || null,
      description: description.trim() || null,
    });
    setSubmitting(false);
    if (ok) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-lg border-2 border-dashed', borderByType[type])}>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Transaction' : 'New Transaction'}</DialogTitle>
          <DialogDescription className="sr-only">
            {isEdit
              ? 'Edit the transaction details.'
              : 'Record a new income, expense, or transfer.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          <TransactionTypeTabs value={type} onChange={handleTypeChange} />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tx-amount">Amount</Label>
              <Input
                id="tx-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={errors.amount ? 'border-destructive' : ''}
              />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tx-date">Date</Label>
              <DatePicker
                id="tx-date"
                value={date}
                onChange={setDate}
                className={errors.date ? 'border-destructive' : ''}
              />
              {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>{type === 'transfer' ? 'From account' : 'Account'}</Label>
              <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
                <SelectTrigger className={errors.paymentMethodId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((pm) => (
                    <SelectItem key={pm.id} value={pm.id}>
                      {pm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.paymentMethodId && (
                <p className="text-xs text-destructive">{errors.paymentMethodId}</p>
              )}
            </div>

            {type === 'transfer' && (
              <div className="flex flex-col gap-1.5">
                <Label>To account</Label>
                <Select value={toPaymentMethodId} onValueChange={setToPaymentMethodId}>
                  <SelectTrigger className={errors.toPaymentMethodId ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select destination account" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods
                      .filter((pm) => pm.id !== paymentMethodId)
                      .map((pm) => (
                        <SelectItem key={pm.id} value={pm.id}>
                          {pm.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.toPaymentMethodId && (
                  <p className="text-xs text-destructive">{errors.toPaymentMethodId}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>
              Category
              {type === 'transfer' && (
                <span className="font-normal text-muted-foreground"> (optional)</span>
              )}
            </Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className={errors.categoryId ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((c) => (
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

          <div className="flex flex-col gap-1.5">
            <Label>
              Label <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Select value={labelId} onValueChange={setLabelId}>
              <SelectTrigger>
                <SelectValue placeholder="Select label" />
              </SelectTrigger>
              <SelectContent>
                {labels.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tx-description">
              Description <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="tx-description"
              placeholder="Add a note..."
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={submitting}>
            {submitting && <Spinner className="mr-2 size-4" />}
            {submitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
