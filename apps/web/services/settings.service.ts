import { userSettings, eq } from '@expense-tracker/db';
import type { SelectUserSettings } from '@expense-tracker/db';
import type { UpdateSettingsInput } from '@expense-tracker/types';
import { AppError } from '@expense-tracker/types';
import { BaseService } from './base.service';

export class SettingsService extends BaseService {
  async getByUserId(userId: string): Promise<SelectUserSettings> {
    const [row] = await this.db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);
    if (!row) throw AppError.notFound('Settings not found');
    return row;
  }

  async upsert(userId: string, data: UpdateSettingsInput): Promise<SelectUserSettings> {
    const [row] = await this.db
      .insert(userSettings)
      .values({ userId, ...data })
      .onConflictDoUpdate({ target: userSettings.userId, set: data })
      .returning();
    if (!row) throw AppError.internal('Failed to upsert settings');
    return row;
  }
}
