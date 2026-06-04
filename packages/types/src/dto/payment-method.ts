export type PaymentMethodType =
  | 'cash'
  | 'bank_account'
  | 'credit_card'
  | 'debit_card'
  | 'digital_wallet'
  | 'other';

export interface PaymentMethodDTO {
  id: string;
  name: string;
  type: PaymentMethodType;
  currentBalance: string; // numeric(15,2) as string
  color: string | null;
  icon: string | null;
  isActive: boolean;
}

/** Lightweight shape for account select inputs. */
export interface PaymentMethodOptionDTO {
  id: string;
  name: string;
  type: PaymentMethodType;
}
