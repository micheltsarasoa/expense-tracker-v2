'use client';

import type { BudgetWithSpendingDTO } from '@expense-tracker/types';
import { ConfirmDialog } from '@/components/confirm-dialog';

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
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={<>Delete &ldquo;{budget?.name}&rdquo;?</>}
      description="This will permanently remove the budget. This action cannot be undone."
      confirmLabel="Delete"
      busyLabel="Deleting…"
      destructive
      onConfirm={onConfirm}
    />
  );
}
