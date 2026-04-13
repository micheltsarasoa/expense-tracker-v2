/** Minimal settings shape needed for formatting — structurally compatible with SelectUserSettings. */
interface AmountFormatOptions {
  currencySymbol: string;
  currencyPosition: string;
  decimalSeparator: string;
  thousandSeparator: string;
}

interface DateFormatOptions {
  dateFormat: string;
}

interface DateTimeFormatOptions extends DateFormatOptions {
  timeFormat: string;
}

export function formatAmount(amount: number | string, settings: AmountFormatOptions): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const parts = num.toFixed(2).split('.');
  const intPart = parts[0] ?? '0';
  const decPart = parts[1] ?? '00';

  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, settings.thousandSeparator);
  const formatted = `${formattedInt}${settings.decimalSeparator}${decPart}`;

  return settings.currencyPosition === 'before'
    ? `${settings.currencySymbol}${formatted}`
    : `${formatted}${settings.currencySymbol}`;
}

export function formatDate(date: string, settings: DateFormatOptions): string {
  const d = new Date(date);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = String(d.getUTCFullYear());

  return settings.dateFormat.replace('DD', day).replace('MM', month).replace('YYYY', year);
}

export function formatDateTime(datetime: string, settings: DateTimeFormatOptions): string {
  const d = new Date(datetime);
  const dateStr = formatDate(datetime, settings);

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');

  if (settings.timeFormat === '12h') {
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${dateStr} ${String(hours)}:${minutes} ${period}`;
  }

  return `${dateStr} ${String(hours).padStart(2, '0')}:${minutes}`;
}
