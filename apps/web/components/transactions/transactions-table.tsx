'use client';

import {
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  CheckCircle,
  Circle,
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCheck,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Transaction } from './transaction-modal';

interface TransactionsTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  onToggleValidated: (id: string) => void;
  validatedIds: Set<string>;
}

const typeConfig = {
  income: {
    label: 'Income',
    icon: TrendingUp,
    badgeClass:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400',
    amountClass: 'text-emerald-600 dark:text-emerald-400',
    prefix: '+',
  },
  expense: {
    label: 'Expense',
    icon: TrendingDown,
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400',
    amountClass: 'text-rose-600 dark:text-rose-400',
    prefix: '-',
  },
  transfer: {
    label: 'Transfer',
    icon: ArrowLeftRight,
    badgeClass:
      'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-400',
    amountClass: 'text-violet-600 dark:text-violet-400',
    prefix: '',
  },
};

export function TransactionsTable({
  transactions,
  onEdit,
  onDelete,
  onToggleValidated,
  validatedIds,
}: TransactionsTableProps) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="text-xs font-medium">Date</TableHead>
            <TableHead className="text-xs font-medium">Type</TableHead>
            <TableHead className="text-xs font-medium">Description</TableHead>
            <TableHead className="text-xs font-medium text-right">Amount</TableHead>
            <TableHead className="text-xs font-medium">Account</TableHead>
            <TableHead className="text-xs font-medium">Category</TableHead>
            <TableHead className="text-xs font-medium">Label</TableHead>
            <TableHead className="text-xs font-medium text-center">
              <CheckCircle className="size-3.5 mx-auto" aria-label="Validated" />
            </TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => {
            const config = typeConfig[tx.type];
            const TypeIcon = config.icon;
            const isValidated = validatedIds.has(tx.id);

            return (
              <TableRow key={tx.id} className="group">
                <TableCell className="text-sm text-muted-foreground tabular-nums whitespace-nowrap">
                  {tx.date}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      'flex w-fit items-center gap-1 text-xs font-medium',
                      config.badgeClass,
                    )}
                  >
                    <TypeIcon className="size-3" />
                    {config.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm max-w-48">
                  {tx.description ? (
                    <span className="truncate block">{tx.description}</span>
                  ) : (
                    <span className="text-muted-foreground italic">No description</span>
                  )}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-sm font-medium tabular-nums text-right whitespace-nowrap',
                    config.amountClass,
                  )}
                >
                  {config.prefix}€{parseFloat(tx.amount || '0').toFixed(2)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{tx.accountFrom}</TableCell>
                <TableCell className="text-sm">
                  {tx.category ? (
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-primary/60 shrink-0" />
                      <span className="text-muted-foreground">{tx.category}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground/40">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {tx.label ? (
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-violet-400 shrink-0" />
                      <span className="text-muted-foreground">{tx.label}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground/40">—</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <button
                    type="button"
                    onClick={() => onToggleValidated(tx.id)}
                    className="mx-auto flex items-center justify-center"
                    aria-label={isValidated ? 'Mark as unvalidated' : 'Mark as validated'}
                  >
                    {isValidated ? (
                      <CheckCircle className="size-4 text-emerald-500" />
                    ) : (
                      <Circle className="size-4 text-muted-foreground/40" />
                    )}
                  </button>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Row actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => onEdit(tx)}>
                        <Pencil className="size-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleValidated(tx.id)}>
                        <CheckCheck className="size-4 mr-2" />
                        {isValidated ? 'Mark unvalidated' : 'Mark validated'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(tx)}
                      >
                        <Trash2 className="size-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
