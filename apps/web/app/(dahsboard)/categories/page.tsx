'use client';

import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryRow } from '@/components/categories/category-row';
import { CategoryModal, type Category } from '@/components/categories/category-modal';
import { DeleteCategoryModal } from '@/components/categories/delete-category-modal';

// ---------- seed data ----------
const SEED_CATEGORIES: Category[] = [
  // Income roots
  {
    id: 'inc-salary',
    name: 'Salary',
    type: 'income',
    color: '#10b981',
    isSystem: true,
    children: [],
  },
  {
    id: 'inc-freelance',
    name: 'Freelance',
    type: 'income',
    color: '#06b6d4',
    children: [
      {
        id: 'inc-freelance-web',
        name: 'Web development',
        type: 'income',
        color: '#06b6d4',
        parentId: 'inc-freelance',
      },
      {
        id: 'inc-freelance-design',
        name: 'Design',
        type: 'income',
        color: '#8b5cf6',
        parentId: 'inc-freelance',
      },
    ],
  },
  {
    id: 'inc-investments',
    name: 'Investments',
    type: 'income',
    color: '#84cc16',
    children: [
      {
        id: 'inc-inv-dividends',
        name: 'Dividends',
        type: 'income',
        color: '#84cc16',
        parentId: 'inc-investments',
      },
    ],
  },
  {
    id: 'inc-other',
    name: 'Other income',
    type: 'income',
    color: '#64748b',
    children: [],
  },
  // Expense roots
  {
    id: 'exp-food',
    name: 'Food & Dining',
    type: 'expense',
    color: '#f59e0b',
    isSystem: true,
    children: [
      {
        id: 'exp-food-restaurants',
        name: 'Restaurants',
        type: 'expense',
        color: '#f59e0b',
        parentId: 'exp-food',
      },
      {
        id: 'exp-food-groceries',
        name: 'Groceries',
        type: 'expense',
        color: '#fbbf24',
        parentId: 'exp-food',
        isSystem: true,
      },
    ],
  },
  {
    id: 'exp-transport',
    name: 'Transport',
    type: 'expense',
    color: '#3b82f6',
    children: [
      {
        id: 'exp-transport-fuel',
        name: 'Fuel',
        type: 'expense',
        color: '#3b82f6',
        parentId: 'exp-transport',
      },
      {
        id: 'exp-transport-public',
        name: 'Public transit',
        type: 'expense',
        color: '#60a5fa',
        parentId: 'exp-transport',
      },
    ],
  },
  {
    id: 'exp-housing',
    name: 'Housing',
    type: 'expense',
    color: '#8b5cf6',
    children: [
      {
        id: 'exp-housing-rent',
        name: 'Rent',
        type: 'expense',
        color: '#8b5cf6',
        parentId: 'exp-housing',
      },
      {
        id: 'exp-housing-utilities',
        name: 'Utilities',
        type: 'expense',
        color: '#a78bfa',
        parentId: 'exp-housing',
      },
    ],
  },
  {
    id: 'exp-health',
    name: 'Health',
    type: 'expense',
    color: '#ef4444',
    children: [],
  },
  {
    id: 'exp-entertainment',
    name: 'Entertainment',
    type: 'expense',
    color: '#ec4899',
    children: [
      {
        id: 'exp-ent-streaming',
        name: 'Streaming',
        type: 'expense',
        color: '#ec4899',
        parentId: 'exp-entertainment',
      },
    ],
  },
  {
    id: 'exp-shopping',
    name: 'Shopping',
    type: 'expense',
    color: '#f97316',
    children: [],
  },
];

// ---------- helpers ----------
function flattenCategories(cats: Category[]): Category[] {
  return cats.flatMap((c) => [c, ...(c.children ?? [])]);
}

function removeById(cats: Category[], id: string): Category[] {
  return cats
    .filter((c) => c.id !== id)
    .map((c) => (c.children ? { ...c, children: removeById(c.children, id) } : c));
}

