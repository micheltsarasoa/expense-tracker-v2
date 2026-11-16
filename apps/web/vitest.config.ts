import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

const alias = { '@': resolve(import.meta.dirname, '.') };

export default defineConfig({
  resolve: { alias },
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: 'unit',
          environment: 'node',
          globals: true,
          include: ['**/*.test.ts'],
          exclude: ['**/*.db.test.ts', 'node_modules/**', '.next/**'],
        },
      },
      {
        resolve: { alias },
        test: {
          name: 'db',
          environment: 'node',
          globals: true,
          include: ['**/*.db.test.ts'],
          exclude: ['node_modules/**', '.next/**'],
          globalSetup: ['@expense-tracker/test-utils/global-setup'],
          hookTimeout: 120_000,
          testTimeout: 30_000,
        },
      },
    ],
  },
});
