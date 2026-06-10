'use client';

import { Lock, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { CategoryIcon } from './category-icon';
import type { Category } from './category-modal';

interface CategoryRowProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryRow({ category, onEdit, onDelete }: CategoryRowProps) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          'group flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 shadow-sm transition-colors hover:bg-muted/40',
          category.isSystem && 'bg-muted/30',
        )}
      >
        <CategoryIcon icon={category.icon ?? null} color={category.color} />

        <div className="flex flex-1 items-center gap-2 min-w-0">
          <span className="text-sm font-medium truncate">{category.name}</span>
          {category.isSystem && (
            <div className="flex items-center gap-1 shrink-0">
              <Lock className="size-3 text-muted-foreground" />
              <Badge variant="outline" className="text-xs text-muted-foreground py-0 px-1.5">
                System
              </Badge>
            </div>
          )}
        </div>

        <span
          className="h-2.5 w-7 rounded-full shrink-0"
          style={{ backgroundColor: category.color }}
          aria-hidden="true"
        />

        {!category.isSystem && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Category actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => onEdit(category)}>
                <Pencil className="size-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(category)}
              >
                <Trash2 className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {category.children && category.children.length > 0 && (
        <div className="ml-5 flex flex-col gap-2 border-l border-border pl-3">
          {category.children.map((child) => (
            <CategoryRow key={child.id} category={child} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
