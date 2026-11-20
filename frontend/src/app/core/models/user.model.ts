export type TransactionType = 'expense' | 'income';

export interface User {
  _id: string;
  name: string;
  email?: string;
}
