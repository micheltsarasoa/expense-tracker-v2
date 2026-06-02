'use client';

import { useState, useMemo } from 'react';
import { Plus, Upload, ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';

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

import { TransactionModal, type Transaction } from '@/components/transactions/transaction-modal';
import { DeleteTransactionModal } from '@/components/transactions/delete-transaction-modal';
import {
  TransactionsFilterBar,
  defaultFilters,
  type TransactionFilters,
} from '@/components/transactions/transactions-filter-bar';
import { TransactionsTable } from '@/components/transactions/transactions-table';

// ─── Seed data ─────────────────────────────────────────────────────────────────
const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'expense',
    amount: '42.50',
    date: '2026-04-14',
    accountFrom: 'Checking Account',
    category: 'Food & Dining',
    label: 'Personal',
    description: 'Grocery store',
  },
  {
    id: '2',
    type: 'income',
    amount: '3200.00',
    date: '2026-04-13',
    accountFrom: 'Checking Account',
    category: 'Salary',
    label: 'Recurring',
    description: 'Monthly salary',
  },
  {
    id: '3',
    type: 'expense',
    amount: '19.99',
    date: '2026-04-12',
    accountFrom: 'Credit Card',
    category: 'Entertainment',
    description: 'Netflix subscription',
  },
  {
    id: '4',
    type: 'transfer',
    amount: '500.00',
    date: '2026-04-11',
    accountFrom: 'Checking Account',
    accountTo: 'Savings Account',
    label: 'Personal',
    description: 'Monthly savings',
  },
  {
    id: '5',
    type: 'expense',
    amount: '65.00',
    date: '2026-04-10',
    accountFrom: 'Credit Card',
    category: 'Transportation',
    description: 'Monthly transit pass',
  },
  {
    id: '6',
    type: 'expense',
    amount: '120.80',
    date: '2026-04-09',
    accountFrom: 'Checking Account',
    category: 'Shopping',
    label: 'Personal',
    description: 'New shoes',
  },
  {
    id: '7',
    type: 'income',
    amount: '850.00',
    date: '2026-04-08',
    accountFrom: 'Checking Account',
    category: 'Freelance',
    label: 'Business',
    description: 'Design project',
  },
  {
    id: '8',
    type: 'expense',
    amount: '32.10',
    date: '2026-04-07',
    accountFrom: 'Cash',
    category: 'Food & Dining',
    description: 'Restaurant lunch',
  },
  {
    id: '9',
    type: 'expense',
    amount: '1250.00',
    date: '2026-04-06',
    accountFrom: 'Checking Account',
    category: 'Housing',
    label: 'Recurring',
    description: 'Monthly rent',
  },
  {
    id: '10',
    type: 'expense',
    amount: '14.99',
    date: '2026-04-05',
    accountFrom: 'Credit Card',
    category: 'Entertainment',
    description: 'Spotify',
  },
  {
    id: '11',
    type: 'income',
    amount: '200.00',
    date: '2026-04-04',
    accountFrom: 'Checking Account',
    category: 'Freelance',
    description: 'Logo design',
  },
  {
    id: '12',
    type: 'expense',
    amount: '55.00',
    date: '2026-04-03',
    accountFrom: 'Checking Account',
    category: 'Health',
    label: 'Personal',
    description: 'Gym membership',
  },
];

const PAGE_SIZE = 20;

let idCounter = SEED_TRANSACTIONS.length + 1;
const generateId = () => String(idCounter++);

