export interface ReportSpendingByCategoryDTO {
  categoryId: string | null;
  categoryName: string;
  total: string;
  pct: number;
}

export interface ReportIncomeVsExpensesDTO {
  month: string; // YYYY-MM
  income: string;
  expenses: string;
  net: string;
}

export interface ReportBalanceHistoryDTO {
  accountId: string;
  accountName: string;
  date: string; // YYYY-MM-DD
  runningBalance: string;
}

export interface ReportBudgetVsActualDTO {
  budgetId: string;
  name: string;
  amount: string;
  spent: string;
  remaining: string;
  pct: number;
}
