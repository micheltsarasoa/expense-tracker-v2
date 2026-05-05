'use client';

import {
  Bar,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { cn } from '@/lib/utils';

export interface MonthlyEntry {
  month: string;
  income: number;
  expense: number;
}

interface Props {
  data: MonthlyEntry[];
  loading?: boolean;
}

const chartConfig = {
  income: { label: 'Income', color: '#10b981' },
  expense: { label: 'Expenses', color: '#f43f5e' },
  net: { label: 'Net', color: '#8b5cf6' },
};

function formatEur(val: number) {
  return `€${Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
}

export function IncomeVsExpensesTab({ data, loading }: Props) {
  if (loading) {
    return <Skeleton className="h-72 rounded-xl" />;
  }

  if (data.length === 0) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyTitle>No transactions in this period</EmptyTitle>
          <EmptyDescription>
            Adjust the date range to see income and expense trends.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const withNet = data.map((d) => ({ ...d, net: d.income - d.expense }));
  const totalIncome = data.reduce((s, d) => s + d.income, 0);
  const totalExpense = data.reduce((s, d) => s + d.expense, 0);
  const totalNet = totalIncome - totalExpense;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="size-3.5" />
          Export CSV
        </Button>
      </div>

      {/* Chart */}
      <ChartContainer config={chartConfig} className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={withNet} margin={{ top: 4, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="bars"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatEur}
            />
            <YAxis
              yAxisId="line"
              orientation="right"
              tick={{ fontSize: 12, fill: '#8b5cf6' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatEur}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    const label =
                      name === 'income' ? 'Income' : name === 'expense' ? 'Expenses' : 'Net';
                    return [
                      `€${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                      label,
                    ];
                  }}
                />
              }
            />
            <Legend
              formatter={(value) => chartConfig[value as keyof typeof chartConfig]?.label ?? value}
              wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
            />
            <ReferenceLine yAxisId="line" y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <Bar
              yAxisId="bars"
              dataKey="income"
              fill="#10b981"
              radius={[3, 3, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              yAxisId="bars"
              dataKey="expense"
              fill="#f43f5e"
              radius={[3, 3, 0, 0]}
              maxBarSize={40}
            />
            <Line
              yAxisId="line"
              type="monotone"
              dataKey="net"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Total income',
            value: totalIncome,
            colorClass: 'text-emerald-600 dark:text-emerald-400',
          },
          {
            label: 'Total expenses',
            value: totalExpense,
            colorClass: 'text-rose-600 dark:text-rose-400',
          },
          {
            label: 'Net',
            value: totalNet,
            colorClass: cn(
              totalNet > 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : totalNet < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-muted-foreground',
            ),
          },
        ].map((item) => (
          <Card key={item.label} className="shadow-sm">
            <CardContent className="py-4 px-5">
              <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
              <p className={cn('text-xl font-bold tabular-nums', item.colorClass)}>
                {totalNet < 0 && item.label === 'Net' ? '-' : ''}€
                {Math.abs(item.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly breakdown table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">
                  Month
                </th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">
                  Income
                </th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">
                  Expenses
                </th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">
                  Net
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {withNet.map((row) => (
                <tr key={row.month} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-2.5 font-medium">{row.month}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                    +€{row.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-rose-600 dark:text-rose-400">
                    -€{row.expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td
                    className={cn(
                      'px-4 py-2.5 text-right tabular-nums font-medium',
                      row.net >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400',
                    )}
                  >
                    {row.net >= 0 ? '+' : '-'}€
                    {Math.abs(row.net).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
