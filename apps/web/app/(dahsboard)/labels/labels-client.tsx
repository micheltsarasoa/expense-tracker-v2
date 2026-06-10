'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
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
import { createLabel, updateLabel, deleteLabel } from './actions';

interface Label {
  id: string;
  name: string;
  color: string;
}

interface LabelsClientProps {
  labels: Label[];
}

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

interface InlineFormProps {
  initialName?: string;
  initialColor?: string;
  onSave: (name: string, color: string) => Promise<void>;
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
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    await onSave(trimmed, color);
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-2.5">
      <div className="relative group">
        <button
          type="button"
          className="size-7 rounded-md border border-border shrink-0 transition-transform hover:scale-110"
          style={{ backgroundColor: color }}
          title="Pick color"
        />
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
        disabled={saving}
      />

      <Button type="submit" size="sm" className="h-8 gap-1" disabled={!name.trim() || saving}>
        <Check className="size-3.5" />
        {saving ? 'Saving…' : 'Save'}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8"
        onClick={onCancel}
        disabled={saving}
      >
        <X className="size-4" />
      </Button>
    </form>
  );
}

export function LabelsClient({ labels }: LabelsClientProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Label | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleAdd(name: string, color: string) {
    const res = await createLabel({ name, color });
    if (res.ok) {
      toast.success('Label created');
      setAdding(false);
    } else {
      toast.error(res.error ?? 'Failed to create label');
    }
  }

  async function handleEdit(id: string, name: string, color: string) {
    const res = await updateLabel(id, { name, color });
    if (res.ok) {
      toast.success('Label updated');
      setEditingId(null);
    } else {
      toast.error(res.error ?? 'Failed to update label');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await deleteLabel(deleteTarget.id);
    setDeleting(false);
    if (res.ok) {
      toast.success('Label deleted');
      setDeleteTarget(null);
    } else {
      toast.error(res.error ?? 'Failed to delete label');
    }
  }

  return (
    <div className="flex flex-col min-h-full">
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
            {adding && (
              <>
                <div className="bg-muted/30">
                  <InlineForm onSave={handleAdd} onCancel={() => setAdding(false)} />
                </div>
                <Separator />
              </>
            )}

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
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
