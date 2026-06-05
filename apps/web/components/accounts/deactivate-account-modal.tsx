'use client';

import type { Account } from './balance-card';
import { ConfirmDialog } from '@/components/confirm-dialog';

interface DeactivateAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
  onConfirm: () => Promise<boolean>;
}

export function DeactivateAccountModal({
  open,
  onOpenChange,
  account,
  onConfirm,
}: DeactivateAccountModalProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={<>Remove &ldquo;{account?.name}&rdquo;?</>}
      description="If this account has transactions it will be deactivated and hidden from new transactions. Otherwise it will be permanently deleted."
      confirmLabel="Remove"
      busyLabel="Removing…"
      destructive
      onConfirm={onConfirm}
    />
  );
}
