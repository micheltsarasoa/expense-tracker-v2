/**
 * A budget enriched with computed spending. `spent`/`remaining`/`amount` are
 * numeric(15,2) strings; `pct` is clamped to 0..999. Category name/color are
 * resolved server-side via join.
 */
export interface BudgetWithSpendingDTO {
  id: string;
  name: string;
  amount: string;
  spent: string;
  remaining: string; // may be negative (over budget)
  pct: number; // 0..999, clamped
  startDate: string; // YYYY-MM-DD
  endDate: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  labelId: string | null;
  labelName: string | null;
  isActive: boolean;
}
