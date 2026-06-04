'use client';

import { Pie, PieChart, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { useFormat } from '@/lib/settings-context';

const FALLBACK_COLORS = [
  '#10b981',
  '#f43f5e',
  '#8b5cf6',
  '#f59e0b',
  '#3b82f6',
  '#06b6d4',
  '#ec4899',
  '#6b7280',
];

export interface CategorySlice {
  name: string;
  value: number;
  color?: string;
}

interface Props {
  data: CategorySlice[];
  loading?: boolean;
}

export function SpendingByCategoryTab({ data, loading }: Props) {
  const { money } = useFormat();
  const total = data.reduce((s, d) => s + d.value, 0);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-72 rounded-xl" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyTitle>No expense transactions in this period</EmptyTitle>
          <EmptyDescription>
            Adjust the date range or add expense transactions to see category spending.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const chartConfig = Object.fromEntries(
    data.map((d, i) => [
      d.name,
      { label: d.name, color: d.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length] ?? '#6b7280' },
    ]),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Donut chart */}
        <ChartContainer config={chartConfig} className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="52%"
                outerRadius="78%"
                dataKey="value"
                paddingAngle={2}
              >
                {data.map((entry, i) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length] ?? '#6b7280'}
                  />
                ))}
              </Pie>
              <ChartTooltip
                content={<ChartTooltipContent formatter={(value) => money(Number(value))} />}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Breakdown table */}
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">
                    % of total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((row, i) => {
                  const color = row.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length];
                  const pct = total > 0 ? ((row.value / total) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={row.name} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="size-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-medium">{row.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-medium">
                        {money(row.value)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                        {pct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-border bg-muted/30">
                  <td className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">Total</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-semibold">
                    {money(total)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">100%</td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
