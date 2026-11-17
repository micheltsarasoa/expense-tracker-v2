import { parseEnv } from '@/lib/env';

export function register(): void {
  parseEnv(process.env);
}
