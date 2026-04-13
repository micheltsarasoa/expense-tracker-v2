import { z } from 'zod';

export const importRowSchema = z.object({
  date: z.string(),
  type: z.string(),
  amount: z.string(),
  account: z.string(),
  category: z.string().optional(),
  toAccount: z.string().optional(),
  label: z.string().optional(),
  description: z.string().optional(),
});

export type ImportRow = z.infer<typeof importRowSchema>;

export const importRowResultSchema = z.object({
  row: z.number().int(),
  status: z.enum(['valid', 'invalid']),
  errors: z.array(z.string()).optional(),
  data: importRowSchema.optional(),
});

export type ImportRowResult = z.infer<typeof importRowResultSchema>;

export const importResponseSchema = z.object({
  total: z.number().int(),
  valid: z.number().int(),
  invalid: z.number().int(),
  results: z.array(importRowResultSchema),
});

export type ImportResponse = z.infer<typeof importResponseSchema>;
