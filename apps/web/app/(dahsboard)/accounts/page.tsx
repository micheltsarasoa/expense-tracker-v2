'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BalanceCard, type Account } from '@/components/accounts/balance-card';
import { AccountModal } from '@/components/accounts/account-modal';
import { DeactivateAccountModal } from '@/components/accounts/deactivate-account-modal';
import { cn } from '@/lib/utils';

// ---------- seed data ----------
const SEED_ACCOUNTS: Account[] = [
  {
    id: '1',
    name: 'Main Checking',
    type: 'bank_account',
    balance: 2450.0,
    initialBalance: 1000.0,
    color: '#3b82f6',
    hasTransactions: true,
  },
  {
    id: '2',
    name: 'Visa Credit Card',
    type: 'credit_card',
    balance: -384.5,
    initialBalance: 0,
    color: '#ef4444',
    hasTransactions: true,
  },
  {
    id: '3',
    name: 'Cash Wallet',
    type: 'cash',
    balance: 85.0,
    initialBalance: 100.0,
    color: '#10b981',
    hasTransactions: false,
  },
  {
    id: '4',
    name: 'PayPal',
    type: 'digital_wallet',
    balance: 230.0,
    initialBalance: 0,
    color: '#6366f1',
    hasTransactions: true,
  },
  {
    id: '5',
    name: 'Old Savings',
    type: 'bank_account',
    balance: 0,
    initialBalance: 500.0,
    isInactive: true,
    hasTransactions: true,
  },
];

// ---------- component ----------
export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>(SEED_ACCOUNTS);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<Account | null>(null);

  const activeAccounts = accounts.filter((a) => !a.isInactive);
  const inactiveAccounts = accounts.filter((a) => a.isInactive);

  const totalBalance = activeAccounts.reduce((s, a) => s + a.balance, 0);
  const totalBalanceClass =
    totalBalance > 0
      ? 'text-emerald-600 dark:text-emerald-400'
      : totalBalance < 0
        ? 'text-rose-600 dark:text-rose-400'
        : 'text-muted-foreground';

  function handleSave(data: Partial<Account>) {
    if (editingAccount) {
      setAccounts((prev) => prev.map((a) => (a.id === editingAccount.id ? { ...a, ...data } : a)));
    } else {
      setAccounts((prev) => [...prev, { id: String(Date.now()), ...data } as Account]);
    }
  }

  function handleConfirmDeactivateOrDelete() {
    if (!deactivateTarget) return;
    if (deactivateTarget.hasTransactions) {
      setAccounts((prev) =>
        prev.map((a) => (a.id === deactivateTarget.id ? { ...a, isInactive: true } : a)),
      );
    } else {
      setAccounts((prev) => prev.filter((a) => a.id !== deactivateTarget.id));
    }
    setDeactivateOpen(false);
    setDeactivateTarget(null);
  }

  const isEmpty = accounts.length === 0;

  return (
    <div className="flex flex-col min-h-full">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-border">
        <h1 className="text-2xl font-semibold">Accounts</h1>
        <Button
          onClick={() => {
            setEditingAccount(null);
            setModalOpen(true);
          }}
        >
          <Plus className="size-4 mr-1.5" />
          Add account
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6">
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
            <Button
              onClick={() => {
                setEditingAccount(null);
                setModalOpen(true);
              }}
            >
              <Plus className="size-4 mr-1.5" />
              Add account
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-8 max-w-2xl">
            {/* Active accounts */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Active accounts
                </h2>
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="text-muted-foreground">Total balance:</span>
                  <span className={cn('font-semibold tabular-nums', totalBalanceClass)}>
                    €{totalBalance.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {activeAccounts.map((account) => (
                  <BalanceCard
                    key={account.id}
                    account={account}
                    onEdit={(acc) => {
                      setEditingAccount(acc);
                      setModalOpen(true);
                    }}
                    onDeactivateOrDelete={(acc) => {
                      setDeactivateTarget(acc);
                      setDeactivateOpen(true);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Inactive accounts */}
            {inactiveAccounts.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Inactive accounts
                </h2>
                <div className="flex flex-col gap-2">
                  {inactiveAccounts.map((account) => (
                    <BalanceCard
                      key={account.id}
                      account={account}
                      onEdit={(acc) => {
                        setEditingAccount(acc);
                        setModalOpen(true);
                      }}
                      onDeactivateOrDelete={(acc) => {
                        setDeactivateTarget(acc);
                        setDeactivateOpen(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AccountModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        account={editingAccount}
        onSave={handleSave}
      />
      <DeactivateAccountModal
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        account={deactivateTarget}
        onConfirm={handleConfirmDeactivateOrDelete}
      />
    </div>
  );
}
