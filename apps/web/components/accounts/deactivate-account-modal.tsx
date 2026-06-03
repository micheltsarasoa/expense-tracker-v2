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
import type { Account } from './balance-card';

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
  const [working, setWorking] = useState(false);

  async function handleConfirm() {
    setWorking(true);
    const ok = await onConfirm();
    setWorking(false);
    if (ok) onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove &ldquo;{account?.name}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            If this account has transactions it will be deactivated and hidden from new
            transactions. Otherwise it will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={working}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={handleConfirm} disabled={working}>
            {working && <Spinner className="mr-2 size-4" />}
            {working ? 'Removing…' : 'Remove'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
