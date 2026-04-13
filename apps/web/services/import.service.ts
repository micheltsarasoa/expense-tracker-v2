import Papa from 'papaparse';
import type {
  Database,
  SelectCategory,
  SelectLabel,
  SelectPaymentMethod,
} from '@expense-tracker/db';
import { categories, labels, paymentMethods, eq, isNull, or } from '@expense-tracker/db';
import type { ImportResponse, ImportRowResult } from '@expense-tracker/types';
import { AppError } from '@expense-tracker/types';
import { createTransactionSchema } from '@expense-tracker/types';
import { BaseService } from './base.service';
import type { TransactionService } from './transaction.service';

interface EntityMaps {
  accounts: Map<string, string>;
  cats: Map<string, string>;
  labelMap: Map<string, string>;
}

const MAX_ROWS = 1000;

export class ImportService extends BaseService {
  constructor(
    db: Database,
    private readonly txService: TransactionService,
  ) {
    super(db);
  }

  async validate(
    userId: string,
    fileBuffer: ArrayBuffer,
    mimeType: string,
  ): Promise<ImportResponse> {
    const rows = this.#parseFile(fileBuffer, mimeType);
    if (rows.length > MAX_ROWS) {
      throw AppError.unprocessable(`Import exceeds ${MAX_ROWS} rows (got ${rows.length})`);
    }
    const maps = await this.#loadEntityMaps(userId);
    return this.#validateRows(rows, maps);
  }

  async commit(userId: string, fileBuffer: ArrayBuffer, mimeType: string): Promise<ImportResponse> {
    const rows = this.#parseFile(fileBuffer, mimeType);
    if (rows.length > MAX_ROWS) {
      throw AppError.unprocessable(`Import exceeds ${MAX_ROWS} rows (got ${rows.length})`);
    }
    const maps = await this.#loadEntityMaps(userId);
    const report = this.#validateRows(rows, maps);

    const validRows = rows.filter((_, i) => report.results[i]?.status === 'valid');
    if (validRows.length > 0) {
      await this.db.transaction(async () => {
        for (const row of validRows) {
          const raw = this.#mapRowToInput(row as Record<string, string>, maps);
          const parsed = createTransactionSchema.parse(raw);
          await this.txService.create(userId, parsed);
        }
      });
    }

    return report;
  }

  #parseFile(buffer: ArrayBuffer, mimeType: string): Record<string, string>[] {
    if (mimeType === 'text/csv' || mimeType === 'application/csv') {
      const text = new TextDecoder().decode(buffer);
      const result = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
      });
      return result.data;
    }
    throw AppError.unprocessable('Unsupported file type — only CSV is accepted');
  }

  async #loadEntityMaps(userId: string): Promise<EntityMaps> {
    const [accts, cats, lbls] = await Promise.all([
      this.db.select().from(paymentMethods).where(eq(paymentMethods.userId, userId)),
      this.db
        .select()
        .from(categories)
        .where(or(eq(categories.userId, userId), isNull(categories.userId))),
      this.db.select().from(labels).where(eq(labels.userId, userId)),
    ]);

    return {
      accounts: new Map((accts as SelectPaymentMethod[]).map((a) => [a.name.toLowerCase(), a.id])),
      cats: new Map((cats as SelectCategory[]).map((c) => [c.name.toLowerCase(), c.id])),
      labelMap: new Map((lbls as SelectLabel[]).map((l) => [l.name.toLowerCase(), l.id])),
    };
  }

  #validateRows(rows: Record<string, string>[], maps: EntityMaps): ImportResponse {
    const results: ImportRowResult[] = rows.map((row, i) => {
      const errors: string[] = [];

      const accountId = maps.accounts.get((row['account'] ?? '').toLowerCase());
      if (!accountId) errors.push(`account "${row['account']}" not found`);

      const type = row['type']?.toLowerCase();
      if (!type || !['income', 'expense', 'transfer'].includes(type)) {
        errors.push(`type must be income, expense, or transfer`);
      }

      const input = this.#mapRowToInput(row, maps);
      const parsed = createTransactionSchema.safeParse(input);
      if (!parsed.success) {
        parsed.error.errors.forEach((e) => errors.push(`${e.path.join('.')}: ${e.message}`));
      }

      return {
        row: i + 1,
        status: errors.length === 0 ? 'valid' : 'invalid',
        ...(errors.length > 0 ? { errors } : {}),
      } satisfies ImportRowResult;
    });

    return {
      total: rows.length,
      valid: results.filter((r) => r.status === 'valid').length,
      invalid: results.filter((r) => r.status === 'invalid').length,
      results,
    };
  }

  #mapRowToInput(row: Record<string, string>, maps: EntityMaps): Record<string, unknown> {
    const type = (row['type'] ?? '').toLowerCase();
    const accountId = maps.accounts.get((row['account'] ?? '').toLowerCase()) ?? '';
    const toAccountId = maps.accounts.get((row['toAccount'] ?? '').toLowerCase());
    const categoryId = maps.cats.get((row['category'] ?? '').toLowerCase());
    const labelId = maps.labelMap.get((row['label'] ?? '').toLowerCase());

    return {
      type,
      amount: row['amount'] ?? '',
      transactionDate: row['date'] ?? '',
      paymentMethodId: accountId,
      ...(type === 'transfer' ? { toPaymentMethodId: toAccountId } : { categoryId }),
      ...(row['description'] ? { description: row['description'] } : {}),
      ...(labelId ? { labelId } : {}),
    };
  }
}
