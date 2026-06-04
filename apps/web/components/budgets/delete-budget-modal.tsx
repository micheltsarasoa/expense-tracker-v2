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
import type { BudgetWithSpendingDTO } from '@expense-tracker/types';

interface DeleteBudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: BudgetWithSpendingDTO | null;
  onConfirm: () => Promise<boolean>;
}

export function DeleteBudgetModal({
  open,
  onOpenChange,
  budget,
  onConfirm,
}: DeleteBudgetModalProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const ok = await onConfirm();
    setDeleting(false);
    if (ok) onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &ldquo;{budget?.name}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove the budget. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting && <Spinner className="mr-2 size-4" />}
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
