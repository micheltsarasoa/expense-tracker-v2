import {
  categories,
  transactions,
  and,
  asc,
  count,
  desc,
  eq,
  isNull,
  or,
} from '@expense-tracker/db';
import type { SelectCategory } from '@expense-tracker/db';
import type { CreateCategoryInput, UpdateCategoryInput } from '@expense-tracker/types';
import { AppError } from '@expense-tracker/types';
import { BaseService } from './base.service';

export class CategoryService extends BaseService {
  /** Returns user's own categories AND system defaults (userId IS NULL). */
  async list(userId: string): Promise<SelectCategory[]> {
    return this.db
      .select()
      .from(categories)
      .where(or(eq(categories.userId, userId), isNull(categories.userId)))
      .orderBy(desc(categories.isDefault), asc(categories.name));
  }

  async findById(userId: string, id: string): Promise<SelectCategory> {
    const [row] = await this.db
      .select()
      .from(categories)
      .where(
        and(eq(categories.id, id), or(eq(categories.userId, userId), isNull(categories.userId))),
      )
      .limit(1);
    this.assertOwned(row, id);
    return row;
  }

  async create(userId: string, data: CreateCategoryInput): Promise<SelectCategory> {
    if (data.parentId !== undefined) {
      const parent = await this.findById(userId, data.parentId);
      if (parent.parentId !== null) {
        throw AppError.unprocessable('Parent category must be a root-level category');
      }
      if (parent.type !== data.type) {
        throw AppError.unprocessable('Subcategory type must match parent type');
      }
    }
    const [row] = await this.db
      .insert(categories)
      .values({
        userId,
        name: data.name,
        type: data.type,
        ...(data.parentId !== undefined ? { parentId: data.parentId } : {}),
        ...(data.icon !== undefined ? { icon: data.icon } : {}),
        ...(data.color !== undefined ? { color: data.color } : {}),
      })
      .returning();
    if (!row) throw AppError.internal('Failed to create category');
    return row;
  }

  async update(userId: string, id: string, data: UpdateCategoryInput): Promise<SelectCategory> {
    const existing = await this.findById(userId, id);
    this.assertNotSystem(existing);
    const [row] = await this.db
      .update(categories)
      .set(data)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();
    if (!row) throw AppError.internal('Failed to update category');
    return row;
  }

  async delete(userId: string, id: string): Promise<void> {
    const existing = await this.findById(userId, id);
    this.assertNotSystem(existing);

    const [result] = await this.db
      .select({ n: count() })
      .from(transactions)
      .where(and(eq(transactions.categoryId, id), eq(transactions.isDeleted, false)));

    if ((result?.n ?? 0) > 0) {
      throw AppError.conflict('Cannot delete a category that has transactions');
    }

    await this.db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));
  }
}
