import { AppError } from '@expense-tracker/types';
import type { Database } from '@expense-tracker/db';

export abstract class BaseService {
  constructor(protected readonly db: Database) {}

  /** Throw NotFound if the row was not found (query already scoped by userId). */
  protected assertOwned<T>(row: T | null | undefined, id: string): asserts row is T {
    if (row == null) throw AppError.notFound(`Resource ${id} not found`);
  }

  /** Throw Forbidden if the row is a system default (cannot be modified). */
  protected assertNotSystem(row: { isDefault: boolean }): void {
    if (row.isDefault) throw AppError.forbidden('Cannot modify a system default');
  }
}
