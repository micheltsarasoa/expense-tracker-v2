export type DashboardPeriod =
  | 'this-month'
  | 'last-month'
  | 'last-3-months'
  | 'this-year'
  | 'custom';

export interface ResolvedPeriod {
  period: DashboardPeriod;
  from: string;
  to: string;
  prevFrom: string;
  prevTo: string;
  label: string;
}

const PERIODS: readonly DashboardPeriod[] = [
  'this-month',
  'last-month',
  'last-3-months',
  'this-year',
  'custom',
];

export function isDashboardPeriod(value: string): value is DashboardPeriod {
  return (PERIODS as readonly string[]).includes(value);
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function monthStart(y: number, m: number): Date {
  return new Date(Date.UTC(y, m, 1));
}

function monthEnd(y: number, m: number): Date {
  return new Date(Date.UTC(y, m + 1, 0));
}

function isIsoDay(value: string | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime());
}

export function resolvePeriod(
  period: DashboardPeriod,
  fromParam?: string,
  toParam?: string,
  now: Date = new Date(),
): ResolvedPeriod {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();

  switch (period) {
    case 'last-month':
      return {
        period,
        from: ymd(monthStart(y, m - 1)),
        to: ymd(monthEnd(y, m - 1)),
        prevFrom: ymd(monthStart(y, m - 2)),
        prevTo: ymd(monthEnd(y, m - 2)),
        label: 'Last month',
      };

    case 'last-3-months':
      return {
        period,
        from: ymd(monthStart(y, m - 2)),
        to: ymd(monthEnd(y, m)),
        prevFrom: ymd(monthStart(y, m - 5)),
        prevTo: ymd(monthEnd(y, m - 3)),
        label: 'Last 3 months',
      };

    case 'this-year':
      return {
        period,
        from: ymd(monthStart(y, 0)),
        to: ymd(monthEnd(y, 11)),
        prevFrom: ymd(monthStart(y - 1, 0)),
        prevTo: ymd(monthEnd(y - 1, 11)),
        label: 'This year',
      };

    case 'custom': {
      const from = isIsoDay(fromParam) ? fromParam : ymd(monthStart(y, m));
      const to = isIsoDay(toParam) ? toParam : ymd(monthEnd(y, m));
      const fromD = new Date(`${from}T00:00:00Z`);
      const toD = new Date(`${to}T00:00:00Z`);
      const dayMs = 86_400_000;
      const prevTo = new Date(fromD.getTime() - dayMs);
      const prevFrom = new Date(prevTo.getTime() - (toD.getTime() - fromD.getTime()));
      return {
        period,
        from,
        to,
        prevFrom: ymd(prevFrom),
        prevTo: ymd(prevTo),
        label: `${from} – ${to}`,
      };
    }

    case 'this-month':
    default:
      return {
        period: 'this-month',
        from: ymd(monthStart(y, m)),
        to: ymd(monthEnd(y, m)),
        prevFrom: ymd(monthStart(y, m - 1)),
        prevTo: ymd(monthEnd(y, m - 1)),
        label: 'This month',
      };
  }
}
