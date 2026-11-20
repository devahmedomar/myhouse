import { TransactionType } from './user.model';

export interface Category {
  _id: string;
  name: string;
  icon?: string;
  type: TransactionType;
}
