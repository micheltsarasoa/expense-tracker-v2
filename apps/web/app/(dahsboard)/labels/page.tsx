'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// ---------- types ----------
interface Label {
  id: string;
  name: string;
  color: string;
}

// ---------- seed data ----------
const SEED_LABELS: Label[] = [
  { id: '1', name: 'Personal', color: '#3b82f6' },
  { id: '2', name: 'Work', color: '#10b981' },
  { id: '3', name: 'Recurring', color: '#f59e0b' },
  { id: '4', name: 'Tax deductible', color: '#8b5cf6' },
  { id: '5', name: 'Reimbursable', color: '#f43f5e' },
  { id: '6', name: 'Holiday', color: '#06b6d4' },
];

const PRESET_COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#84cc16',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#6b7280',
  '#1e293b',
];

// ---------- inline color picker ----------
function InlineColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 p-1">
      {PRESET_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          title={c}
          onClick={() => onChange(c)}
          className={cn(
            'size-6 rounded-md border-2 transition-transform hover:scale-110',
            value === c ? 'border-foreground scale-110' : 'border-transparent',
          )}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}

// ---------- inline row form ----------
interface InlineFormProps {
  initialName?: string;
  initialColor?: string;
  onSave: (name: string, color: string) => void;
  onCancel: () => void;
}

function InlineForm({
  initialName = '',
  initialColor = '#3b82f6',
  onSave,
  onCancel,
}: InlineFormProps) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed, color);
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-2.5">
      {/* Color trigger with popover */}
      <div className="relative group">
        <button
          type="button"
          className="size-7 rounded-md border border-border shrink-0 transition-transform hover:scale-110"
          style={{ backgroundColor: color }}
          title="Pick color"
        />
        {/* Inline color panel — always visible in form mode */}
        <div className="absolute left-0 top-9 z-20 rounded-lg border border-border bg-popover shadow-md w-42">
          <InlineColorPicker value={color} onChange={setColor} />
        </div>
      </div>

      <Input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Label name"
        className="h-8 text-sm flex-1"
        style={{ marginTop: '0px' }}
      />

      <Button type="submit" size="sm" className="h-8 gap-1" disabled={!name.trim()}>
        <Check className="size-3.5" />
        Save
      </Button>
      <Button type="button" variant="ghost" size="sm" className="h-8" onClick={onCancel}>
        <X className="size-4" />
      </Button>
    </form>
  );
}

// ---------- page ----------
export default function LabelsPage() {
  const [labels, setLabels] = useState<Label[]>(SEED_LABELS);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Label | null>(null);

  function handleAdd(name: string, color: string) {
    setLabels((prev) => [...prev, { id: String(Date.now()), name, color }]);
    setAdding(false);
  }

  function handleEdit(id: string, name: string, color: string) {
    setLabels((prev) => prev.map((l) => (l.id === id ? { ...l, name, color } : l)));
    setEditingId(null);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setLabels((prev) => prev.filter((l) => l.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold">Labels</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tag transactions with labels for custom grouping and filtering.
          </p>
        </div>
        <Button
          onClick={() => {
            setAdding(true);
            setEditingId(null);
          }}
          disabled={adding}
        >
          <Plus className="size-4 mr-1.5" />
          Add label
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 max-w-2xl">
        {labels.length === 0 && !adding ? (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Plus className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">No labels yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add labels to organise and filter your transactions.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
              <Plus className="size-3.5 mr-1" />
              Add label
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            {/* Inline add row at top */}
            {adding && (
              <>
                <div className="bg-muted/30">
                  <InlineForm onSave={handleAdd} onCancel={() => setAdding(false)} />
                </div>
                <Separator />
              </>
            )}

            {/* Label list */}
            <div className="divide-y divide-border">
              {labels.map((label) => (
                <div key={label.id}>
                  {editingId === label.id ? (
                    <div className="bg-muted/30">
                      <InlineForm
                        initialName={label.name}
                        initialColor={label.color}
                        onSave={(name, color) => handleEdit(label.id, name, color)}
                        onCancel={() => setEditingId(null)}
                      />
                    </div>
                  ) : (
                    <div className="group flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="size-3 rounded-full shrink-0"
                          style={{ backgroundColor: label.color }}
                        />
                        <span className="text-sm font-medium truncate">{label.name}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => {
                            setEditingId(label.id);
                            setAdding(false);
                          }}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteTarget(label)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-3">
          {labels.length} {labels.length === 1 ? 'label' : 'labels'}
        </p>
      </div>

      {/* Delete dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deleteTarget?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This label will be removed from all transactions that use it. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
