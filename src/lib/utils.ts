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

export function calculateDateRange(
  period: 'weekly' | 'biweekly' | 'monthly',
  referenceDate: Date = new Date(),
  periodDetail: string = '1'
): { startDate: Date; endDate: Date } {
  const now = new Date(referenceDate);
  const periodNum = parseInt(periodDetail) || 1;
  
  // Reset time part of the date
  now.setHours(0, 0, 0, 0);
  
  // Get the current year
  const currentYear = now.getFullYear();
  
  if (period === 'weekly') {
    // Calculate the first day of the year
    const firstDayOfYear = new Date(currentYear, 0, 1);
    
    // Calculate days to add based on week number (each week is 7 days)
    const daysToAdd = (periodNum - 1) * 7;
    
    // Set start date to the first day of the specified week
    const startDate = new Date(firstDayOfYear);
    startDate.setDate(firstDayOfYear.getDate() + daysToAdd);
    
    // Set end date to 6 days after start date (7-day period)
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    return { startDate, endDate };
  } else if (period === 'biweekly') {
    // Calculate the first day of the year
    const firstDayOfYear = new Date(currentYear, 0, 1);
    
    // Calculate days to add based on bi-week number (each bi-week is 14 days)
    const daysToAdd = (periodNum - 1) * 14;
    
    // Set start date to the first day of the specified bi-week
    const startDate = new Date(firstDayOfYear);
    startDate.setDate(firstDayOfYear.getDate() + daysToAdd);
    
    // Set end date to 13 days after start date (14-day period)
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 13);
    
    return { startDate, endDate };
  } else if (period === 'monthly') {
    // Month is 0-indexed in JavaScript (0 = January, 11 = December)
    const month = periodNum - 1;
    
    // Set start date to the first day of the specified month
    const startDate = new Date(currentYear, month, 1);
    
    // Set end date to the last day of the specified month
    const endDate = new Date(currentYear, month + 1, 0);
    
    return { startDate, endDate };
  }
  
  // Default fallback to weekly (should not reach here if valid period is provided)
  const startDate = new Date(now);
  const endDate = new Date(now);
  endDate.setDate(now.getDate() + 6);
  
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
