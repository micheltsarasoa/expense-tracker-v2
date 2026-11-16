import { describe, expect, it } from 'vitest';

import { EnvError, parseEnv } from './env';

const valid = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/expense_tracker',
  NEXT_PUBLIC_STACK_PROJECT_ID: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: 'pck_example',
  STACK_SECRET_SERVER_KEY: 'ssk_example',
};

describe('parseEnv', () => {
  it('accepts a complete environment and defaults LOG_LEVEL to info', () => {
    expect(parseEnv(valid)).toEqual({ ...valid, LOG_LEVEL: 'info' });
  });

  it('names the missing variable', () => {
    const rest: Record<string, string | undefined> = { ...valid, DATABASE_URL: undefined };
    expect(() => parseEnv(rest)).toThrow(EnvError);
    expect(() => parseEnv(rest)).toThrow(/DATABASE_URL/);
  });

  it('rejects a DATABASE_URL that is not a postgres URL', () => {
    expect(() => parseEnv({ ...valid, DATABASE_URL: 'mysql://x' })).toThrow(/DATABASE_URL/);
  });

  it('rejects an unknown LOG_LEVEL', () => {
    expect(() => parseEnv({ ...valid, LOG_LEVEL: 'loud' })).toThrow(/LOG_LEVEL/);
  });

  it('never prints secret values in the error', () => {
    const bad = { ...valid, STACK_SECRET_SERVER_KEY: '' };
    expect(() => parseEnv(bad)).toThrow(EnvError);
    try {
      parseEnv({ ...bad, DATABASE_URL: 'postgresql://user:hunter2@db/x', LOG_LEVEL: 'loud' });
    } catch (error) {
      expect(String(error)).not.toContain('hunter2');
    }
  });
});
