import { z } from 'zod';

const decimalAmount = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid positive decimal amount (e.g. 100.00)');

const endAfterStart = { message: 'End date must be after start date', path: ['endDate'] };

const baseBudgetShape = z.object({
  name: z.string().min(1).max(255),
  amount: decimalAmount,
  startDate: z.string().date(),
  endDate: z.string().date().optional(),
  categoryId: z.string().uuid(),
  labelId: z.string().uuid().optional(),
});

export const createBudgetSchema = baseBudgetShape.refine(
  (data) => !data.endDate || data.endDate > data.startDate,
  endAfterStart,
);

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;

export const updateBudgetSchema = baseBudgetShape
  .partial()
  .refine(
    (data) => !data.startDate || !data.endDate || data.endDate > data.startDate,
    endAfterStart,
  );

export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;

export const duplicateBudgetSchema = z
  .object({ startDate: z.string().date(), endDate: z.string().date().optional() })
  .refine((data) => !data.endDate || data.endDate > data.startDate, endAfterStart);

export type DuplicateBudgetInput = z.infer<typeof duplicateBudgetSchema>;
