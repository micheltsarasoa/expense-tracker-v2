export type CategoryType = 'income' | 'expense';

/** Lightweight shape for category select inputs. */
export interface CategoryOptionDTO {
  id: string;
  name: string;
  type: CategoryType;
  color: string | null;
}
