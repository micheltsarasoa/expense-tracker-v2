import { controller } from '@/lib/controller';
import { AppError } from '@expense-tracker/types';
import { importService } from '../../../_services';

export const POST = controller(async (req, userId) => {
  const formData = await req.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) throw AppError.validation('A file field is required');
  const buffer = await file.arrayBuffer();
  return importService.validate(userId, buffer, file.type || 'text/csv');
});
