import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ESLint } from 'eslint';

import packageConfig from '../eslint/package.mjs';

const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: packageConfig });

async function errorsFor(code) {
  const [result] = await eslint.lintText(code, { filePath: 'src/witness.ts' });
  return result.messages.filter((message) => message.ruleId === 'no-restricted-imports');
}

test('a package may import another package', async () => {
  assert.equal(
    (await errorsFor("import { db } from '@expense-tracker/db';\nexport { db };\n")).length,
    0,
  );
});

test('a package may not import an app by name', async () => {
  assert.equal(
    (await errorsFor("import x from '@expense-tracker/web/lib/env';\nexport { x };\n")).length,
    1,
  );
});

test('a package may not import an app by relative path', async () => {
  assert.equal(
    (await errorsFor("import x from '../../apps/web/lib/env';\nexport { x };\n")).length,
    1,
  );
});
