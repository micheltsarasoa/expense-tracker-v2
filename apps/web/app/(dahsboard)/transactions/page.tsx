import { transactionFiltersSchema } from '@expense-tracker/types';
import type {
  CategoryOptionDTO,
  LabelOptionDTO,
  PaymentMethodOptionDTO,
} from '@expense-tracker/types';
import { getUserId } from '@/lib/auth';
import {
  transactionService,
  categoryService,
  labelService,
  paymentMethodService,
} from '@/services/instances';
import type { TransactionFilterValues } from '@/components/transactions/transactions-filter-bar';
import { TransactionsClient } from './transactions-client';

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const userId = await getUserId();
  const sp = await searchParams;

  const raw: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === 'string') raw[k] = v;
    else if (Array.isArray(v) && typeof v[0] === 'string') raw[k] = v[0];
  }
  // Fall back to defaults if the query string is malformed rather than erroring.
  const parsed = transactionFiltersSchema.safeParse(raw);
  const filters = parsed.success ? parsed.data : transactionFiltersSchema.parse({});

  const [list, categoryRows, labelRows, pmRows] = await Promise.all([
    transactionService.list(userId, filters),
    categoryService.list(userId),
    labelService.list(userId),
    paymentMethodService.list(userId),
  ]);

  const categories: CategoryOptionDTO[] = categoryRows.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    color: c.color,
  }));
  const labels: LabelOptionDTO[] = labelRows.map((l) => ({
    id: l.id,
    name: l.name,
    color: l.color,
  }));
  const paymentMethods: PaymentMethodOptionDTO[] = pmRows.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
  }));

  const filterValues: TransactionFilterValues = {
    type: filters.type ?? 'all',
    categoryId: filters.categoryId ?? 'all',
    labelId: filters.labelId ?? 'all',
    paymentMethodId: filters.paymentMethodId ?? 'all',
    from: filters.from ?? '',
    to: filters.to ?? '',
    isValidated: filters.isValidated === undefined ? 'all' : filters.isValidated ? 'true' : 'false',
  };

  return (
    <TransactionsClient
      transactions={list.data}
      total={list.total}
      page={filters.page}
      pageSize={filters.pageSize}
      filters={filterValues}
      categories={categories}
      labels={labels}
      paymentMethods={paymentMethods}
    />
  );
}