// ─── Page ───────────────────────────────────────────────────────────────────────
export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(SEED_TRANSACTIONS);
  const [validatedIds, setValidatedIds] = useState<Set<string>>(new Set(['1', '2']));
  const [filters, setFilters] = useState<TransactionFilters>(defaultFilters);
  const [page, setPage] = useState(1);

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  // ── Filtering ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (filters.type !== 'all' && tx.type !== filters.type) return false;
      if (filters.category !== 'all' && tx.category !== filters.category) return false;
      if (filters.label !== 'all' && tx.label !== filters.label) return false;
      if (filters.account !== 'all' && tx.accountFrom !== filters.account) return false;
      if (filters.dateFrom && tx.date < filters.dateFrom) return false;
      if (filters.dateTo && tx.date > filters.dateTo) return false;
      if (filters.validated === 'validated' && !validatedIds.has(tx.id)) return false;
      if (filters.validated === 'unvalidated' && validatedIds.has(tx.id)) return false;
      return true;
    });
  }, [transactions, filters, validatedIds]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasActiveFilters =
    filters.type !== 'all' ||
    filters.category !== 'all' ||
    filters.label !== 'all' ||
    filters.account !== 'all' ||
    filters.dateFrom !== '' ||
    filters.dateTo !== '' ||
    filters.validated !== 'all';

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleCreate = async (data: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { id: generateId(), ...data };
    setTransactions((prev) => [newTx, ...prev]);
    toast.success('Transaction saved');
  };

  const handleEdit = async (data: Omit<Transaction, 'id'>) => {
    if (!editTarget) return;
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === editTarget.id ? { ...tx, ...data } : tx)),
    );
    toast.success('Transaction updated');
    setEditTarget(null);
  };

  const handleDelete = async (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    toast.success('Transaction deleted');
    setDeleteTarget(null);
  };

  const handleToggleValidated = (id: string) => {
    setValidatedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.success('Marked as unvalidated');
      } else {
        next.add(id);
        toast.success('Marked as validated');
      }
      return next;
    });
  };

  const handleFiltersChange = (next: TransactionFilters) => {
    setFilters(next);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Transactions</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Upload className="size-4" />
            Import
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Add transaction
          </Button>
        </div>
      </div>

      {/* ── Filter bar ──────────────────────────────────────────────────────── */}
      <TransactionsFilterBar filters={filters} onChange={handleFiltersChange} />

      {/* ── Table / empty states ────────────────────────────────────────────── */}
      {transactions.length === 0 ? (
        <Empty className="py-20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ArrowLeftRight className="size-8" />
            </EmptyMedia>
            <EmptyTitle>No transactions yet</EmptyTitle>
            <EmptyDescription>
              Add your first transaction to start tracking your finances.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Add transaction
            </Button>
          </EmptyContent>
        </Empty>
      ) : paginated.length === 0 && hasActiveFilters ? (
        <Empty className="py-20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ArrowLeftRight className="size-8" />
            </EmptyMedia>
            <EmptyTitle>No transactions match your filters</EmptyTitle>
            <EmptyDescription>Try adjusting or resetting your active filters.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="ghost" size="sm" onClick={() => handleFiltersChange(defaultFilters)}>
              Reset filters
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <TransactionsTable
          transactions={paginated}
          onEdit={(tx) => setEditTarget(tx)}
          onDelete={(tx) => setDeleteTarget(tx)}
          onToggleValidated={handleToggleValidated}
          validatedIds={validatedIds}
        />
      )}

      {/* ── Pagination ──────────────────────────────────────────────────────── */}
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
                    setPage((p) => Math.max(1, p - 1));
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
                    setPage((p) => Math.min(totalPages, p + 1));
                  }}
                  aria-disabled={page === totalPages}
                  className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      <TransactionModal
        open={createOpen}
        onOpenChange={(v) => setCreateOpen(v)}
        onSave={handleCreate}
      />

      <TransactionModal
        key={editTarget?.id ?? 'edit'}
        open={!!editTarget}
        onOpenChange={(v) => {
          if (!v) setEditTarget(null);
        }}
        transaction={editTarget}
        onSave={handleEdit}
      />

      <DeleteTransactionModal
        open={!!deleteTarget}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null);
        }}
        transaction={deleteTarget}
        onDelete={handleDelete}
      />
    </div>
  );
}
