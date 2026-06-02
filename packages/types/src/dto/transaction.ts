export type TransactionType = 'income' | 'expense' | 'transfer';

/**
 * A transaction as returned by the list endpoint: raw ids (for forms/edit) plus
 * server-resolved display values (category/label/account names) so the client
 * never has to do its own id→name lookups.
 */
export interface TransactionListItemDTO {
  id: string;
  type: TransactionType;
  amount: string; // numeric(15,2) serialized as string
  transactionDate: string; // YYYY-MM-DD
  description: string | null;
  isValidated: boolean;
  // ids
  categoryId: string | null;
  labelId: string | null;
  paymentMethodId: string;
  toPaymentMethodId: string | null;
  // resolved display values (server-side join)
  categoryName: string | null;
  categoryColor: string | null;
  labelName: string | null;
  paymentMethodName: string;
  toPaymentMethodName: string | null;
}

export interface TransactionListDTO {
  data: TransactionListItemDTO[];
  total: number;
  page: number;
  pageSize: number;
}
