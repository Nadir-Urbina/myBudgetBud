'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useCollection } from '@/hooks/useFirestore';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SpendingByCategory } from '@/components/analytics/SpendingByCategory';
import { SavingsTrend } from '@/components/analytics/SavingsTrend';
import type { Budget, Expense } from '@/types/budget';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { data: budgets = [], loading: loadingBudgets } = useCollection<Budget>('budgets', user?.uid || '');
  const { data: expenses = [], loading: loadingExpenses } = useCollection<Expense>('expenses', user?.uid || '');

  if (loadingBudgets || loadingExpenses) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Process budgets to ensure they have required fields
  const processedBudgets = budgets.map(budget => ({
    ...budget,
    // Ensure all required fields exist
    savings: budget.savings || 0,
    totalIncome: budget.totalIncome || 0,
    totalExpenses: budget.totalExpenses || 0,
    startDate: budget.startDate || new Date(),
    name: budget.name || 'Unnamed Budget'
  }));

  const totalSavings = processedBudgets.reduce((sum, budget) => sum + (budget.savings || 0), 0);
  const totalIncome = processedBudgets.reduce((sum, budget) => sum + (budget.totalIncome || 0), 0);
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
  const monthlyAvgSavings = processedBudgets.length > 0 ? totalSavings / processedBudgets.length * 4 : 0;

  // Project savings for the next 12 months
  const projectedSavings = monthlyAvgSavings * 12;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalSavings)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Savings Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {savingsRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(monthlyAvgSavings)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projected (12mo)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(projectedSavings)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SpendingByCategory expenses={expenses} />
        <SavingsTrend budgets={processedBudgets} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Budget History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {processedBudgets.map((budget) => (
              <div
                key={budget.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <div className="font-medium">{budget.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Income: {formatCurrency(budget.totalIncome)} | 
                    Expenses: {formatCurrency(budget.totalExpenses)}
                  </div>
                </div>
                <div className={`font-medium ${budget.savings < 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {formatCurrency(budget.savings)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 