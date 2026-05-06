'use client';

import { useState, useMemo } from 'react';
import { Plus, ChevronDown, ChevronRight, X, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { BudgetCard, type Budget } from '@/components/budgets/budget-card';
import { BudgetModal } from '@/components/budgets/budget-modal';
import { DuplicateBudgetModal } from '@/components/budgets/duplicate-budget-modal';
import { DeleteBudgetModal } from '@/components/budgets/delete-budget-modal';

// ---------- seed data ----------
const SEED_BUDGETS: Budget[] = [
  {
    id: '1',
    name: 'Monthly Groceries',
    amount: 500,
    spent: 320,
    startDate: '1 Apr 2026',
    endDate: '30 Apr 2026',
    category: 'Food & Dining',
    categoryColor: '#10b981',
  },
  {
    id: '2',
    name: 'Transport',
    amount: 200,
    spent: 185,
    startDate: '1 Apr 2026',
    endDate: '30 Apr 2026',
    category: 'Transport',
    categoryColor: '#3b82f6',
  },
  {
    id: '3',
    name: 'Rent & Utilities',
    amount: 1200,
    spent: 1200,
    startDate: '1 Apr 2026',
    endDate: '30 Apr 2026',
    category: 'Housing',
    categoryColor: '#8b5cf6',
  },
  {
    id: '4',
    name: 'Entertainment',
    amount: 150,
    spent: 210,
    startDate: '1 Apr 2026',
    endDate: '30 Apr 2026',
    category: 'Entertainment',
    categoryColor: '#f59e0b',
  },
  {
    id: '5',
    name: 'Health & Fitness',
    amount: 100,
    spent: 45,
    startDate: '1 Mar 2026',
    endDate: '31 Mar 2026',
    category: 'Health',
    categoryColor: '#ef4444',
    isExpired: true,
  },
  {
    id: '6',
    name: 'Salary savings goal',
    amount: 800,
    spent: 250,
    startDate: '1 Apr 2026',
    categoryColor: '#10b981',
    endDate: '30 Apr 2026',
  },
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  {
    value: 'income',
    label: 'Income',
    icon: TrendingUp,
    activeClass:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
  },
  {
    value: 'expense',
    label: 'Expense',
    icon: TrendingDown,
    activeClass:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800',
  },
];

// ---------- component ----------
export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>(SEED_BUDGETS);
  const [periodFilter, setPeriodFilter] = useState('current-month');
  const [typeFilter, setTypeFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const [dupOpen, setDupOpen] = useState(false);
  const [dupTarget, setDupTarget] = useState<Budget | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Budget | null>(null);

  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Filters active check
  const filtersActive = periodFilter !== 'current-month' || typeFilter !== 'all';

  // Group by category
  const groups = useMemo(() => {
    const active = budgets.filter((b) => !b.isExpired);
    const expired = budgets.filter((b) => b.isExpired);
    const all = [...active, ...expired];

    const map = new Map<string, { color?: string; budgets: Budget[] }>();
    for (const b of all) {
      const key = b.category ?? '__none__';
      const group = map.get(key) ?? { color: b.categoryColor, budgets: [] };
      group.budgets.push(b);
      map.set(key, group);
    }

    // Sort: named groups first, "No category" last
    const entries = Array.from(map.entries()).sort(([a], [b]) => {
      if (a === '__none__') return 1;
      if (b === '__none__') return -1;
      return a.localeCompare(b);
    });

    return entries.map(([key, val]) => ({
      key,
      label: key === '__none__' ? 'No category' : key,
      color: val.color,
      budgets: val.budgets,
    }));
  }, [budgets]);

  // Summary footer totals
  const activeBudgets = budgets.filter((b) => !b.isExpired);
  const totalBudgeted = activeBudgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = activeBudgets.reduce((s, b) => s + b.spent, 0);
  const totalRemaining = totalBudgeted - totalSpent;
  const anyOver = activeBudgets.some((b) => b.spent >= b.amount);

  function toggleGroup(key: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleSave(data: Partial<Budget>) {
    if (editingBudget) {
      setBudgets((prev) => prev.map((b) => (b.id === editingBudget.id ? { ...b, ...data } : b)));
    } else {
      setBudgets((prev) => [...prev, { id: String(Date.now()), ...data } as Budget]);
    }
  }

  function handleDuplicate(startDate: string, endDate: string) {
    if (!dupTarget) return;
    const from = new Date(startDate);
    const to = endDate ? new Date(endDate) : null;
    setBudgets((prev) => [
      ...prev,
      {
        ...dupTarget,
        id: String(Date.now()),
        spent: 0,
        startDate: from.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        endDate: to
          ? to.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : 'No end date',
        isExpired: false,
      },
    ]);
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    setBudgets((prev) => prev.filter((b) => b.id !== deleteTarget.id));
    setDeleteOpen(false);
    setDeleteTarget(null);
  }

  function resetFilters() {
    setPeriodFilter('current-month');
    setTypeFilter('all');
  }

  const isEmpty = budgets.length === 0;

  return (
    <div className="flex flex-col min-h-full pb-32">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-border">
        <h1 className="text-2xl font-semibold">Budgets</h1>
        <Button
          onClick={() => {
            setEditingBudget(null);
            setModalOpen(true);
          }}
        >
          <Plus className="size-4 mr-1.5" />
          Add budget
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-border bg-muted/20">
        {/* Period */}
        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="h-8 w-44 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current-month">Current month</SelectItem>
            <SelectItem value="last-month">Last month</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>

        {/* Type segmented */}
        <div className="flex gap-1.5">
          {TYPE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = typeFilter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTypeFilter(opt.value)}
                className={cn(
                  'flex items-center gap-1 rounded-md border px-2.5 py-1 text-sm font-medium transition-colors',
                  isActive
                    ? opt.value === 'all'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : opt.activeClass
                    : 'border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
              >
                {Icon && <Icon className="size-3" />}
                {opt.label}
              </button>
            );
          })}
        </div>

        {filtersActive && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-muted-foreground"
            onClick={resetFilters}
          >
            <X className="size-3.5" />
            Reset filters
          </Button>
        )}
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
            <Button
              onClick={() => {
                setEditingBudget(null);
                setModalOpen(true);
              }}
            >
              <Plus className="size-4 mr-1.5" />
              Add budget
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {groups.map((group) => {
              const isCollapsed = collapsedGroups.has(group.key);
              const groupSpent = group.budgets
                .filter((b) => !b.isExpired)
                .reduce((s, b) => s + b.spent, 0);
              const groupTotal = group.budgets
                .filter((b) => !b.isExpired)
                .reduce((s, b) => s + b.amount, 0);

              const activeInGroup = group.budgets.filter((b) => !b.isExpired);
              const expiredInGroup = group.budgets.filter((b) => b.isExpired);

              return (
                <div key={group.key} className="flex flex-col gap-3">
                  {/* Group header */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.key)}
                    className="flex items-center gap-2 text-left w-full group/header"
                  >
                    {group.color && (
                      <span
                        className="size-3 rounded-full shrink-0"
                        style={{ backgroundColor: group.color }}
                      />
                    )}
                    <span className="text-base font-semibold">{group.label}</span>
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
                    <>
                      {/* Active cards */}
                      {activeInGroup.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {activeInGroup.map((b) => (
                            <BudgetCard
                              key={b.id}
                              budget={b}
                              onEdit={(budget) => {
                                setEditingBudget(budget);
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

                      {/* Expired sub-section */}
                      {expiredInGroup.length > 0 && (
                        <div className="flex flex-col gap-3">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Past budgets
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {expiredInGroup.map((b) => (
                              <BudgetCard
                                key={b.id}
                                budget={b}
                                onEdit={(budget) => {
                                  setEditingBudget(budget);
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
                        </div>
                      )}
                    </>
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
            <span className="text-xs text-muted-foreground hidden sm:block">April 2026</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <BudgetModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        budget={editingBudget}
        onSave={handleSave}
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
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
