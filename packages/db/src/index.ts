export * from './schema';
export * from './client';
export * from './types';
export * from './with-user-scope';

// Re-export Drizzle operators so consumers use one shared drizzle-orm instance.
export { and, asc, count, desc, eq, gte, isNull, lte, or, sql, sum, ilike, ne } from 'drizzle-orm';
