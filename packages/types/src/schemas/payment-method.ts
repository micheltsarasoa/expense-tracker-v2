import { z } from 'zod';

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a hex color like #FF0000');

const decimalAmount = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid decimal amount (e.g. 100.00)');

export const createPaymentMethodSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['cash', 'bank_account', 'credit_card', 'debit_card', 'digital_wallet', 'other']),
  initialBalance: decimalAmount.optional(),
  icon: z.string().max(50).optional(),
  color: hexColor.optional(),
});

export type CreatePaymentMethodInput = z.infer<typeof createPaymentMethodSchema>;

// initialBalance excluded — immutable after create
export const updatePaymentMethodSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  icon: z.string().max(50).optional(),
  color: hexColor.optional(),
  isActive: z.boolean().optional(),
});

export type UpdatePaymentMethodInput = z.infer<typeof updatePaymentMethodSchema>;
