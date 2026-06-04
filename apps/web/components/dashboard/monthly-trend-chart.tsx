'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormat } from '@/lib/settings-context';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

const INCOME_COLOR = '#10b981'; // emerald-500
const EXPENSE_COLOR = '#f43f5e'; // rose-500

interface MonthlyTrendChartProps {
  data: { month: string; income: number; expense: number }[];
  loading?: boolean;
}

const chartConfig = {
  income: { label: 'Income', color: INCOME_COLOR },
  expense: { label: 'Expenses', color: EXPENSE_COLOR },
};

export function MonthlyTrendChart({ data, loading }: MonthlyTrendChartProps) {
  const { money, settings } = useFormat();
  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Monthly Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) =>
                  `${settings.currencySymbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                }
                className="text-muted-foreground"
              />
              <ChartTooltip
                content={<ChartTooltipContent formatter={(value) => money(Number(value))} />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="income" fill={INCOME_COLOR} radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="expense" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
