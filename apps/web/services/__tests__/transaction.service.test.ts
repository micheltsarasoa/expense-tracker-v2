import { describe, it, expect } from 'vitest';
import { balanceDelta } from '../balance-delta';

describe('balanceDelta', () => {
  it('income: fromDelta = +amount, toDelta = null', () => {
    const result = balanceDelta('income', '4500.00');
    expect(result).toEqual({ fromDelta: '4500.00', toDelta: null });
  });

  it('expense: fromDelta = -amount, toDelta = null', () => {
    const result = balanceDelta('expense', '120.50');
    expect(result).toEqual({ fromDelta: '-120.50', toDelta: null });
  });

  it('transfer: fromDelta = -amount, toDelta = +amount', () => {
    const result = balanceDelta('transfer', '500.00');
    expect(result).toEqual({ fromDelta: '-500.00', toDelta: '500.00' });
  });

  it('handles amounts with no decimals', () => {
    const result = balanceDelta('expense', '100');
    expect(result.fromDelta).toBe('-100');
    expect(result.toDelta).toBeNull();
  });
});
