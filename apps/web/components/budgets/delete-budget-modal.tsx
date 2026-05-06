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
import type { Budget } from './budget-card';

interface DeleteBudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: Budget | null;
  onConfirm: () => void;
}

export function DeleteBudgetModal({
  open,
  onOpenChange,
  budget,
  onConfirm,
}: DeleteBudgetModalProps) {
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
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
