export type BudgetPeriod = 'weekly' | 'bi-weekly' | 'monthly';

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  icon?: string;
  color?: string;
}

export interface BudgetItem {
  id: string;
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  startDate: Date;
  endDate: Date;
  notes?: string;
}

export interface Expense {
  id: string;
  userId: string;
  budgetId: string;
  categoryId: string;
  amount: number;
  date: Date;
  notes?: string;
  tags?: string[];
}

export interface Budget {
  id: string;
  userId: string;
  name: string;
  period: BudgetPeriod;
  startDate: Date;
  endDate: Date;
  items: BudgetItem[];
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  isTemplate?: boolean;
}

export interface UserPreferences {
  id?: string;
  userId: string;
  defaultBudgetPeriod: BudgetPeriod;
  defaultCategories: Category[];
  currency: string;
  theme: 'light' | 'dark' | 'system';
}

export interface Analytics {
  totalSavings: number;
  savingsRate: number;
  topExpenseCategories: {
    categoryId: string;
    amount: number;
    percentage: number;
  }[];
  monthlyTrends: {
    month: string;
    income: number;
    expenses: number;
    savings: number;
  }[];
  projectedSavings: {
    date: Date;
    amount: number;
  }[];
} 