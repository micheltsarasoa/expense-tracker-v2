/** Pure helper — no DB dependency. Exported separately for testability. */
export function balanceDelta(
  type: 'income' | 'expense' | 'transfer',
  amount: string,
): { fromDelta: string; toDelta: string | null } {
  switch (type) {
    case 'income':
      return { fromDelta: amount, toDelta: null };
    case 'expense':
      return { fromDelta: `-${amount}`, toDelta: null };
    case 'transfer':
      return { fromDelta: `-${amount}`, toDelta: amount };
  }
}
