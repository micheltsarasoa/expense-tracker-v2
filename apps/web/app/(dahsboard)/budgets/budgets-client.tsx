'use client';

import { useMemo, useState } from 'react';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import type { BudgetWithSpendingDTO, CategoryOptionDTO } from '@expense-tracker/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BudgetCard } from '@/components/budgets/budget-card';
import { BudgetModal, type BudgetFormValues } from '@/components/budgets/budget-modal';
import { DuplicateBudgetModal } from '@/components/budgets/duplicate-budget-modal';
import { DeleteBudgetModal } from '@/components/budgets/delete-budget-modal';
import { createBudget, updateBudget, deleteBudget, duplicateBudget } from './actions';

interface BudgetsClientProps {
  budgets: BudgetWithSpendingDTO[];
  categories: CategoryOptionDTO[];
}

const NONE_KEY = '__none__';

export function BudgetsClient({ budgets, categories }: BudgetsClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BudgetWithSpendingDTO | null>(null);

  const [dupOpen, setDupOpen] = useState(false);
  const [dupTarget, setDupTarget] = useState<BudgetWithSpendingDTO | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BudgetWithSpendingDTO | null>(null);

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const groups = useMemo(() => {
    const map = new Map<
      string,
      { name: string; color: string | null; items: BudgetWithSpendingDTO[] }
    >();
    for (const b of budgets) {
      const key = b.categoryId ?? NONE_KEY;
      const group = map.get(key) ?? {
        name: b.categoryName ?? 'No category',
        color: b.categoryColor,
        items: [],
      };
      group.items.push(b);
      map.set(key, group);
    }
    return Array.from(map.entries())
      .sort(([ka, a], [kb, b]) => {
        if (ka === NONE_KEY) return 1;
        if (kb === NONE_KEY) return -1;
        return a.name.localeCompare(b.name);
      })
      .map(([key, value]) => ({ key, ...value }));
  }, [budgets]);

  const totalBudgeted = budgets.reduce((s, b) => s + parseFloat(b.amount), 0);
  const totalSpent = budgets.reduce((s, b) => s + parseFloat(b.spent), 0);
  const totalRemaining = totalBudgeted - totalSpent;
  const anyOver = budgets.some((b) => b.pct >= 100);
  const isEmpty = budgets.length === 0;

  function toggleGroup(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleSubmit(values: BudgetFormValues): Promise<boolean> {
    const res = editing ? await updateBudget(editing.id, values) : await createBudget(values);
    if (res.ok) toast.success(editing ? 'Budget updated' : 'Budget created');
    else toast.error(res.error ?? 'Failed to save budget. Please try again.');
    return res.ok;
  }

  async function handleDuplicate(startDate: string, endDate: string): Promise<boolean> {
    if (!dupTarget) return false;
    const res = await duplicateBudget(dupTarget.id, {
      startDate,
      ...(endDate ? { endDate } : {}),
    });
    if (res.ok) toast.success('Budget duplicated');
    else toast.error(res.error ?? 'Failed to duplicate budget. Please try again.');
    return res.ok;
  }

  async function handleDelete(): Promise<boolean> {
    if (!deleteTarget) return false;
    const res = await deleteBudget(deleteTarget.id);
    if (res.ok) toast.success('Budget deleted');
    else toast.error(res.error ?? 'Failed to delete budget. Please try again.');
    return res.ok;
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  return (
    <div className="flex flex-col min-h-full pb-24">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-5 border-b border-border">
        <h1 className="text-2xl font-semibold">Budgets</h1>
        <Button onClick={openCreate}>
          <Plus className="size-4 mr-1.5" />
          Add budget
        </Button>
      </div>

      {/* Content */}
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
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
                <path
                  d="M13 20h14M20 13v14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <p className="text-base font-medium">No budgets yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first budget to start tracking your spending.
              </p>
            </div>
            <Button onClick={openCreate}>
              <Plus className="size-4 mr-1.5" />
              Add budget
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {groups.map((group) => {
              const isCollapsed = collapsed.has(group.key);
              const groupSpent = group.items.reduce((s, b) => s + parseFloat(b.spent), 0);
              const groupTotal = group.items.reduce((s, b) => s + parseFloat(b.amount), 0);
              return (
                <div key={group.key} className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.key)}
                    className="flex items-center gap-2 text-left w-full"
                  >
                    {group.color && (
                      <span
                        className="size-3 rounded-full shrink-0"
                        style={{ backgroundColor: group.color }}
                      />
                    )}
                    <span className="text-base font-semibold">{group.name}</span>
                    <span className="text-sm text-muted-foreground">
                      €{groupSpent.toFixed(2)} spent of €{groupTotal.toFixed(2)} budgeted
                    </span>
                    <span className="ml-auto text-muted-foreground">
                      {isCollapsed ? (
                        <ChevronRight className="size-4" />
                      ) : (
                        <ChevronDown className="size-4" />
                      )}
                    </span>
                  </button>

                  {!isCollapsed && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.items.map((b) => (
                        <BudgetCard
                          key={b.id}
                          budget={b}
                          onEdit={(budget) => {
                            setEditing(budget);
                            setModalOpen(true);
                          }}
                          onDuplicate={(budget) => {
                            setDupTarget(budget);
                            setDupOpen(true);
                          }}
                          onDelete={(budget) => {
                            setDeleteTarget(budget);
                            setDeleteOpen(true);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fixed summary footer */}
      {!isEmpty && (
        <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 shadow-md">
          <div className="flex items-center justify-between gap-6 px-6 py-3">
            <div className="flex items-center gap-8">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Total budgeted</span>
                <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                  €{totalBudgeted.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Total spent</span>
                <span
                  className={cn(
                    'text-sm font-semibold tabular-nums',
                    anyOver ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground',
                  )}
                >
                  €{totalSpent.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Remaining</span>
                <span
                  className={cn(
                    'text-sm font-semibold tabular-nums',
                    totalRemaining > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : totalRemaining < 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-muted-foreground',
                  )}
                >
                  €{Math.abs(totalRemaining).toFixed(2)}
                  {totalRemaining < 0 ? ' over' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <BudgetModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        budget={editing}
        categories={categories}
        onSubmit={handleSubmit}
      />
      <DuplicateBudgetModal
        open={dupOpen}
        onOpenChange={setDupOpen}
        budget={dupTarget}
        onDuplicate={handleDuplicate}
      />
      <DeleteBudgetModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        budget={deleteTarget}
        onConfirm={handleDelete}
      />
    </div>
  );
}
