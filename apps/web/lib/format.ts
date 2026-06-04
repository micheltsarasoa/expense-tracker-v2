/**
 * Display-only formatting helpers, driven by the user's settings. Money stays a
 * string end-to-end and is parsed once at the leaf for rendering; components
 * should use the bound `money`/`date` from `useFormat()` rather than calling
 * these directly.
 */

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
