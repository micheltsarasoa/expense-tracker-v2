'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CategoryRow } from '@/components/categories/category-row';
import {
  CategoryModal,
  type Category,
  type CategoryFormValues,
} from '@/components/categories/category-modal';
import { DeleteCategoryModal } from '@/components/categories/delete-category-modal';
import { createCategory, updateCategory, deleteCategory } from './actions';

interface CategoriesClientProps {
  /** Root-level categories with nested children. */
  categories: Category[];
}

function flatten(cats: Category[]): Category[] {
  return cats.flatMap((c) => [c, ...(c.children ?? [])]);
}

export function CategoriesClient({ categories }: CategoriesClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
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

  const incomeCount = flatten(incomeCategories).length;
  const expenseCount = flatten(expenseCategories).length;

  async function handleSubmit(values: CategoryFormValues): Promise<boolean> {
    const res = editing ? await updateCategory(editing.id, values) : await createCategory(values);
    if (res.ok) toast.success(editing ? 'Category updated' : 'Category created');
    else toast.error(res.error ?? 'Failed to save category. Please try again.');
    return res.ok;
  }

  async function handleDelete(): Promise<boolean> {
    if (!deleteTarget) return false;
    const res = await deleteCategory(deleteTarget.id);
    if (res.ok) toast.success('Category deleted');
    else toast.error(res.error ?? 'Failed to delete category. Please try again.');
    return res.ok;
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function renderSection(label: string, count: number, items: Category[]) {
    return (
      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-semibold">{label}</h2>
          <span className="text-xs text-muted-foreground">
            {count} {count === 1 ? 'category' : 'categories'}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No {label.toLowerCase()} categories yet.
            </p>
            <Button variant="outline" size="sm" onClick={openCreate}>
              <Plus className="size-3.5 mr-1" />
              Add category
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="flex flex-col divide-y divide-border">
              {items.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  onEdit={(c) => {
                    setEditing(c);
                    setModalOpen(true);
                  }}
                  onDelete={(c) => {
                    setDeleteTarget(c);
                    setDeleteOpen(true);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex items-center justify-between gap-4 pb-5 border-b border-border">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Button onClick={openCreate}>
          <Plus className="size-4 mr-1.5" />
          Add category
        </Button>
      </div>

      <div className="flex-1 py-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-6">
          {renderSection('Income', incomeCount, incomeCategories)}
          {renderSection('Expense', expenseCount, expenseCategories)}
        </div>
      </div>

      <CategoryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        category={editing}
        rootCategories={categories}
        onSubmit={handleSubmit}
      />
      <DeleteCategoryModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        category={deleteTarget}
        onConfirm={handleDelete}
      />
    </div>
  );
}
