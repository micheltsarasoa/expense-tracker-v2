'use client';

import type { Category } from './category-modal';
import { ConfirmDialog } from '@/components/confirm-dialog';

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
  const childCount = category?.children?.length ?? 0;

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={<>Delete &ldquo;{category?.name}&rdquo;?</>}
      description={
        childCount > 0
          ? `This category has ${childCount} subcategory(ies). Deleting it will also remove all subcategories.`
          : 'This will permanently delete the category. This action cannot be undone.'
      }
      confirmLabel="Delete"
      busyLabel="Deleting…"
      destructive
      onConfirm={onConfirm}
    />
  );
}
