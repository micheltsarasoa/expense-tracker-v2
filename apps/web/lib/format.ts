/**
 * Display-only formatting helpers. Money stays a string end-to-end; these parse
 * once at the leaf for rendering. A future settings-driven variant can replace
 * these with `formatAmount`/`formatDate` from @expense-tracker/types.
 */

/** Render a numeric(15,2) string as a euro amount, e.g. "320.00" → "€320.00". */
export function eur(value: string): string {
  return `€${parseFloat(value).toFixed(2)}`;
}

export interface MoneyFormat {
  currencySymbol: string;
  currencyPosition: 'before' | 'after';
  decimalSeparator: string;
  thousandSeparator: string;
}

/**
 * Format an amount with the user's currency settings. Accepts a numeric(15,2)
 * string or a number; formats the value with its natural sign (a leading "-"
 * for negatives), so callers that render their own +/- prefix should pass a
 * positive magnitude. Always two decimals.
 */
export function formatMoney(value: number | string, fmt: MoneyFormat): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  const safe = Number.isFinite(num) ? num : 0;
  const sign = safe < 0 ? '-' : '';
  const [int = '0', dec = '00'] = Math.abs(safe).toFixed(2).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, fmt.thousandSeparator);
  const body = `${grouped}${fmt.decimalSeparator}${dec}`;
  const withSymbol =
    fmt.currencyPosition === 'before'
      ? `${fmt.currencySymbol}${body}`
      : `${body} ${fmt.currencySymbol}`;
  return `${sign}${withSymbol}`;
}

export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

/**
 * Render an ISO `YYYY-MM-DD` in the user's configured `dateFormat` setting.
 * Purely string slicing — no `Date`, so no timezone drift.
 */
export function formatDate(iso: string, fmt: DateFormat = 'YYYY-MM-DD'): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  if (!y || !m || !d) return iso;
  switch (fmt) {
    case 'DD/MM/YYYY':
      return `${d}/${m}/${y}`;
    case 'MM/DD/YYYY':
      return `${m}/${d}/${y}`;
    default:
      return `${y}-${m}-${d}`;
  }
}

/** Format an ISO `YYYY-MM-DD` as "1 Apr 2026" without timezone drift. */
export function formatDay(iso: string): string {
  const parts = iso.split('-');
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!y || !m || !d) return iso;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
