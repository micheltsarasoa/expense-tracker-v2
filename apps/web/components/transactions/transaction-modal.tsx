'use client';

import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import {
  TransactionTypeTabs,
  type TransactionType,
} from '@/components/transactions/transaction-type-tab';
export interface Transaction {
  id: string;
  type: TransactionType;
  amount: string;
  date: string;
  accountFrom: string;
  accountTo?: string;
  category?: string;
  label?: string;
  description?: string;
}

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction | null;
  onSave: (data: Omit<Transaction, 'id'>) => Promise<void>;
}

const mockAccounts = ['Checking Account', 'Savings Account', 'Cash', 'Credit Card'];
const mockCategories = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Housing',
  'Entertainment',
  'Health',
  'Salary',
  'Freelance',
];
const mockLabels = ['Personal', 'Business', 'Recurring', 'One-time'];

export function TransactionModal({
  open,
  onOpenChange,
  transaction,
  onSave,
}: TransactionModalProps) {
  const isEdit = !!transaction;

  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'expense');
  const [amount, setAmount] = useState(transaction?.amount ?? '');
  const [date, setDate] = useState(
    transaction?.date ?? new Date().toISOString().split('T')[0] ?? '',
  );
  const [accountFrom, setAccountFrom] = useState(transaction?.accountFrom ?? '');
  const [accountTo, setAccountTo] = useState(transaction?.accountTo ?? '');
  const [category, setCategory] = useState(transaction?.category ?? '');
  const [label, setLabel] = useState(transaction?.label ?? '');
  const [description, setDescription] = useState(transaction?.description ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      newErrors.amount = 'Enter a valid positive amount';
    if (!date) newErrors.date = 'Date is required';
    if (!accountFrom) newErrors.accountFrom = 'Account is required';
    if (type === 'transfer' && !accountTo) newErrors.accountTo = 'Destination account is required';
    return newErrors;
  };

  const handleSave = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      await onSave({ type, amount, date, accountFrom, accountTo, category, label, description });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg shadow-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEdit ? 'Edit Transaction' : 'New Transaction'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* Type selector */}
          <TransactionTypeTabs value={type} onChange={handleTypeChange} />

          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount" className="text-sm font-medium">
                Amount
              </Label>
              <Input
                id="amount"
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

            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date" className="text-sm font-medium">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={errors.date ? 'border-destructive' : ''}
              />
              {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
            </div>
          </div>

          {/* Account From */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">
              {type === 'transfer' ? 'From Account' : 'Account'}
            </Label>
            <Select value={accountFrom} onValueChange={setAccountFrom}>
              <SelectTrigger className={errors.accountFrom ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {mockAccounts.map((acc) => (
                  <SelectItem key={acc} value={acc}>
                    {acc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.accountFrom && <p className="text-xs text-destructive">{errors.accountFrom}</p>}
          </div>

          {/* Account To — transfer only */}
          {type === 'transfer' && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">To Account</Label>
              <Select value={accountTo} onValueChange={setAccountTo}>
                <SelectTrigger className={errors.accountTo ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select destination account" />
                </SelectTrigger>
                <SelectContent>
                  {mockAccounts
                    .filter((a) => a !== accountFrom)
                    .map((acc) => (
                      <SelectItem key={acc} value={acc}>
                        {acc}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.accountTo && <p className="text-xs text-destructive">{errors.accountTo}</p>}
            </div>
          )}

          {/* Category — income / expense only */}
          {type !== 'transfer' && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">
                Category <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {mockCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Label */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">
              Label <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Select value={label} onValueChange={setLabel}>
              <SelectTrigger>
                <SelectValue placeholder="Select label" />
              </SelectTrigger>
              <SelectContent>
                {mockLabels.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Add a note..."
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting && <Spinner className="mr-2 size-4" />}
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
