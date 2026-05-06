import { labels, and, eq } from '@expense-tracker/db';
import type { SelectLabel } from '@expense-tracker/db';
import type { CreateLabelInput, UpdateLabelInput } from '@expense-tracker/types';
import { AppError } from '@expense-tracker/types';
import { BaseService } from './base.service';

export class LabelService extends BaseService {
  async list(userId: string): Promise<SelectLabel[]> {
    return this.db.select().from(labels).where(eq(labels.userId, userId));
  }

  async findById(userId: string, id: string): Promise<SelectLabel> {
    const [row] = await this.db
      .select()
      .from(labels)
      .where(and(eq(labels.id, id), eq(labels.userId, userId)))
      .limit(1);
    this.assertOwned(row, id);
    return row;
  }

  async create(userId: string, data: CreateLabelInput): Promise<SelectLabel> {
    const [row] = await this.db
      .insert(labels)
      .values({
        userId,
        name: data.name,
        ...(data.color !== undefined ? { color: data.color } : {}),
      })
      .returning();
    if (!row) throw AppError.internal('Failed to create label');
    return row;
  }

  async update(userId: string, id: string, data: UpdateLabelInput): Promise<SelectLabel> {
    await this.findById(userId, id);
    const [row] = await this.db
      .update(labels)
      .set(data)
      .where(and(eq(labels.id, id), eq(labels.userId, userId)))
      .returning();
    if (!row) throw AppError.internal('Failed to update label');
    return row;
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.findById(userId, id);
    await this.db.delete(labels).where(and(eq(labels.id, id), eq(labels.userId, userId)));
  }
}
