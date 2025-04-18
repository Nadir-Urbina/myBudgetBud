'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollection } from '@/hooks/useFirestore';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { BudgetForm } from '@/components/budget/BudgetForm';
import type { Budget } from '@/types/budget';
import Link from 'next/link';

export default function BudgetsPage() {
  const { user } = useAuth();
  const { data: budgets = [], loading: loadingBudgets } = 
    useCollection<Budget>('budgets', user?.uid || '', 'startDate');
  
  const [showBudgetForm, setShowBudgetForm] = useState(false);

  // Calculate proper statistics for a budget
  const calculateBudgetStats = (budget: Budget | null) => {
    if (!budget) return { totalForecasted: 0, totalActual: 0, totalSavings: 0, remainingFunds: 0 };
    
    // We're just using this for the remainingFunds in the list view
    return { 
      totalForecasted: budget.totalExpenses || 0, 
      totalActual: 0, 
      totalSavings: budget.savings || 0, 
      remainingFunds: budget.totalIncome - (budget.totalExpenses || 0) 
    };
  };

  if (loadingBudgets) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Budgets</h1>
        <Button onClick={() => setShowBudgetForm(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Budget
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Budgets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {budgets.length > 0 ? (
                budgets.map((budget) => {
                  const stats = calculateBudgetStats(budget);
                  return (
                    <Link
                      key={budget.id}
                      href={`/budgets/${budget.id}`}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors block hover:bg-muted/50`}
                    >
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-lg">{budget.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground block">Income:</span>
                            <span className="font-medium text-primary">{formatCurrency(budget.totalIncome)}</span>
                          </div>
                          
                          <div>
                            <span className="text-muted-foreground block">Forecasted:</span>
                            <span className="font-medium">{formatCurrency(budget.totalExpenses || 0)}</span>
                          </div>
                          
                          <div>
                            <span className="text-muted-foreground block">Remaining:</span>
                            <span className={`font-medium ${
                              stats.remainingFunds < 0 
                                ? 'text-red-500' 
                                : 'text-green-500'
                            }`}>
                              {formatCurrency(stats.remainingFunds)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Budget allocation</span>
                            <span className="font-medium">
                              {Math.min(((budget.totalExpenses || 0) / budget.totalIncome) * 100, 100).toFixed(0)}% allocated
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                budget.totalExpenses > budget.totalIncome 
                                  ? 'bg-red-500' 
                                  : (budget.totalExpenses || 0) / budget.totalIncome > 0.99 
                                    ? 'bg-green-500' 
                                    : (budget.totalExpenses || 0) / budget.totalIncome > 0.8 
                                      ? 'bg-blue-500' 
                                      : 'bg-amber-500'
                              }`} 
                              style={{ 
                                width: `${Math.min((budget.totalExpenses || 0) / budget.totalIncome * 100, 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No budgets found. Create your first budget to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Form Modal */}
      <BudgetForm
        open={showBudgetForm}
        onClose={() => setShowBudgetForm(false)}
      />
    </div>
  );
} 