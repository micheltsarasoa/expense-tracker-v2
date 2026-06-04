import { describe, it, expect } from 'vitest';
import { formatMoney, formatDate, type MoneyFormat } from './format';

const usd: MoneyFormat = {
  currencySymbol: '$',
  currencyPosition: 'before',
  decimalSeparator: '.',
  thousandSeparator: ',',
};

const eurFr: MoneyFormat = {
  currencySymbol: '€',
  currencyPosition: 'after',
  decimalSeparator: ',',
  thousandSeparator: '.',
};

describe('formatMoney', () => {
  it('formats symbol-before with dot decimal and comma thousands', () => {
    expect(formatMoney(1234.56, usd)).toBe('$1,234.56');
  });

  it('formats symbol-after with comma decimal and dot thousands', () => {
    expect(formatMoney(1234.56, eurFr)).toBe('1.234,56 €');
  });

  it('puts a leading minus before the symbol for negatives', () => {
    expect(formatMoney(-5.99, usd)).toBe('-$5.99');
    expect(formatMoney(-1234.5, eurFr)).toBe('-1.234,50 €');
  });

  it('accepts numeric(15,2) strings from DTOs', () => {
    expect(formatMoney('320.00', usd)).toBe('$320.00');
  });

  it('always renders exactly two decimals', () => {
    expect(formatMoney(5, usd)).toBe('$5.00');
  });

  it('groups multiple thousand boundaries', () => {
    expect(formatMoney(1234567.89, usd)).toBe('$1,234,567.89');
  });

  it('falls back to zero for non-numeric input', () => {
    expect(formatMoney('abc', usd)).toBe('$0.00');
  });
});

describe('formatDate', () => {
  it('renders each supported format from a YYYY-MM-DD string', () => {
    expect(formatDate('2026-12-01', 'DD/MM/YYYY')).toBe('01/12/2026');
    expect(formatDate('2026-12-01', 'MM/DD/YYYY')).toBe('12/01/2026');
    expect(formatDate('2026-12-01', 'YYYY-MM-DD')).toBe('2026-12-01');
  });

  it('ignores any time portion (no timezone drift)', () => {
    expect(formatDate('2026-12-01T23:00:00.000Z', 'DD/MM/YYYY')).toBe('01/12/2026');
  });
});
