'use client';

import { MoreHorizontal, Pencil, Copy, Trash2, AlertCircle, AlertTriangle } from 'lucide-react';
import type { BudgetWithSpendingDTO } from '@expense-tracker/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useFormat } from '@/lib/settings-context';

interface BudgetCardProps {
  budget: BudgetWithSpendingDTO;
  onEdit: (budget: BudgetWithSpendingDTO) => void;
  onDuplicate: (budget: BudgetWithSpendingDTO) => void;
  onDelete: (budget: BudgetWithSpendingDTO) => void;
}

function getProgressColor(pct: number) {
  if (pct >= 100) return 'bg-rose-500';
  if (pct >= 75) return 'bg-amber-500';
  return 'bg-emerald-500';
}

export function BudgetCard({ budget, onEdit, onDuplicate, onDelete }: BudgetCardProps) {
  const { money, date } = useFormat();
  const pct = budget.pct; // server-computed, clamped 0..999
  const barPct = Math.min(pct, 100);
  const isOver = pct >= 100;
  const isWarn = pct >= 75 && pct < 100;
  const remaining = parseFloat(budget.remaining);
  const today = new Date().toISOString().slice(0, 10);
  const isEnded = budget.endDate !== null && budget.endDate < today;
  const progressColor = getProgressColor(pct);

  return (
    <div
      className={cn(
        'relative flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm transition-opacity',
        isOver && 'border-rose-300 dark:border-rose-800',
        isEnded && 'opacity-60',
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {budget.categoryName && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              {budget.categoryColor && (
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: budget.categoryColor }}
                />
              )}
              {budget.categoryName}
            </Badge>
          )}
          {isOver && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 text-xs bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800"
            >
              <AlertCircle className="size-3" />
              Over
            </Badge>
          )}
          {isWarn && !isOver && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"
            >
              <AlertTriangle className="size-3" />
              Warning
            </Badge>
          )}
          {isEnded && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 text-xs text-muted-foreground"
            >
              Ended
            </Badge>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 shrink-0">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Budget actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit(budget)}>
              <Pencil className="size-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(budget)}>
              <Copy className="size-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(budget)}
            >
              <Trash2 className="size-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Name & dates */}
      <div>
        <p className="text-base font-medium leading-tight">{budget.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {date(budget.startDate)} – {budget.endDate ? date(budget.endDate) : 'ongoing'}
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{pct}%</span>
          <span className="tabular-nums font-medium text-foreground">{money(budget.amount)}</span>
        </div>
        <Progress value={barPct} className="h-2" indicatorClassName={progressColor} />
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground tabular-nums">{money(budget.spent)} spent</span>
          {isOver ? (
            <span className="text-rose-600 dark:text-rose-400 tabular-nums font-medium">
              Over by {money(Math.abs(remaining))}
            </span>
          ) : (
            <span className="text-muted-foreground tabular-nums">
              {money(budget.remaining)} left
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
