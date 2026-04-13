import { eq } from 'drizzle-orm';
import type { Column } from 'drizzle-orm';

/**
 * Returns a userId partial for inserts and a filter helper for WHERE clauses.
 *
 * Insert:  db.insert(transactions).values({ ...withUserScope(userId), ...rest })
 * Select:  db.select().from(transactions).where(scope.filter(transactions.userId))
 */
export function withUserScope(userId: string) {
  return {
    userId,
    filter: (column: Column) => eq(column, userId),
  };
}
