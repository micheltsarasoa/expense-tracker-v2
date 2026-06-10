import { budgets, categories, transactions, and, eq, sql } from '@expense-tracker/db';
import { BaseService } from './base.service';

export interface SpendingByCategory {
  categoryId: string | null;
  categoryName: string;
  total: string;
  pct: number;
}

export interface IncomeVsExpenses {
  month: string;
  income: string;
  expenses: string;
  net: string;
}

export interface BalanceHistoryPoint {
  accountId: string;
  accountName: string;
  date: string;
  runningBalance: string;
}

export interface BudgetVsActual {
  budgetId: string;
  name: string;
  amount: string;
  spent: string;
  remaining: string;
  pct: number;
}

export class ReportService extends BaseService {
  async spendingByCategory(
    userId: string,
    from: string,
    to: string,
  ): Promise<SpendingByCategory[]> {
    const rows = await this.db
      .select({
        categoryId: transactions.categoryId,
        categoryName: sql<string>`COALESCE(${categories.name}, 'Uncategorized')`,
        total: sql<string>`SUM(${transactions.amount}::numeric)::text`,
      })
      .from(transactions)
      .leftJoin(categories, eq(categories.id, transactions.categoryId))
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'expense'),
          eq(transactions.isDeleted, false),
          sql`${transactions.transactionDate} >= ${from}`,
          sql`${transactions.transactionDate} <= ${to}`,
        ),
      )
      .groupBy(transactions.categoryId, categories.name);

    const grandTotal = rows.reduce((sum, r) => sum + parseFloat(r.total), 0);

    return rows.map((r) => ({
      categoryId: r.categoryId,
      categoryName: r.categoryName,
      total: r.total,
      pct: grandTotal > 0 ? Math.round((parseFloat(r.total) / grandTotal) * 100) : 0,
    }));
  }

  async incomeVsExpenses(userId: string, from: string, to: string): Promise<IncomeVsExpenses[]> {
    const rows = await this.db
      .select({
        month: sql<string>`TO_CHAR(DATE_TRUNC('month', ${transactions.transactionDate}::timestamp), 'YYYY-MM')`,
        income: sql<string>`SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount}::numeric ELSE 0 END)::text`,
        expenses: sql<string>`SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount}::numeric ELSE 0 END)::text`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.isDeleted, false),
          sql`${transactions.transactionDate} >= ${from}`,
          sql`${transactions.transactionDate} <= ${to}`,
        ),
      )
      .groupBy(sql`DATE_TRUNC('month', ${transactions.transactionDate}::timestamp)`)
      .orderBy(sql`DATE_TRUNC('month', ${transactions.transactionDate}::timestamp)`);

    return rows.map((r) => ({
      month: r.month,
      income: r.income,
      expenses: r.expenses,
      net: (parseFloat(r.income) - parseFloat(r.expenses)).toFixed(2),
    }));
  }

  async balanceHistory(userId: string): Promise<BalanceHistoryPoint[]> {
    const rows = await this.db.execute<{
      account_id: string;
      account_name: string;
      date: string;
      running_balance: string;
    }>(sql`
      SELECT
        pm.id AS account_id,
        pm.name AS account_name,
        t.transaction_date AS date,
        SUM(CASE
          WHEN t.type = 'income' AND t.payment_method_id = pm.id THEN t.amount::numeric
          WHEN t.type = 'expense' AND t.payment_method_id = pm.id THEN -t.amount::numeric
          WHEN t.type = 'transfer' AND t.payment_method_id = pm.id THEN -t.amount::numeric
          WHEN t.type = 'transfer' AND t.to_payment_method_id = pm.id THEN t.amount::numeric
          ELSE 0
        END) OVER (PARTITION BY pm.id ORDER BY t.transaction_date) + pm.initial_balance::numeric AS running_balance
      FROM payment_methods pm
      JOIN transactions t
        ON t.user_id = pm.user_id
        AND (t.payment_method_id = pm.id OR t.to_payment_method_id = pm.id)
        AND t.is_deleted = FALSE
      WHERE pm.user_id = ${userId}
      ORDER BY pm.id, t.transaction_date
    `);

    return rows.rows.map((r) => ({
      accountId: r.account_id,
      accountName: r.account_name,
      date: r.date,
      runningBalance: r.running_balance,
    }));
  }

  async budgetVsActual(userId: string, from: string, to: string): Promise<BudgetVsActual[]> {
    const rows = await this.db
      .select({
        name: budgets.name,
        amount: budgets.amount,
        spent: sql<string>`COALESCE(SUM(CASE
          WHEN ${transactions.isDeleted} = FALSE
            AND ${transactions.type} = 'expense'
            AND ${transactions.transactionDate} >= ${budgets.startDate}
            AND (${budgets.endDate} IS NULL OR ${transactions.transactionDate} <= ${budgets.endDate})
            AND ${transactions.transactionDate} >= ${from}
            AND ${transactions.transactionDate} <= ${to}
            AND (${budgets.categoryId} IS NULL OR ${transactions.categoryId} = ${budgets.categoryId})
          THEN ${transactions.amount}::numeric
          ELSE 0
        END), 0)::text`,
      })
      .from(budgets)
      .leftJoin(transactions, eq(transactions.userId, budgets.userId))
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.isActive, true),
          sql`${budgets.startDate} <= ${to}`,
          sql`(${budgets.endDate} IS NULL OR ${budgets.endDate} >= ${from})`,
        ),
      )
      .groupBy(budgets.id, budgets.name, budgets.amount);

    const byName = new Map<string, { amount: number; spent: number }>();
    for (const r of rows) {
      const acc = byName.get(r.name) ?? { amount: 0, spent: 0 };
      acc.amount += parseFloat(r.amount);
      acc.spent += parseFloat(r.spent);
      byName.set(r.name, acc);
    }

    return Array.from(byName, ([name, { amount, spent }]) => ({
      budgetId: name,
      name,
      amount: amount.toFixed(2),
      spent: spent.toFixed(2),
      remaining: (amount - spent).toFixed(2),
      pct: Math.min(amount > 0 ? Math.round((spent / amount) * 100) : 0, 999),
    }));
  }
}
