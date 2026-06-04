'use server';

import { revalidatePath } from 'next/cache';
import { createTransactionSchema, updateTransactionSchema } from '@expense-tracker/types';
import { AppError } from '@expense-tracker/types';
import { getUserId } from '@/lib/auth';
import { parseInput } from '@/lib/validate';
import { runAction } from '@/lib/action';
import { transactionService, importService } from '@/services/instances';

// Browsers frequently tag .csv files as application/vnd.ms-excel; the import
// parser only accepts text/csv, so trust the extension over the reported type.
function csvMimeType(file: File): string {
  return file.name.toLowerCase().endsWith('.csv') ? 'text/csv' : file.type;
}

function fileFromForm(formData: FormData): File {
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    throw AppError.validation('Please choose a CSV file to import.');
  }
  return file;
}

export async function createTransaction(input: unknown) {
  const userId = await getUserId();
  return runAction(async () => {
    const data = parseInput(input, createTransactionSchema);
    const tx = await transactionService.create(userId, data);
    revalidatePath('/transactions');
    return tx;
  });
}

export async function updateTransaction(id: string, input: unknown) {
  const userId = await getUserId();
  return runAction(async () => {
    const data = parseInput(input, updateTransactionSchema);
    const tx = await transactionService.update(userId, id, data);
    revalidatePath('/transactions');
    return tx;
  });
}

export async function deleteTransaction(id: string) {
  const userId = await getUserId();
  return runAction(async () => {
    await transactionService.delete(userId, id);
    revalidatePath('/transactions');
  });
}

export async function toggleTransactionValidated(id: string) {
  const userId = await getUserId();
  return runAction(async () => {
    const tx = await transactionService.toggleValidate(userId, id);
    revalidatePath('/transactions');
    return tx;
  });
}

export async function validateImport(formData: FormData) {
  const userId = await getUserId();
  return runAction(async () => {
    const file = fileFromForm(formData);
    const buffer = await file.arrayBuffer();
    return importService.validate(userId, buffer, csvMimeType(file));
  });
}

export async function commitImport(formData: FormData) {
  const userId = await getUserId();
  return runAction(async () => {
    const file = fileFromForm(formData);
    const buffer = await file.arrayBuffer();
    const report = await importService.commit(userId, buffer, csvMimeType(file));
    revalidatePath('/transactions');
    return report;
  });
}
