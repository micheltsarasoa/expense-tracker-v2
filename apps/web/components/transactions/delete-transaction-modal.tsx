'use client';

import type { TransactionListItemDTO } from '@expense-tracker/types';
import { useFormat } from '@/lib/settings-context';
import { ConfirmDialog } from '@/components/confirm-dialog';

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
  const { money, date } = useFormat();

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete this transaction?"
      description={
        <>
          <span>This action cannot be undone.</span>
          {transaction && (
            <span className="mt-1 text-sm font-medium text-foreground">
              {sign[transaction.type]}
              {money(transaction.amount)} &middot; {date(transaction.transactionDate)}
            </span>
          )}
        </>
      }
      confirmLabel="Delete"
      busyLabel="Deleting…"
      destructive
      onConfirm={onDelete}
    />
  );
}
