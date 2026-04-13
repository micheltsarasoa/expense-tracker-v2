import { pgEnum } from 'drizzle-orm/pg-core';

export const categoryType = pgEnum('category_type', ['income', 'expense']);

export const paymentMethodType = pgEnum('payment_method_type', [
  'cash',
  'bank_account',
  'credit_card',
  'debit_card',
  'digital_wallet',
  'other',
]);

export const transactionType = pgEnum('transaction_type', ['income', 'expense', 'transfer']);
