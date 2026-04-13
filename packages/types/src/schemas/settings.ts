import { z } from 'zod';

export const updateSettingsSchema = z
  .object({
    currencySymbol: z.string().max(3).optional(),
    currencyPosition: z.enum(['before', 'after']).optional(),
    decimalSeparator: z.string().length(1).optional(),
    thousandSeparator: z.string().length(1).optional(),
    dateFormat: z.string().max(10).optional(),
    timeFormat: z.enum(['12h', '24h']).optional(),
  })
  .refine(
    (data) => {
      if (data.decimalSeparator !== undefined && data.thousandSeparator !== undefined) {
        return data.decimalSeparator !== data.thousandSeparator;
      }
      return true;
    },
    { message: 'Decimal separator and thousand separator must be different' },
  );

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
