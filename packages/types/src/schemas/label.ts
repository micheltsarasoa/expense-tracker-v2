import { z } from 'zod';

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a hex color like #FF0000');

export const createLabelSchema = z.object({
  name: z.string().min(1).max(255),
  color: hexColor.optional(),
});

export type CreateLabelInput = z.infer<typeof createLabelSchema>;

export const updateLabelSchema = createLabelSchema.partial();
export type UpdateLabelInput = z.infer<typeof updateLabelSchema>;
