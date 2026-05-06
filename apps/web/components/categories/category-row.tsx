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
import type { Category } from './category-modal';

interface CategoryRowProps {
  category: Category;
  isChild?: boolean;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryRow({ category, isChild = false, onEdit, onDelete }: CategoryRowProps) {
  return (
    <div className="flex flex-col">
      <div
        className={cn(
          'group flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-muted/50',
          category.isSystem && 'bg-muted/30',
          isChild && 'ml-6',
        )}
      >
        {/* Connector line for children */}
        {isChild && (
          <div className="absolute left-[2.15rem] h-full w-px bg-border" aria-hidden="true" />
        )}

        {/* Color dot */}
        <span
          className="size-3 rounded-full shrink-0"
          style={{ backgroundColor: category.color }}
          aria-hidden="true"
        />

        {/* Name + badges */}
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

        {/* Actions — only for non-system */}
        {!category.isSystem ? (
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
        ) : (
          <div className="size-7 shrink-0" />
        )}
      </div>

      {/* Subcategories */}
      {category.children && category.children.length > 0 && (
        <div className="relative flex flex-col">
          {/* Vertical connector */}
          <div className="absolute left-9 top-0 bottom-0 w-px bg-border" aria-hidden="true" />
          {category.children.map((child) => (
            <CategoryRow
              key={child.id}
              category={child}
              isChild
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
