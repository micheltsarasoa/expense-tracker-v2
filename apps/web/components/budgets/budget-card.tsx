'use client';

import { MoreHorizontal, Pencil, Copy, Trash2, AlertCircle, AlertTriangle } from 'lucide-react';
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

export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  startDate: string;
  endDate: string;
  category?: string;
  categoryColor: string | '#ccc';
  label?: string;
  isExpired?: boolean;
}

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDuplicate: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
}

function getProgressColor(pct: number) {
  if (pct >= 100) return 'bg-rose-500';
  if (pct >= 75) return 'bg-amber-500';
  return 'bg-emerald-500';
}

export function BudgetCard({ budget, onEdit, onDuplicate, onDelete }: BudgetCardProps) {
  const rawPct = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
  const pct = Math.min(rawPct, 100);
  const remaining = budget.amount - budget.spent;
  const isOver = rawPct >= 100;
  const isWarn = rawPct >= 75 && rawPct < 100;
  const progressColor = getProgressColor(rawPct);

  return (
    <div
      className={cn(
        'relative flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm transition-opacity',
        isOver && 'border-rose-300 dark:border-rose-800',
        budget.isExpired && 'opacity-60',
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {budget.category && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              {budget.categoryColor && (
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: budget.categoryColor }}
                />
              )}
              {budget.category}
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
          {budget.isExpired && (
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
          {budget.startDate} – {budget.endDate}
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{Math.round(rawPct)}%</span>
          <span className="tabular-nums font-medium text-foreground">
            €{budget.amount.toFixed(2)}
          </span>
        </div>
        <Progress value={pct} className="h-2" indicatorClassName={progressColor} />
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground tabular-nums">
            €{budget.spent.toFixed(2)} spent
          </span>
          {isOver ? (
            <span className="text-rose-600 dark:text-rose-400 tabular-nums font-medium">
              Over by €{Math.abs(remaining).toFixed(2)}
            </span>
          ) : (
            <span className="text-muted-foreground tabular-nums">€{remaining.toFixed(2)} left</span>
          )}
        </div>
      </div>
    </div>
  );
}
