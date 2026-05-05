'use client';

import {
  Banknote,
  Building2,
  CreditCard,
  Wallet,
  CircleDollarSign,
  MoreHorizontal,
  Pencil,
  PowerOff,
  Trash2,
  EyeOff,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export type AccountType =
  | 'cash'
  | 'bank_account'
  | 'credit_card'
  | 'debit_card'
  | 'digital_wallet'
  | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  initialBalance: number;
  color?: string;
  isInactive?: boolean;
  hasTransactions?: boolean;
}

interface BalanceCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDeactivateOrDelete: (account: Account) => void;
}

const typeConfig: Record<AccountType, { label: string; icon: React.ElementType }> = {
  cash: { label: 'Cash', icon: Banknote },
  bank_account: { label: 'Bank account', icon: Building2 },
  credit_card: { label: 'Credit card', icon: CreditCard },
  debit_card: { label: 'Debit card', icon: CreditCard },
  digital_wallet: { label: 'Digital wallet', icon: Wallet },
  other: { label: 'Other', icon: CircleDollarSign },
};

export function BalanceCard({ account, onEdit, onDeactivateOrDelete }: BalanceCardProps) {
  const config = typeConfig[account.type];
  const Icon = config.icon;

  const balanceClass =
    account.balance > 0
      ? 'text-emerald-600 dark:text-emerald-400'
      : account.balance < 0
        ? 'text-rose-600 dark:text-rose-400'
        : 'text-muted-foreground';

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-lg border bg-card px-5 py-4 shadow-sm transition-opacity',
        account.isInactive && 'opacity-50',
      )}
    >
      {/* Icon */}
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted"
        style={
          account.color
            ? { backgroundColor: account.color + '22', color: account.color }
            : undefined
        }
      >
        <Icon className="size-5" />
      </div>

      {/* Name & type */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2">
          <span className="text-base font-medium truncate">{account.name}</span>
          {account.isInactive && (
            <Badge
              variant="outline"
              className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground"
            >
              <EyeOff className="size-3" />
              Inactive
            </Badge>
          )}
        </div>
        <span className="text-sm text-muted-foreground">{config.label}</span>
      </div>

      {/* Balance */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className={cn('text-lg font-bold tabular-nums', balanceClass)}>
          €{account.balance.toFixed(2)}
        </span>
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8 shrink-0">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Account actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => onEdit(account)}>
            <Pencil className="size-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className={
              account.hasTransactions
                ? 'text-muted-foreground'
                : 'text-destructive focus:text-destructive'
            }
            onClick={() => onDeactivateOrDelete(account)}
          >
            {account.hasTransactions ? (
              <>
                <PowerOff className="size-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <Trash2 className="size-4 mr-2" />
                Delete
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
