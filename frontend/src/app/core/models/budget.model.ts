export interface BudgetCategory {
  _id: string;
  name: string;
  icon?: string;
}

export interface Budget {
  _id: string;
  month: number;
  year: number;
  category: BudgetCategory | null;
  amount: number;
}

export interface BudgetPayload {
  month: number;
  year: number;
  category: string | null;
  amount: number;
}
