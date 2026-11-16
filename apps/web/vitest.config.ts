import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

const alias = { '@': resolve(import.meta.dirname, '.') };

export default defineConfig({
  resolve: { alias },
  test: {
    coverage: {
      provider: 'v8',
      include: ['{app,lib,services,components,hooks}/**/*.{ts,tsx}'],
      exclude: ['**/*.test.ts', '**/__tests__/**', 'components/ui/**'],
      reporter: ['text-summary', 'json-summary', 'lcov'],
      // Ratchet (P0-33): the floor only goes up. Vitest raises these numbers when coverage grows;
      // commit the change. Target before 1.0: 80 % (D-26, D-39).
      thresholds: {
        autoUpdate: true,
        statements: 12.5,
        branches: 6.96,
        functions: 11.78,
        lines: 13.08,
      },
    },
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
