// Shared ESLint config for every packages/* workspace.
import tseslint from 'typescript-eslint';

import { boundaries } from './boundaries.mjs';

export default tseslint.config(...tseslint.configs.recommended, boundaries, {
  ignores: ['dist/**', 'migrations/**', 'node_modules/**', 'coverage/**'],
});
