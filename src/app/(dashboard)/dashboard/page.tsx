'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollection } from '@/hooks/useFirestore';
import { Budget, Expense } from '@/types/budget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, ArrowRightIcon, DollarSignIcon, TrendingDownIcon, PiggyBankIcon } from 'lucide-react';
import { calculateSavings, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: budgets, loading } = useCollection<Budget>('budgets', user?.uid || '', 'startDate');
  const { data: expenses } = useCollection<Expense>('expenses', user?.uid || '', 'date');
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    savings: 0
  });

  useEffect(() => {
    if (budgets && expenses) {
      const totalIncome = budgets.reduce((sum, budget) => sum + (budget.totalIncome || 0), 0);
      const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      const savings = calculateSavings(totalIncome, totalExpenses);
      
      setStats({
        totalIncome,
        totalExpenses,
        savings
      });
    }
  }, [budgets, expenses]);

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
              <div className="text-2xl font-bold text-destructive">{formatCurrency(stats.totalExpenses)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                From all recorded expenses
              </p>
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
              <div className="text-2xl font-bold" style={{ color: stats.savings >= 0 ? 'var(--accent)' : 'var(--destructive)' }}>
                {formatCurrency(stats.savings)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.savings >= 0 ? 'Great job saving!' : 'Budget deficit'}
              </p>
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
                {budgets.slice(0, 3).map((budget, index) => (
                  <div 
                    key={budget.id} 
                    className="flex items-center justify-between rounded-lg border p-3 shadow-sm transition-all hover:bg-accent/10 hover:shadow-md"
                    style={{ 
                      animationDelay: `${400 + index * 50}ms`,
                      animation: 'slideUp 0.3s ease-out forwards'
                    }}
                  >
                    <div className="space-y-1">
                      <p className="font-medium leading-none">{budget.name}</p>
                      <p className="text-sm text-muted-foreground">{new Date(budget.startDate).toLocaleDateString()}</p>
                    </div>
                    <div className="font-medium">{formatCurrency(budget.totalIncome)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No budgets yet. Create your first budget!</p>
            )}
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <Card className="card-animate" style={{ animationDelay: '400ms' }}>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/expenses/add">
              <Button className="w-full sm:w-auto flex items-center transition-all hover:scale-105 active:scale-95">
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </Link>
            <Link href="/budgets/templates">
              <Button variant="outline" className="w-full sm:w-auto flex items-center transition-all hover:scale-105 active:scale-95">
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Budget from Template
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 