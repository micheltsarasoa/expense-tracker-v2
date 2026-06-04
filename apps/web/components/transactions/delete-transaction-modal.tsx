'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { TransactionListItemDTO } from '@expense-tracker/types';
import { eur, formatDay } from '@/lib/format';

interface DeleteTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TransactionListItemDTO | null;
  onDelete: () => Promise<boolean>;
}

const sign = { income: '+', expense: '-', transfer: '' } as const;

export function DeleteTransactionModal({
  open,
  onOpenChange,
  transaction,
  onDelete,
}: DeleteTransactionModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    const ok = await onDelete();
    setIsDeleting(false);
    if (ok) onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="shadow-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex flex-col gap-1">
              <span>This action cannot be undone.</span>
              {transaction && (
                <span className="mt-1 text-sm font-medium text-foreground">
                  {sign[transaction.type]}
                  {eur(transaction.amount)} &middot; {formatDay(transaction.transactionDate)}
                </span>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting && <Spinner className="mr-2 size-4" />}
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
