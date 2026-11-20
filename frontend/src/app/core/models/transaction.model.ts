import { Category } from './category.model';
import { TransactionType, User } from './user.model';

export type { TransactionType } from './user.model';

export interface Transaction {
  _id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  date: string;
  note?: string;
  paidBy: User;
  createdAt?: string;
}

export interface TransactionPayload {
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  note: string;
  paidBy: string;
}

export interface TransactionQuery {
  [key: string]: string | number | boolean | null | undefined;
  month?: number | null;
  year?: number | null;
  type?: TransactionType | null;
  category?: string | null;
  paidBy?: string | null;
  q?: string | null;
  page?: number;
  limit?: number;
}

export interface TransactionPage {
  items: Transaction[];
  total: number;
  page: number;
}
