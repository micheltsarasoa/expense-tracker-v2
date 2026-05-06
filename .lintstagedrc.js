/** @type {import('lint-staged').Config} */
export default {
  // ESLint only runs where a config exists (apps/web); packages get ESLint in Phase 4
  'apps/web/**/*.{ts,tsx}': [
    'eslint --config apps/web/eslint.config.mjs --fix --max-warnings 0',
    'prettier --write',
  ],
  'packages/**/*.ts': ['prettier --write'],
  '**/*.{js,mjs,cjs,json,md,yaml,yml}': ['prettier --write'],
};
