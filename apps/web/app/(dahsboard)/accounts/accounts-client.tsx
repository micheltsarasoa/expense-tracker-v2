'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useFormat } from '@/lib/settings-context';
import { BalanceCard, type Account } from '@/components/accounts/balance-card';
import { AccountModal, type AccountFormValues } from '@/components/accounts/account-modal';
import { DeactivateAccountModal } from '@/components/accounts/deactivate-account-modal';
import { createAccount, updateAccount, removeAccount } from './actions';

interface AccountsClientProps {
  accounts: Account[];
}

export function AccountsClient({ accounts }: AccountsClientProps) {
  const { money } = useFormat();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Account | null>(null);

  const active = accounts.filter((a) => !a.isInactive);
  const inactive = accounts.filter((a) => a.isInactive);
  const totalBalance = active.reduce((s, a) => s + a.balance, 0);
  const totalBalanceClass =
    totalBalance > 0
      ? 'text-emerald-600 dark:text-emerald-400'
      : totalBalance < 0
        ? 'text-rose-600 dark:text-rose-400'
        : 'text-muted-foreground';
  const isEmpty = accounts.length === 0;

  async function handleSubmit(values: AccountFormValues): Promise<boolean> {
    const res = editing
      ? await updateAccount(editing.id, {
          name: values.name,
          ...(values.color ? { color: values.color } : {}),
        })
      : await createAccount({
          name: values.name,
          type: values.type,
          ...(values.initialBalance ? { initialBalance: values.initialBalance } : {}),
          ...(values.color ? { color: values.color } : {}),
        });
    if (res.ok) toast.success(editing ? 'Account updated' : 'Account created');
    else toast.error(res.error ?? 'Failed to save account. Please try again.');
    return res.ok;
  }

  async function handleRemove(): Promise<boolean> {
    if (!removeTarget) return false;
    const res = await removeAccount(removeTarget.id);
    if (res.ok)
      toast.success(res.data.action === 'deactivated' ? 'Account deactivated' : 'Account deleted');
    else toast.error(res.error ?? 'Failed to remove account. Please try again.');
    return res.ok;
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function renderCard(account: Account) {
    return (
      <BalanceCard
        key={account.id}
        account={account}
        onEdit={(acc) => {
          setEditing(acc);
          setModalOpen(true);
        }}
        onDeactivateOrDelete={(acc) => {
          setRemoveTarget(acc);
          setRemoveOpen(true);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex items-center justify-between gap-4 pb-5 border-b border-border">
        <h1 className="text-2xl font-semibold">Accounts</h1>
        <Button onClick={openCreate}>
          <Plus className="size-4 mr-1.5" />
          Add account
        </Button>
      </div>

      <div className="flex-1 py-6">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-muted">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                className="text-muted-foreground"
                aria-hidden="true"
              >
                <rect
                  x="4"
                  y="10"
                  width="32"
                  height="22"
                  rx="3"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path d="M4 16h32" stroke="currentColor" strokeWidth="2" />
                <rect x="8" y="22" width="8" height="4" rx="1" fill="currentColor" opacity="0.4" />
              </svg>
            </div>
            <div>
              <p className="text-base font-medium">No accounts yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add your first account to start tracking balances.
              </p>
            </div>
            <Button onClick={openCreate}>
              <Plus className="size-4 mr-1.5" />
              Add account
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-8 max-w-2xl">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Active accounts
                </h2>
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="text-muted-foreground">Total balance:</span>
                  <span className={cn('font-semibold tabular-nums', totalBalanceClass)}>
                    {money(totalBalance)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {active.length > 0 ? (
                  active.map(renderCard)
                ) : (
                  <p className="text-sm text-muted-foreground py-4">No active accounts.</p>
                )}
              </div>
            </div>

            {inactive.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Inactive accounts
                </h2>
                <div className="flex flex-col gap-2">{inactive.map(renderCard)}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <AccountModal
        key={editing?.id ?? 'new'}
        open={modalOpen}
        onOpenChange={setModalOpen}
        account={editing}
        onSubmit={handleSubmit}
      />
      <DeactivateAccountModal
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        account={removeTarget}
        onConfirm={handleRemove}
      />
    </div>
  );
}
