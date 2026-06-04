'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Plus, ArrowLeftRight, Upload } from 'lucide-react';
import { toast } from 'sonner';
import type {
  TransactionListItemDTO,
  CategoryOptionDTO,
  LabelOptionDTO,
  PaymentMethodOptionDTO,
} from '@expense-tracker/types';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty';
import { TransactionsTable } from '@/components/transactions/transactions-table';
import {
  TransactionModal,
  type TransactionFormValues,
} from '@/components/transactions/transaction-modal';
import { DeleteTransactionModal } from '@/components/transactions/delete-transaction-modal';
import { ImportTransactionsModal } from '@/components/transactions/import-transactions-modal';
import {
  TransactionsFilterBar,
  defaultFilterValues,
  type TransactionFilterValues,
} from '@/components/transactions/transactions-filter-bar';
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  toggleTransactionValidated,
} from './actions';

interface TransactionsClientProps {
  transactions: TransactionListItemDTO[];
  total: number;
  page: number;
  pageSize: number;
  filters: TransactionFilterValues;
  categories: CategoryOptionDTO[];
  labels: LabelOptionDTO[];
  paymentMethods: PaymentMethodOptionDTO[];
}

export function TransactionsClient({
  transactions,
  total,
  page,
  pageSize,
  filters,
  categories,
  labels,
  paymentMethods,
}: TransactionsClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TransactionListItemDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TransactionListItemDTO | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasActiveFilters =
    filters.type !== 'all' ||
    filters.categoryId !== 'all' ||
    filters.labelId !== 'all' ||
    filters.paymentMethodId !== 'all' ||
    filters.from !== '' ||
    filters.to !== '' ||
    filters.isValidated !== 'all';

  function navigate(next: TransactionFilterValues, nextPage: number) {
    const params = new URLSearchParams();
    if (next.type !== 'all') params.set('type', next.type);
    if (next.categoryId !== 'all') params.set('categoryId', next.categoryId);
    if (next.labelId !== 'all') params.set('labelId', next.labelId);
    if (next.paymentMethodId !== 'all') params.set('paymentMethodId', next.paymentMethodId);
    if (next.from) params.set('from', next.from);
    if (next.to) params.set('to', next.to);
    if (next.isValidated !== 'all') params.set('isValidated', next.isValidated);
    if (nextPage > 1) params.set('page', String(nextPage));
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  async function handleCreate(values: TransactionFormValues): Promise<boolean> {
    const base = {
      type: values.type,
      amount: values.amount,
      transactionDate: values.transactionDate,
      paymentMethodId: values.paymentMethodId,
      ...(values.labelId ? { labelId: values.labelId } : {}),
      ...(values.description ? { description: values.description } : {}),
    };
    const input =
      values.type === 'transfer'
        ? { ...base, toPaymentMethodId: values.toPaymentMethodId }
        : { ...base, categoryId: values.categoryId };
    const res = await createTransaction(input);
    if (res.ok) toast.success('Transaction saved');
    else toast.error(res.error ?? 'Failed to save transaction. Please try again.');
    return res.ok;
  }

  async function handleEdit(values: TransactionFormValues): Promise<boolean> {
    if (!editTarget) return false;
    const res = await updateTransaction(editTarget.id, {
      type: values.type,
      amount: values.amount,
      transactionDate: values.transactionDate,
      paymentMethodId: values.paymentMethodId,
      toPaymentMethodId: values.toPaymentMethodId,
      categoryId: values.categoryId,
      labelId: values.labelId,
      description: values.description,
    });
    if (res.ok) toast.success('Transaction updated');
    else toast.error(res.error ?? 'Failed to save transaction. Please try again.');
    return res.ok;
  }

  async function handleDelete(): Promise<boolean> {
    if (!deleteTarget) return false;
    const res = await deleteTransaction(deleteTarget.id);
    if (res.ok) toast.success('Transaction deleted');
    else toast.error(res.error ?? 'Failed to delete transaction. Please try again.');
    return res.ok;
  }

  async function handleToggleValidated(id: string) {
    const res = await toggleTransactionValidated(id);
    if (!res.ok) toast.error(res.error ?? 'Failed to update validation.');
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Transactions</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {total} transaction{total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => setImportOpen(true)}
          >
            <Upload className="size-4" />
            Import
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Add transaction
          </Button>
        </div>
      </div>

      <TransactionsFilterBar
        value={filters}
        categories={categories}
        labels={labels}
        paymentMethods={paymentMethods}
        onChange={(next) => navigate(next, 1)}
      />

      {transactions.length === 0 ? (
        <Empty className="py-20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ArrowLeftRight className="size-8" />
            </EmptyMedia>
            <EmptyTitle>
              {hasActiveFilters ? 'No transactions match your filters' : 'No transactions yet'}
            </EmptyTitle>
            <EmptyDescription>
              {hasActiveFilters
                ? 'Try adjusting or resetting your active filters.'
                : 'Add your first transaction to start tracking your finances.'}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {hasActiveFilters ? (
              <Button variant="ghost" size="sm" onClick={() => navigate(defaultFilterValues, 1)}>
                Reset filters
              </Button>
            ) : (
              <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
                <Plus className="size-4" />
                Add transaction
              </Button>
            )}
          </EmptyContent>
        </Empty>
      ) : (
        <TransactionsTable
          transactions={transactions}
          onEdit={(tx) => setEditTarget(tx)}
          onDelete={(tx) => setDeleteTarget(tx)}
          onToggleValidated={handleToggleValidated}
        />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages}
          </span>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) navigate(filters, page - 1);
                  }}
                  aria-disabled={page === 1}
                  className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) navigate(filters, page + 1);
                  }}
                  aria-disabled={page === totalPages}
                  className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <TransactionModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        categories={categories}
        labels={labels}
        paymentMethods={paymentMethods}
        onSubmit={handleCreate}
      />
      <TransactionModal
        key={editTarget?.id ?? 'edit'}
        open={!!editTarget}
        onOpenChange={(v) => {
          if (!v) setEditTarget(null);
        }}
        transaction={editTarget}
        categories={categories}
        labels={labels}
        paymentMethods={paymentMethods}
        onSubmit={handleEdit}
      />
      <DeleteTransactionModal
        open={!!deleteTarget}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null);
        }}
        transaction={deleteTarget}
        onDelete={handleDelete}
      />
      <ImportTransactionsModal
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={() => router.refresh()}
      />
    </div>
  );
}
