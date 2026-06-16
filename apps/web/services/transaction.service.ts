import {
  categories,
  labels,
  paymentMethods,
  transactions,
  alias,
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  lte,
  sql,
} from '@expense-tracker/db';
import type { SelectTransaction } from '@expense-tracker/db';
import type {
  CreateTransactionInput,
  TransactionFilters,
  TransactionListItemDTO,
  UpdateTransactionInput,
} from '@expense-tracker/types';
import { AppError } from '@expense-tracker/types';
import { BaseService } from './base.service';
import { balanceDelta } from './balance-delta';
export { balanceDelta } from './balance-delta';

function negate(v: string): string {
  return v.startsWith('-') ? v.slice(1) : `-${v}`;
}

export class TransactionService extends BaseService {
  async list(
    userId: string,
    filters: TransactionFilters,
  ): Promise<{ data: TransactionListItemDTO[]; total: number }> {
    const conditions = [eq(transactions.userId, userId), eq(transactions.isDeleted, false)];

    if (filters.type !== undefined) conditions.push(eq(transactions.type, filters.type));
    if (filters.categoryId !== undefined)
      conditions.push(eq(transactions.categoryId, filters.categoryId));
    if (filters.labelId !== undefined) conditions.push(eq(transactions.labelId, filters.labelId));
    if (filters.paymentMethodId !== undefined)
      conditions.push(eq(transactions.paymentMethodId, filters.paymentMethodId));
    if (filters.from !== undefined)
      conditions.push(gte(transactions.transactionDate, filters.from));
    if (filters.to !== undefined) conditions.push(lte(transactions.transactionDate, filters.to));
    if (filters.isValidated !== undefined)
      conditions.push(eq(transactions.isValidated, filters.isValidated));

    const where = and(...conditions);
    const offset = (filters.page - 1) * filters.pageSize;

    // Self-join payment_methods twice: source (required → inner) and destination (optional → left).
    const pmFrom = alias(paymentMethods, 'pm_from');
    const pmTo = alias(paymentMethods, 'pm_to');

    const [data, [countRow]] = await Promise.all([
      this.db
        .select({
          id: transactions.id,
          type: transactions.type,
          amount: transactions.amount,
          transactionDate: transactions.transactionDate,
          description: transactions.description,
          isValidated: transactions.isValidated,
          categoryId: transactions.categoryId,
          labelId: transactions.labelId,
          paymentMethodId: transactions.paymentMethodId,
          toPaymentMethodId: transactions.toPaymentMethodId,
          categoryName: categories.name,
          categoryColor: categories.color,
          labelName: labels.name,
          paymentMethodName: pmFrom.name,
          toPaymentMethodName: pmTo.name,
        })
        .from(transactions)
        .innerJoin(pmFrom, eq(pmFrom.id, transactions.paymentMethodId))
        .leftJoin(pmTo, eq(pmTo.id, transactions.toPaymentMethodId))
        .leftJoin(categories, eq(categories.id, transactions.categoryId))
        .leftJoin(labels, eq(labels.id, transactions.labelId))
        .where(where)
        .orderBy(desc(transactions.transactionDate), asc(transactions.createdAt))
        .limit(filters.pageSize)
        .offset(offset),
      this.db.select({ n: count() }).from(transactions).where(where),
    ]);

    return { data, total: countRow?.n ?? 0 };
  }

