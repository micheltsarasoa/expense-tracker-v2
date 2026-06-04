'use client';

import {
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  ArrowRight,
  CheckCircle,
  Circle,
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCheck,
} from 'lucide-react';
import type { TransactionListItemDTO } from '@expense-tracker/types';
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
import { useFormat } from '@/lib/settings-context';

interface TransactionsTableProps {
  transactions: TransactionListItemDTO[];
  onEdit: (transaction: TransactionListItemDTO) => void;
  onDelete: (transaction: TransactionListItemDTO) => void;
  onToggleValidated: (id: string) => void;
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
}: TransactionsTableProps) {
  const { money, date } = useFormat();
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
            return (
              <TableRow key={tx.id} className="group">
                <TableCell className="text-sm text-muted-foreground tabular-nums whitespace-nowrap">
                  {date(tx.transactionDate)}
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
                  {config.prefix}
                  {money(tx.amount)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {tx.type === 'transfer' && tx.toPaymentMethodName ? (
                    <span className="flex items-center gap-1">
                      {tx.paymentMethodName}
                      <ArrowRight className="size-3 shrink-0" />
                      {tx.toPaymentMethodName}
                    </span>
                  ) : (
                    tx.paymentMethodName
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {tx.categoryName ? (
                    <div className="flex items-center gap-1.5">
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: tx.categoryColor ?? '#6b7280' }}
                      />
                      <span className="text-muted-foreground">{tx.categoryName}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground/40">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {tx.labelName ? (
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-violet-400 shrink-0" />
                      <span className="text-muted-foreground">{tx.labelName}</span>
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
                    aria-label={tx.isValidated ? 'Mark as unvalidated' : 'Mark as validated'}
                  >
                    {tx.isValidated ? (
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
                        className="size-7 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
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
                        {tx.isValidated ? 'Mark unvalidated' : 'Mark validated'}
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
