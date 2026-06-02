import type { PaymentMethodDTO } from './payment-method';
import type { TransactionListItemDTO } from './transaction';
import type { BudgetWithSpendingDTO } from './budget';
import type { ReportSpendingByCategoryDTO, ReportIncomeVsExpensesDTO } from './report';

/**
 * Composed shape for the dashboard. The RSC fetches each slice in parallel; this
 * type also seeds a future `GET /api/v1/dashboard` aggregate if we add one.
 * Amounts are numeric(15,2) strings.
 */
export interface DashboardDTO {
  accounts: PaymentMethodDTO[];
  totalBalance: string;
  income: string; // selected period
  expense: string;
  net: string;
  previousIncome: string; // prior comparable period
  previousExpense: string;
  recentTransactions: TransactionListItemDTO[];
  budgetStatus: BudgetWithSpendingDTO[];
  spendingByCategory: ReportSpendingByCategoryDTO[];
  monthlyTrend: ReportIncomeVsExpensesDTO[];
}
