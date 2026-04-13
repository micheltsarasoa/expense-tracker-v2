import { z } from 'zod';

const decimalAmount = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid positive decimal amount (e.g. 100.00)');

const transactionBase = z.object({
  amount: decimalAmount,
  transactionDate: z.string().date(),
  paymentMethodId: z.string().uuid(),
  description: z.string().max(500).optional(),
  labelId: z.string().uuid().optional(),
});

const incomeExpenseSchema = transactionBase.extend({
  type: z.enum(['income', 'expense']),
  categoryId: z.string().uuid(),
});

const transferBase = transactionBase.extend({
  type: z.literal('transfer'),
  toPaymentMethodId: z.string().uuid(),
});

export const createTransactionSchema = z
  .discriminatedUnion('type', [incomeExpenseSchema, transferBase])
  .refine((data) => data.type !== 'transfer' || data.paymentMethodId !== data.toPaymentMethodId, {
    message: 'Source and destination accounts must be different',
    path: ['toPaymentMethodId'],
  });

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

// Flat partial for updates — service validates business rules against existing row
export const updateTransactionSchema = z
  .object({
    type: z.enum(['income', 'expense', 'transfer']),
    amount: decimalAmount,
    transactionDate: z.string().date(),
    paymentMethodId: z.string().uuid(),
    toPaymentMethodId: z.string().uuid().nullable(),
    categoryId: z.string().uuid().nullable(),
    description: z.string().max(500).nullable(),
    labelId: z.string().uuid().nullable(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

export const transactionFiltersSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']).optional(),
  categoryId: z.string().uuid().optional(),
  labelId: z.string().uuid().optional(),
  paymentMethodId: z.string().uuid().optional(),
  from: z.string().date().optional(),
  to: z.string().date().optional(),
  // Query params arrive as strings — explicit transform instead of coerce.boolean()
  isValidated: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;
