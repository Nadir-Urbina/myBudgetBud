'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollection } from '@/hooks/useFirestore';
import { Budget, Expense } from '@/types/budget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, ArrowRightIcon, DollarSignIcon, TrendingDownIcon, PiggyBankIcon, CalendarIcon } from 'lucide-react';
import { formatCurrency, formatDate, calculateSavingsRate } from '@/lib/utils';
import Link from 'next/link';
import { ExpenseForm } from '@/components/expense/ExpenseForm';
import { DEFAULT_CATEGORIES } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: budgets = [], loading } = useCollection<Budget>('budgets', user?.uid || '', 'startDate');
  const { data: expenses = [] } = useCollection<Expense>('expenses', user?.uid || '', 'date');
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  // Function to calculate dashboard stats
  const calculateDashboardStats = () => {
    if (!budgets.length) {
      return {
        totalIncome: 0,
        totalForecasted: 0,
        totalActualExpenses: 0,
        savings: 0,
        savingsRate: 0,
        topCategories: []
      };
    }

    // Calculate total income from all budgets
    const totalIncome = budgets.reduce((sum, budget) => sum + (budget.totalIncome || 0), 0);
    
    // Separate forecasted items from actual expenses
    const forecastedItems = expenses.filter(expense => expense.type === 'budget');
    const actualExpenses = expenses.filter(expense => expense.type === 'actual');
    
    // Calculate totals
    const totalForecasted = forecastedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalActualExpenses = actualExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    
    // Calculate savings (sum of all budget items marked as Savings category)
    const savingsItems = forecastedItems.filter(item => 
      item.category?.toLowerCase() === 'savings' || 
      item.categoryId?.toLowerCase() === 'savings'
    );
    const savings = savingsItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    // Calculate savings rate (savings as percentage of income)
    const savingsRate = calculateSavingsRate(totalIncome, savings);

    // Calculate top spending categories
    const categoryExpenses = {};
    actualExpenses.forEach(expense => {
      const categoryId = expense.categoryId;
      if (!categoryId) return;
      
      if (!categoryExpenses[categoryId]) {
        categoryExpenses[categoryId] = 0;
      }
      categoryExpenses[categoryId] += expense.amount || 0;
    });

    // Convert to array and sort
    const topCategories = Object.entries(categoryExpenses)
      .map(([categoryId, amount]) => {
        const category = DEFAULT_CATEGORIES.find(c => c.id === categoryId);
        return {
          categoryId,
          name: category?.name || 'Other',
          icon: category?.icon || '📦',
          amount: amount as number,
          percentage: totalActualExpenses > 0 ? ((amount as number) / totalActualExpenses) * 100 : 0
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
    
    return {
      totalIncome,
      totalForecasted,
      totalActualExpenses,
      savings,
      savingsRate,
      topCategories
    };
  };

  const stats = calculateDashboardStats();

  const handleExpenseFormClose = () => {
    setShowExpenseForm(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Link href="/budgets/new">
          <Button className="mt-4 sm:mt-0 transition-all hover:scale-105 active:scale-95">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Budget
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Income Card */}
        <div className="gradient-border card-animate" style={{ animationDelay: '0ms' }}>
          <div className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <DollarSignIcon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(stats.totalIncome)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                From all your budget allocations
              </p>
            </CardContent>
          </div>
        </div>
        
        {/* Expenses Card */}
        <div className="gradient-border card-animate" style={{ animationDelay: '100ms' }}>
          <div className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDownIcon className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{formatCurrency(stats.totalActualExpenses)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                From all recorded actual expenses
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                <span className="font-medium">Forecasted: </span>
                {formatCurrency(stats.totalForecasted)}
              </div>
              {stats.totalForecasted > 0 && (
                <div className="mt-3 text-sm">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mt-2 overflow-hidden border border-muted-foreground/10">
                    <div 
                      className={`h-4 rounded-full ${
                        stats.totalActualExpenses > stats.totalForecasted 
                          ? 'bg-destructive' 
                          : 'bg-blue-500'
                      }`} 
                      style={{ 
                        width: `${Math.min(
                          (stats.totalActualExpenses / stats.totalForecasted) * 100, 
                          100
                        )}%`,
                        boxShadow: '0 1px 5px rgba(0,0,0,0.15)',
                        transition: 'width 1s ease-in-out'
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </div>
        </div>
        
        {/* Savings Card */}
        <div className="gradient-border card-animate" style={{ animationDelay: '200ms' }}>
          <div className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Savings</CardTitle>
              <PiggyBankIcon className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(stats.savings)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Great job saving!
              </p>
              {stats.totalIncome > 0 && (
                <div className="mt-3 text-sm">
                  <span className="font-medium">Savings rate: </span>
                  {stats.savingsRate.toFixed(1)}%
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mt-2 overflow-hidden border border-muted-foreground/10">
                    <div 
                      className={`h-4 rounded-full ${
                        stats.savingsRate < 5 
                          ? 'bg-amber-500'
                          : stats.savingsRate > 15 
                            ? 'bg-green-500 dark:bg-green-400' 
                            : 'bg-blue-500'
                      }`} 
                      style={{ 
                        width: `${Math.max(Math.min(stats.savingsRate, 100), 0)}%`,
                        boxShadow: '0 1px 5px rgba(0,0,0,0.15)',
                        transition: 'width 1s ease-in-out'
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Budgets */}
        <Card className="card-animate" style={{ animationDelay: '300ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Budgets</span>
              <Link href="/budgets">
                <Button variant="ghost" size="sm" className="ml-auto transition-transform hover:translate-x-1">
                  <span className="sr-only">View all</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading budgets...</p>
            ) : budgets && budgets.length > 0 ? (
              <div className="space-y-4">
                {budgets.slice(0, 3).map((budget, index) => {
                  // Calculate budget-specific stats
                  const budgetExpenses = expenses.filter(
                    expense => expense.budgetId === budget.id && expense.type === 'actual'
                  );
                  const totalSpent = budgetExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
                  const remainingFunds = (budget.totalIncome || 0) - totalSpent;
                  
                  return (
                    <Link 
                      href={`/budgets/${budget.id}`}
                      key={budget.id} 
                      className="block"
                    >
                      <div 
                        className="flex items-center justify-between rounded-lg border p-3 shadow-sm transition-all hover:bg-accent/10 hover:shadow-md"
                        style={{ 
                          animationDelay: `${400 + index * 50}ms`,
                          animation: 'slideUp 0.3s ease-out forwards'
                        }}
                      >
                        <div className="space-y-1">
                          <p className="font-medium leading-none">{budget.name}</p>
                          <p className="text-sm text-muted-foreground">
                            <CalendarIcon className="h-3 w-3 inline mr-1" />
                            {formatDate(budget.startDate)}
                          </p>
                        </div>
                        <div className={`font-medium ${
                          remainingFunds < 0 
                            ? 'text-destructive' 
                            : 'text-green-500'
                        }`}>
                          {formatCurrency(remainingFunds)}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No budgets yet. Create your first budget!</p>
            )}
          </CardContent>
        </Card>
        
        {/* Quick Actions and Top Categories */}
        <div className="space-y-4">
          <Card className="card-animate" style={{ animationDelay: '400ms' }}>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full sm:w-auto flex items-center transition-all hover:scale-105 active:scale-95"
                onClick={() => setShowExpenseForm(true)}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
              <Link href="/budgets/templates">
                <Button variant="outline" className="w-full sm:w-auto flex items-center transition-all hover:scale-105 active:scale-95">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Create Budget from Template
                </Button>
              </Link>
            </CardContent>
          </Card>

          {stats.topCategories.length > 0 && (
            <Card className="card-animate" style={{ animationDelay: '450ms' }}>
              <CardHeader>
                <CardTitle>Top Spending Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topCategories.map((category, index) => (
                    <div key={category.categoryId} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span role="img" aria-label={category.name}>
                            {category.icon}
                          </span>
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <span className="text-sm">{formatCurrency(category.amount)}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mt-2 overflow-hidden border border-muted-foreground/10">
                        <div 
                          className="h-4 rounded-full bg-blue-500" 
                          style={{ 
                            width: `${category.percentage}%`,
                            boxShadow: '0 1px 5px rgba(0,0,0,0.15)',
                            transition: 'width 1s ease-in-out'
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {category.percentage.toFixed(1)}% of total expenses
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Expense Form Modal */}
      <ExpenseForm 
        open={showExpenseForm} 
        onClose={handleExpenseFormClose} 
      />
    </div>
  );
} 