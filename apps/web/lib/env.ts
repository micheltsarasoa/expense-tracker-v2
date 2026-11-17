import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1)
    .regex(/^postgres(ql)?:\/\//, 'must start with postgres:// or postgresql://'),
  NEXT_PUBLIC_STACK_PROJECT_ID: z.string().uuid(),
  NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: z.string().min(1),
  STACK_SECRET_SERVER_KEY: z.string().min(1),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

export class EnvError extends Error {
  constructor(
    readonly variables: string[],
    details: string[],
  ) {
    super(`Invalid environment: ${details.join('; ')}. See .env.example.`);
    this.name = 'EnvError';
  }
}

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (result.success) return result.data;

  const issues = result.error.issues;
  const variables = [...new Set(issues.map((issue) => String(issue.path[0])))];
  const details = issues.map((issue) => `${String(issue.path[0])} ${issue.message.toLowerCase()}`);
  throw new EnvError(variables, details);
}
