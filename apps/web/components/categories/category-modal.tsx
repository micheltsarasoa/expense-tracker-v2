'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  parentId?: string;
  isSystem?: boolean;
  children?: Category[];
}

const PRESET_COLORS = [
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#ef4444',
  '#f59e0b',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
  '#f97316',
  '#6366f1',
  '#14b8a6',
  '#64748b',
];

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  /** Root-level categories of both types (for parent selection) */
  rootCategories: Category[];
  onSave: (data: Partial<Category>) => void;
}

interface FormState {
  name: string;
  type: CategoryType;
  color: string;
  parentId: string;
}

export function CategoryModal({
  open,
  onOpenChange,
  category,
  rootCategories,
  onSave,
}: CategoryModalProps) {
  const isEdit = !!category;
  const [form, setForm] = useState<FormState>({
    name: '',
    type: 'expense',
    color: PRESET_COLORS[0],
    parentId: '',
  });
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (open) {
      if (category) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm({
          name: category.name,
          type: category.type,
          color: category.color,
          parentId: category.parentId ?? '',
        });
      } else {
        setForm({ name: '', type: 'expense', color: PRESET_COLORS[0], parentId: '' });
      }

      setNameError('');
      setSaving(false);
    }
  }, [open, category]);

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'name') setNameError('');
  }

  const eligibleParents = rootCategories.filter(
    (c) => c.type === form.type && !c.isSystem && c.id !== category?.id,
  );

  async function handleSave() {
    if (!form.name.trim()) {
      setNameError('Name is required.');
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    onSave({
      name: form.name.trim(),
      type: form.type,
      color: form.color,
      parentId: form.parentId || undefined,
    });
    setSaving(false);
    onOpenChange(false);
  }

  const TYPE_OPTIONS: { value: CategoryType; label: string; activeClass: string }[] = [
    {
      value: 'income',
      label: 'Income',
      activeClass:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
    },
    {
      value: 'expense',
      label: 'Expense',
      activeClass:
        'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Category' : 'New Category'}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name"
              placeholder="e.g. Groceries"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
            {nameError && <p className="text-xs text-destructive">{nameError}</p>}
          </div>

          {/* Type — disabled in edit mode */}
          <div className="flex flex-col gap-1.5">
            <Label>Type</Label>
            <div className="flex gap-2">
              {TYPE_OPTIONS.map((opt) => {
                const isActive = form.type === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isEdit}
                    onClick={() => set('type', opt.value)}
                    className={cn(
                      'flex flex-1 items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? opt.activeClass
                        : 'border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted',
                      isEdit && 'cursor-not-allowed opacity-60',
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {isEdit && (
              <p className="text-xs text-muted-foreground">
                Type cannot be changed after creation.
              </p>
            )}
          </div>

          {/* Parent category */}
          {eligibleParents.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cat-parent">Parent category (optional)</Label>
              <Select
                value={form.parentId}
                onValueChange={(v) => set('parentId', v === '__none__' ? '' : v)}
              >
                <SelectTrigger id="cat-parent">
                  <SelectValue placeholder="None (root category)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None (root category)</SelectItem>
                  {eligibleParents.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2 rounded-full shrink-0"
                          style={{ backgroundColor: c.color }}
                        />
                        {c.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Color */}
          <div className="flex flex-col gap-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => set('color', color)}
                  className="size-7 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: color,
                    borderColor: form.color === color ? color : 'transparent',
                    outline: form.color === color ? `2px solid ${color}` : 'none',
                    outlineOffset: '2px',
                  }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!form.name.trim() || saving}>
            {saving ? <Spinner className="mr-2 size-4" /> : null}
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
