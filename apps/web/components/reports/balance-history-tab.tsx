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
import { ChartContainer } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { useFormat } from '@/lib/settings-context';

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

export function BalanceHistoryTab({ data, accounts, loading }: Props) {
  const { money, date, settings } = useFormat();
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
      <ChartContainer config={chartConfig} className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => date(String(v))}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                `${settings.currencySymbol}${Number(v).toLocaleString('en-US', { minimumFractionDigits: 0 })}`
              }
            />
            <Tooltip
              formatter={(value, name) => [money(Number(value)), String(name)]}
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
