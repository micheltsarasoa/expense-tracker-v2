'use client';

import { Pie, PieChart, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';

const CATEGORY_COLORS = [
  '#10b981', // emerald
  '#f43f5e', // rose
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#6b7280', // gray (Other)
];

interface CategorySlice {
  name: string;
  value: number;
  color?: string;
}

interface SpendingByCategoryChartProps {
  data: CategorySlice[];
  total: number;
  loading?: boolean;
}

export function SpendingByCategoryChart({ data, total, loading }: SpendingByCategoryChartProps) {
  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-44 w-44 rounded-full mx-auto" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 flex-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = Object.fromEntries(
    data.map((d, i) => [
      d.name,
      { label: d.name, color: d.color ?? CATEGORY_COLORS[i % CATEGORY_COLORS.length] ?? '#6b7280' },
    ]),
  );

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyTitle>No spending data</EmptyTitle>
              <EmptyDescription>Add expense transactions to see your breakdown.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-4">
            <ChartContainer config={chartConfig} className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="80%"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={
                          entry.color ??
                          CATEGORY_COLORS[index % CATEGORY_COLORS.length] ??
                          '#6b7280'
                        }
                      />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) =>
                          `€${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                        }
                      />
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Legend */}
            <ul className="space-y-1.5">
              {data.map((entry, index) => {
                const color = entry.color ?? CATEGORY_COLORS[index % CATEGORY_COLORS.length];
                const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0.0';
                return (
                  <li key={entry.name} className="flex items-center justify-between gap-2 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="size-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="truncate text-muted-foreground">{entry.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 tabular-nums">
                      <span className="text-xs text-muted-foreground">{pct}%</span>
                      <span className="font-medium">
                        €{entry.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