  async findById(userId: string, id: string): Promise<SelectTransaction> {
    const [row] = await this.db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.id, id),
          eq(transactions.userId, userId),
          eq(transactions.isDeleted, false),
        ),
      )
      .limit(1);
    this.assertOwned(row, id);
    return row;
  }

  async create(userId: string, data: CreateTransactionInput): Promise<SelectTransaction> {
    const delta = balanceDelta(data.type, data.amount);

    return this.db.transaction(async (tx) => {
      const [row] = await tx
        .insert(transactions)
        .values({
          userId,
          type: data.type,
          amount: data.amount,
          transactionDate: data.transactionDate,
          paymentMethodId: data.paymentMethodId,
          ...(data.categoryId ? { categoryId: data.categoryId } : {}),
          ...(data.type === 'transfer' ? { toPaymentMethodId: data.toPaymentMethodId } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.labelId !== undefined ? { labelId: data.labelId } : {}),
        })
        .returning();
      if (!row) throw AppError.internal('Failed to insert transaction');

      await tx
        .update(paymentMethods)
        .set({ currentBalance: sql`current_balance + ${delta.fromDelta}` })
        .where(and(eq(paymentMethods.id, data.paymentMethodId), eq(paymentMethods.userId, userId)));

      if (data.type === 'transfer' && delta.toDelta !== null) {
        await tx
          .update(paymentMethods)
          .set({ currentBalance: sql`current_balance + ${delta.toDelta}` })
          .where(
            and(eq(paymentMethods.id, data.toPaymentMethodId), eq(paymentMethods.userId, userId)),
          );
      }

      return row;
    });
  }

  async update(
    userId: string,
    id: string,
    data: UpdateTransactionInput,
  ): Promise<SelectTransaction> {
    const existing = await this.findById(userId, id);

    return this.db.transaction(async (tx) => {
      // Reverse the old balance effect
      const oldDelta = balanceDelta(existing.type, existing.amount);
      await tx
        .update(paymentMethods)
        .set({ currentBalance: sql`current_balance + ${negate(oldDelta.fromDelta)}` })
        .where(
          and(eq(paymentMethods.id, existing.paymentMethodId), eq(paymentMethods.userId, userId)),
        );

      if (oldDelta.toDelta !== null && existing.toPaymentMethodId !== null) {
        await tx
          .update(paymentMethods)
          .set({ currentBalance: sql`current_balance + ${negate(oldDelta.toDelta)}` })
          .where(
            and(
              eq(paymentMethods.id, existing.toPaymentMethodId),
              eq(paymentMethods.userId, userId),
            ),
          );
      }

      // Build the full updated state
      const newType = data.type ?? existing.type;
      const newAmount = data.amount ?? existing.amount;
      const newPaymentMethodId = data.paymentMethodId ?? existing.paymentMethodId;
      const newToPaymentMethodId =
        'toPaymentMethodId' in data ? (data.toPaymentMethodId ?? null) : existing.toPaymentMethodId;

      // Apply the new balance effect
      const newDelta = balanceDelta(newType, newAmount);
      await tx
        .update(paymentMethods)
        .set({ currentBalance: sql`current_balance + ${newDelta.fromDelta}` })
        .where(and(eq(paymentMethods.id, newPaymentMethodId), eq(paymentMethods.userId, userId)));

      if (newDelta.toDelta !== null && newToPaymentMethodId !== null) {
        await tx
          .update(paymentMethods)
          .set({ currentBalance: sql`current_balance + ${newDelta.toDelta}` })
          .where(
            and(eq(paymentMethods.id, newToPaymentMethodId), eq(paymentMethods.userId, userId)),
          );
      }

      const [row] = await tx
        .update(transactions)
        .set({
          type: newType,
          amount: newAmount,
          paymentMethodId: newPaymentMethodId,
          toPaymentMethodId: newToPaymentMethodId,
          ...(data.transactionDate !== undefined ? { transactionDate: data.transactionDate } : {}),
          ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
          ...(data.labelId !== undefined ? { labelId: data.labelId } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
        })
        .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
        .returning();
      if (!row) throw AppError.internal('Failed to update transaction');
      return row;
    });
  }

  async delete(userId: string, id: string): Promise<void> {
    const existing = await this.findById(userId, id);

    await this.db.transaction(async (tx) => {
      const delta = balanceDelta(existing.type, existing.amount);

      await tx
        .update(paymentMethods)
        .set({ currentBalance: sql`current_balance + ${negate(delta.fromDelta)}` })
        .where(
          and(eq(paymentMethods.id, existing.paymentMethodId), eq(paymentMethods.userId, userId)),
        );

      if (delta.toDelta !== null && existing.toPaymentMethodId !== null) {
        await tx
          .update(paymentMethods)
          .set({ currentBalance: sql`current_balance + ${negate(delta.toDelta)}` })
          .where(
            and(
              eq(paymentMethods.id, existing.toPaymentMethodId),
              eq(paymentMethods.userId, userId),
            ),
          );
      }

      await tx
        .update(transactions)
        .set({ isDeleted: true })
        .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
    });
  }

  async toggleValidate(userId: string, id: string): Promise<SelectTransaction> {
    const existing = await this.findById(userId, id);
    const [row] = await this.db
      .update(transactions)
      .set({ isValidated: !existing.isValidated })
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning();
    if (!row) throw AppError.internal('Failed to toggle validation');
    return row;
  }
}
