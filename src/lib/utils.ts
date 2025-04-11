import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function calculateDateRange(period: 'weekly' | 'bi-weekly' | 'monthly', startDate: Date): {
  startDate: Date;
  endDate: Date;
} {
  const endDate = new Date(startDate);
  
  switch (period) {
    case 'weekly':
      endDate.setDate(startDate.getDate() + 6);
      break;
    case 'bi-weekly':
      endDate.setDate(startDate.getDate() + 13);
      break;
    case 'monthly':
      endDate.setMonth(startDate.getMonth() + 1);
      endDate.setDate(startDate.getDate() - 1);
      break;
  }

  return { startDate, endDate };
}

export function calculateSavings(income: number, expenses: number): number {
  return income - expenses;
}

export function calculateSavingsRate(income: number, savings: number): number {
  return income > 0 ? (savings / income) * 100 : 0;
}

export const DEFAULT_CATEGORIES = [
  { id: 'income', name: 'Income', type: 'income', icon: '💰', color: '#4CAF50' },
  { id: 'tithes', name: 'Tithes/Offering', type: 'expense', icon: '🙏', color: '#9C27B0' },
  { id: 'savings', name: 'Savings', type: 'expense', icon: '💎', color: '#2196F3' },
  { id: 'food', name: 'Food Cost', type: 'expense', icon: '🍽', color: '#FF9800' },
  { id: 'education', name: 'Education', type: 'expense', icon: '📚', color: '#03A9F4' },
  { id: 'entertainment', name: 'Entertainment', type: 'expense', icon: '🎬', color: '#E91E63' },
  { id: 'business', name: 'Business Expenses', type: 'expense', icon: '💼', color: '#607D8B' },
  { id: 'utilities', name: 'Utilities', type: 'expense', icon: '🔌', color: '#795548' },
  { id: 'family', name: 'Family Support', type: 'expense', icon: '👨‍👩‍👧‍👦', color: '#8BC34A' },
  { id: 'misc', name: 'Miscellaneous', type: 'expense', icon: '📦', color: '#9E9E9E' },
];
