import { paymentMethods, transactions, and, count, eq } from '@expense-tracker/db';
import type { SelectPaymentMethod } from '@expense-tracker/db';
import type { CreatePaymentMethodInput, UpdatePaymentMethodInput } from '@expense-tracker/types';
import { AppError } from '@expense-tracker/types';
import { BaseService } from './base.service';

export interface DeactivateOrDeleteResult {
  action: 'deactivated' | 'deleted';
}

export class PaymentMethodService extends BaseService {
  async list(userId: string, includeInactive = false): Promise<SelectPaymentMethod[]> {
    const conditions = includeInactive
      ? eq(paymentMethods.userId, userId)
      : and(eq(paymentMethods.userId, userId), eq(paymentMethods.isActive, true));
    return this.db.select().from(paymentMethods).where(conditions);
  }

  async findById(userId: string, id: string): Promise<SelectPaymentMethod> {
    const [row] = await this.db
      .select()
      .from(paymentMethods)
      .where(and(eq(paymentMethods.id, id), eq(paymentMethods.userId, userId)))
      .limit(1);
    this.assertOwned(row, id);
    return row;
  }

  async create(userId: string, data: CreatePaymentMethodInput): Promise<SelectPaymentMethod> {
    const initialBalance = data.initialBalance ?? '0.00';
    const [row] = await this.db
      .insert(paymentMethods)
      .values({
        userId,
        name: data.name,
        type: data.type,
        initialBalance,
        currentBalance: initialBalance,
        ...(data.icon !== undefined ? { icon: data.icon } : {}),
        ...(data.color !== undefined ? { color: data.color } : {}),
      })
      .returning();
    if (!row) throw AppError.internal('Failed to create payment method');
    return row;
  }

  async update(
    userId: string,
    id: string,
    data: UpdatePaymentMethodInput,
  ): Promise<SelectPaymentMethod> {
    await this.findById(userId, id);
    const [row] = await this.db
      .update(paymentMethods)
      .set(data)
      .where(and(eq(paymentMethods.id, id), eq(paymentMethods.userId, userId)))
      .returning();
    if (!row) throw AppError.internal('Failed to update payment method');
    return row;
  }

  /** Soft-deactivates if transactions exist; hard-deletes otherwise. */
  async deactivateOrDelete(userId: string, id: string): Promise<DeactivateOrDeleteResult> {
    await this.findById(userId, id);

    const [result] = await this.db
      .select({ n: count() })
      .from(transactions)
      .where(eq(transactions.paymentMethodId, id));

    if ((result?.n ?? 0) > 0) {
      await this.db
        .update(paymentMethods)
        .set({ isActive: false })
        .where(and(eq(paymentMethods.id, id), eq(paymentMethods.userId, userId)));
      return { action: 'deactivated' };
    }

    await this.db
      .delete(paymentMethods)
      .where(and(eq(paymentMethods.id, id), eq(paymentMethods.userId, userId)));
    return { action: 'deleted' };
  }
}
