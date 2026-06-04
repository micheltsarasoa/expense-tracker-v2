'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { Category } from './category-modal';

interface DeleteCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onConfirm: () => Promise<boolean>;
}

export function DeleteCategoryModal({
  open,
  onOpenChange,
  category,
  onConfirm,
}: DeleteCategoryModalProps) {
  const [deleting, setDeleting] = useState(false);
  const childCount = category?.children?.length ?? 0;

  async function handleDelete() {
    setDeleting(true);
    const ok = await onConfirm();
    setDeleting(false);
    if (ok) onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &ldquo;{category?.name}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            {childCount > 0
              ? `This category has ${childCount} subcategory(ies). Deleting it will also remove all subcategories.`
              : 'This will permanently delete the category. This action cannot be undone.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting && <Spinner className="mr-2 size-4" />}
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
