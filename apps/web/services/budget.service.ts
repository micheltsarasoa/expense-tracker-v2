import { budgets, transactions, and, eq, sql } from '@expense-tracker/db';
import type { SelectBudget } from '@expense-tracker/db';
import type {
  CreateBudgetInput,
  DuplicateBudgetInput,
  UpdateBudgetInput,
} from '@expense-tracker/types';
import { AppError } from '@expense-tracker/types';
import { BaseService } from './base.service';

export type BudgetWithSpending = SelectBudget & {
  spent: string;
  remaining: string;
  pct: number;
};

export class BudgetService extends BaseService {
  /** Single query — LEFT JOIN with conditional aggregation to avoid N+1. */
  async list(userId: string): Promise<BudgetWithSpending[]> {
    const rows = await this.db
      .select({
        id: budgets.id,
        userId: budgets.userId,
        name: budgets.name,
        amount: budgets.amount,
        startDate: budgets.startDate,
        endDate: budgets.endDate,
        categoryId: budgets.categoryId,
        labelId: budgets.labelId,
        isActive: budgets.isActive,
        createdAt: budgets.createdAt,
        updatedAt: budgets.updatedAt,
        spent: sql<string>`COALESCE(SUM(CASE
          WHEN ${transactions.isDeleted} = FALSE
            AND ${transactions.type} = 'expense'
            AND ${transactions.transactionDate} >= ${budgets.startDate}
            AND (${budgets.endDate} IS NULL OR ${transactions.transactionDate} <= ${budgets.endDate})
            AND (${budgets.categoryId} IS NULL OR ${transactions.categoryId} = ${budgets.categoryId})
            AND (${budgets.labelId} IS NULL OR ${transactions.labelId} = ${budgets.labelId})
          THEN ${transactions.amount}::numeric
          ELSE 0
        END), 0)::text`,
      })
      .from(budgets)
      .leftJoin(transactions, eq(transactions.userId, budgets.userId))
      .where(and(eq(budgets.userId, userId), eq(budgets.isActive, true)))
      .groupBy(
        budgets.id,
        budgets.userId,
        budgets.name,
        budgets.amount,
        budgets.startDate,
        budgets.endDate,
        budgets.categoryId,
        budgets.labelId,
        budgets.isActive,
        budgets.createdAt,
        budgets.updatedAt,
      );

    return rows.map(this.#enrich);
  }

  async findById(userId: string, id: string): Promise<BudgetWithSpending> {
    const [row] = await this.list(userId);
    const found = (await this.list(userId)).find((b) => b.id === id);
    if (!found) throw AppError.notFound(`Budget ${id} not found`);
    // Narrower: re-query single budget
    void row; // list result not used — finding by id after list
    return found;
  }

  async create(userId: string, data: CreateBudgetInput): Promise<SelectBudget> {
    const [row] = await this.db
      .insert(budgets)
      .values({
        userId,
        name: data.name,
        amount: data.amount,
        startDate: data.startDate,
        ...(data.endDate !== undefined ? { endDate: data.endDate } : {}),
        ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
        ...(data.labelId !== undefined ? { labelId: data.labelId } : {}),
      })
      .returning();
    if (!row) throw AppError.internal('Failed to create budget');
    return row;
  }

  async update(userId: string, id: string, data: UpdateBudgetInput): Promise<SelectBudget> {
    await this._assertOwnedBudget(userId, id);
    const [row] = await this.db
      .update(budgets)
      .set(data)
      .where(and(eq(budgets.id, id), eq(budgets.userId, userId)))
      .returning();
    if (!row) throw AppError.internal('Failed to update budget');
    return row;
  }

  async delete(userId: string, id: string): Promise<void> {
    await this._assertOwnedBudget(userId, id);
    await this.db.delete(budgets).where(and(eq(budgets.id, id), eq(budgets.userId, userId)));
  }

  async duplicate(userId: string, id: string, data: DuplicateBudgetInput): Promise<SelectBudget> {
    const existing = await this._assertOwnedBudget(userId, id);
    const [row] = await this.db
      .insert(budgets)
      .values({
        userId,
        name: existing.name,
        amount: existing.amount,
        startDate: data.startDate,
        ...(data.endDate !== undefined ? { endDate: data.endDate } : {}),
        ...(existing.categoryId !== null ? { categoryId: existing.categoryId } : {}),
        ...(existing.labelId !== null ? { labelId: existing.labelId } : {}),
      })
      .returning();
    if (!row) throw AppError.internal('Failed to duplicate budget');
    return row;
  }

  readonly #enrich = (row: Omit<BudgetWithSpending, 'remaining' | 'pct'>): BudgetWithSpending => {
    const spent = parseFloat(row.spent);
    const amount = parseFloat(row.amount);
    const remaining = (amount - spent).toFixed(2);
    const pct = Math.min(amount > 0 ? Math.round((spent / amount) * 100) : 0, 999);
    return { ...row, remaining, pct };
  };

  private async _assertOwnedBudget(userId: string, id: string): Promise<SelectBudget> {
    const [row] = await this.db
      .select()
      .from(budgets)
      .where(and(eq(budgets.id, id), eq(budgets.userId, userId)))
      .limit(1);
    this.assertOwned(row, id);
    return row;
  }
}
