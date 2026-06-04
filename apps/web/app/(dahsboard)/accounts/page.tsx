import type { Account } from '@/components/accounts/balance-card';
import { getUserId } from '@/lib/auth';
import { paymentMethodService } from '@/services/instances';
import { AccountsClient } from './accounts-client';

export default async function AccountsPage() {
  const userId = await getUserId();
  const rows = await paymentMethodService.list(userId, true); // include inactive

  const accounts: Account[] = rows.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    balance: parseFloat(p.currentBalance),
    initialBalance: parseFloat(p.initialBalance),
    isInactive: !p.isActive,
    ...(p.color ? { color: p.color } : {}),
  }));

  return <AccountsClient accounts={accounts} />;
}