// ---------- component ----------
export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(SEED_CATEGORIES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const incomeCategories = useMemo(
    () => categories.filter((c) => c.type === 'income'),
    [categories],
  );
  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === 'expense'),
    [categories],
  );

  /** All root-level categories (for parent picker in modal) */
  const rootCategories = useMemo(() => categories.filter((c) => !c.parentId), [categories]);

  function handleSave(data: Partial<Category>) {
    if (editingCategory) {
      // Update existing — find by id in flat list
      const update = (cats: Category[]): Category[] =>
        cats.map((c) => {
          if (c.id === editingCategory.id) return { ...c, ...data };
          return c.children ? { ...c, children: update(c.children) } : c;
        });
      setCategories(update);
    } else {
      if (!data.name || !data.type || !data.color) return;
      const newCat: Category = {
        id: String(Date.now()),
        name: data.name,
        type: data.type,
        color: data.color,
        children: [],
        ...(data.parentId ? { parentId: data.parentId } : {}),
      };
      if (data.parentId) {
        // Add as child of parent
        const addChild = (cats: Category[]): Category[] =>
          cats.map((c) => {
            if (c.id === data.parentId) {
              return { ...c, children: [...(c.children ?? []), newCat] };
            }
            return c.children ? { ...c, children: addChild(c.children) } : c;
          });
        setCategories(addChild);
      } else {
        setCategories((prev) => [...prev, newCat]);
      }
    }
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    setCategories((prev) => removeById(prev, deleteTarget.id));
    setDeleteOpen(false);
    setDeleteTarget(null);
  }

  function openEdit(cat: Category) {
    setEditingCategory(cat);
    setModalOpen(true);
  }

  function openDelete(cat: Category) {
    // Find the full category object (with children) from root list
    const flat = flattenCategories(categories);
    const full = flat.find((c) => c.id === cat.id) ?? cat;
    setDeleteTarget(full);
    setDeleteOpen(true);
  }

  const incomeCount = flattenCategories(incomeCategories).length;
  const expenseCount = flattenCategories(expenseCategories).length;

  return (
    <div className="flex flex-col min-h-full">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-border">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Button
          onClick={() => {
            setEditingCategory(null);
            setModalOpen(true);
          }}
        >
          <Plus className="size-4 mr-1.5" />
          Add category
        </Button>
      </div>

      {/* Content — two-column on desktop */}
      <div className="flex-1 px-6 py-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-6">
          {/* Income section */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-lg font-semibold">Income</h2>
              <span className="text-xs text-muted-foreground">
                {incomeCount} {incomeCount === 1 ? 'category' : 'categories'}
              </span>
            </div>

            {incomeCategories.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-12 text-center">
                <p className="text-sm text-muted-foreground">No income categories yet.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingCategory(null);
                    setModalOpen(true);
                  }}
                >
                  <Plus className="size-3.5 mr-1" />
                  Add category
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="flex flex-col divide-y divide-border">
                  {incomeCategories.map((cat) => (
                    <CategoryRow
                      key={cat.id}
                      category={cat}
                      onEdit={openEdit}
                      onDelete={openDelete}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Expense section */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-lg font-semibold">Expense</h2>
              <span className="text-xs text-muted-foreground">
                {expenseCount} {expenseCount === 1 ? 'category' : 'categories'}
              </span>
            </div>

            {expenseCategories.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-12 text-center">
                <p className="text-sm text-muted-foreground">No expense categories yet.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingCategory(null);
                    setModalOpen(true);
                  }}
                >
                  <Plus className="size-3.5 mr-1" />
                  Add category
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="flex flex-col divide-y divide-border">
                  {expenseCategories.map((cat) => (
                    <CategoryRow
                      key={cat.id}
                      category={cat}
                      onEdit={openEdit}
                      onDelete={openDelete}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Modals */}
      <CategoryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        category={editingCategory}
        rootCategories={rootCategories}
        onSave={handleSave}
      />
      <DeleteCategoryModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        category={deleteTarget}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
