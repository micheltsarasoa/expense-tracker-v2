import { getUserId } from '@/lib/auth';
import { categoryService } from '@/services/instances';
import type { Category } from '@/components/categories/category-modal';
import { CategoriesClient } from './categories-client';

export default async function CategoriesPage() {
  const userId = await getUserId();
  const rows = await categoryService.list(userId);

  // Build the income/expense tree (roots with nested children) from the flat list.
  const byId = new Map<string, Category & { children: Category[] }>();
  for (const r of rows) {
    byId.set(r.id, {
      id: r.id,
      name: r.name,
      type: r.type,
      color: r.color ?? '#6b7280',
      icon: r.icon ?? null,
      isSystem: r.isDefault,
      children: [],
      ...(r.parentId ? { parentId: r.parentId } : {}),
    });
  }

  const roots: Category[] = [];
  for (const r of rows) {
    const node = byId.get(r.id);
    if (!node) continue;
    const parent = r.parentId ? byId.get(r.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  return <CategoriesClient categories={roots} />;
}
