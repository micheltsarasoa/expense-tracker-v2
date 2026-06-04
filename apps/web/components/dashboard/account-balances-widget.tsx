'use client';

import { Banknote, Building2, CreditCard, Wallet, CircleDollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useFormat } from '@/lib/settings-context';
import type { AccountType } from '@/components/accounts/balance-card';

const typeConfig: Record<AccountType, { label: string; icon: React.ElementType }> = {
  cash: { label: 'Cash', icon: Banknote },
  bank_account: { label: 'Bank account', icon: Building2 },
  credit_card: { label: 'Credit card', icon: CreditCard },
  debit_card: { label: 'Debit card', icon: CreditCard },
  digital_wallet: { label: 'Digital wallet', icon: Wallet },
  other: { label: 'Other', icon: CircleDollarSign },
};

export interface AccountBalanceItem {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  color?: string;
}

interface AccountBalancesWidgetProps {
  accounts: AccountBalanceItem[];
  loading?: boolean;
}

function balanceClass(n: number) {
  if (n > 0) return 'text-emerald-600 dark:text-emerald-400';
  if (n < 0) return 'text-rose-600 dark:text-rose-400';
  return 'text-muted-foreground';
}

export function AccountBalancesWidget({ accounts, loading }: AccountBalancesWidgetProps) {
  const { money } = useFormat();
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Account Balances</CardTitle>
        <span className={cn('text-base font-bold tabular-nums', balanceClass(totalBalance))}>
          {money(totalBalance)}
        </span>
      </CardHeader>
      <CardContent>
        <ul className="space-y-0 divide-y divide-border">
          {accounts.map((account) => {
            const config = typeConfig[account.type];
            const Icon = config.icon;
            return (
              <li key={account.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted"
                  style={
                    account.color
                      ? { backgroundColor: account.color + '22', color: account.color }
                      : undefined
                  }
                >
                  <Icon className="size-4" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-medium truncate">{account.name}</span>
                  <span className="text-xs text-muted-foreground">{config.label}</span>
                </div>
                <span
                  className={cn(
                    'text-sm font-semibold tabular-nums shrink-0',
                    balanceClass(account.balance),
                  )}
                >
                  {money(account.balance)}
                </span>
              </li>
            );
          })}
        </ul>

        {accounts.length > 0 && (
          <>
            <Separator className="my-3" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total</span>
              <span className={cn('text-sm font-bold tabular-nums', balanceClass(totalBalance))}>
                {money(totalBalance)}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
