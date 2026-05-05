'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Account } from './balance-card';

interface DeactivateAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
  onConfirm: () => void;
}

export function DeactivateAccountModal({
  open,
  onOpenChange,
  account,
  onConfirm,
}: DeactivateAccountModalProps) {
  const hasTransactions = account?.hasTransactions ?? false;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {hasTransactions ? `Deactivate "${account?.name}"?` : `Delete "${account?.name}"?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {hasTransactions
              ? 'This account has transactions and cannot be deleted. It will be marked as inactive and hidden from new transactions.'
              : 'This will permanently delete the account. This action cannot be undone.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={
              hasTransactions
                ? ''
                : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
            }
            onClick={onConfirm}
          >
            {hasTransactions ? 'Deactivate' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
