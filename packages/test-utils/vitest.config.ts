import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globalSetup: ['./src/global-setup.ts'],
    hookTimeout: 120_000,
    testTimeout: 30_000,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // The global setup runs in Vitest's main process, outside coverage; every test exercises it.
      exclude: ['src/**/*.test.ts', 'src/global-setup.ts'],
      reporter: ['text-summary', 'json-summary', 'lcov'],
      thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
    },
  },
});
