import { Transaction } from './transaction.model';

export interface DashboardTotals {
  income: number;
  expenses: number;
  balance: number;
}

export interface DashboardCategory {
  _id: string;
  name: string;
  icon?: string;
  total: number;
}

export interface DashboardDay {
  day: number | string;
  total: number;
}

export interface DashboardUser {
  _id: string;
  name: string;
  total: number;
}

export interface DashboardData {
  totals: DashboardTotals;
  byCategory: DashboardCategory[];
  byDay: DashboardDay[];
  byUser: DashboardUser[];
  topCategories: DashboardCategory[];
  lastTransactions: Transaction[];
}
