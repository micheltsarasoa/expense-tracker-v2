export const TEMPLATE_DATABASE = 'expense_tracker_template';

declare module 'vitest' {
  export interface ProvidedContext {
    testDatabaseUrl: string;
  }
}
