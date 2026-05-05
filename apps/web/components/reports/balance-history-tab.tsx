'use client';

import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChartContainer } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';

export interface BalanceDataPoint {
  date: string;
  [accountName: string]: number | string;
}

export interface AccountLine {
  name: string;
  color: string;
}

interface Props {
  data: BalanceDataPoint[];
  accounts: AccountLine[];
  loading?: boolean;
}

function formatEur(val: number) {
  return `€${Number(val).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
}

export function BalanceHistoryTab({ data, accounts, loading }: Props) {
  if (loading) {
    return <Skeleton className="h-72 rounded-xl" />;
  }

  if (data.length === 0 || accounts.length === 0) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyTitle>No accounts or transactions found</EmptyTitle>
          <EmptyDescription>
            Add transactions and accounts to see balance history over time.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const chartConfig = Object.fromEntries(
    accounts.map((a) => [a.name, { label: a.name, color: a.color }]),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="size-3.5" />
          Export CSV
        </Button>
      </div>

      <ChartContainer config={chartConfig} className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatEur}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                `€${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                name,
              ]}
              contentStyle={{
                fontSize: '12px',
                borderRadius: '8px',
                border: '1px solid hsl(var(--border))',
                background: 'hsl(var(--popover))',
                color: 'hsl(var(--popover-foreground))',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
            {accounts.map((account) => (
              <Line
                key={account.name}
                type="monotone"
                dataKey={account.name}
                stroke={account.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: account.color }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
