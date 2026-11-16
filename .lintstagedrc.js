/** @type {import('lint-staged').Config} */
export default {
  'apps/web/**/*.{ts,tsx}': [
    'eslint --config apps/web/eslint.config.mjs --fix --max-warnings 0',
    'prettier --write',
  ],
  'packages/db/**/*.ts': [
    'eslint --config packages/db/eslint.config.mjs --fix --max-warnings 0',
    'prettier --write',
  ],
  'packages/types/**/*.ts': [
    'eslint --config packages/types/eslint.config.mjs --fix --max-warnings 0',
    'prettier --write',
  ],
  '**/*.{js,mjs,cjs,json,md,yaml,yml}': ['prettier --write'],
};
