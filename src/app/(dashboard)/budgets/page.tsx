'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollection } from '@/hooks/useFirestore';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, CopyIcon, TrashIcon } from 'lucide-react';
import { BudgetForm } from '@/components/budget/BudgetForm';
import { ExpenseForm } from '@/components/expense/ExpenseForm';
import type { Budget, Expense } from '@/types/budget';

export default function BudgetsPage() {
  const { user } = useAuth();
  const { data: budgets = [], loading: loadingBudgets, remove: removeBudget } = 
    useCollection<Budget>('budgets', user?.uid || '', 'startDate');
  const { data: expenses = [], loading: loadingExpenses } = 
    useCollection<Expense>('expenses', user?.uid || '', 'date');
  
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  if (loadingBudgets || loadingExpenses) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const handleDeleteBudget = async (budgetId: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      await removeBudget(budgetId);
      if (selectedBudget?.id === budgetId) {
        setSelectedBudget(null);
      }
    }
  };

  const budgetExpenses = expenses.filter(
    expense => expense.budgetId === selectedBudget?.id
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Budgets</h1>
        <Button onClick={() => setShowBudgetForm(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Budget
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Budgets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {budgets.length > 0 ? (
                  budgets.map((budget) => (
                    <div
                      key={budget.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedBudget?.id === budget.id 
                          ? 'bg-muted border-primary' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedBudget(budget)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{budget.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                          </div>
                        </div>
                        <div className={`font-medium ${budget.savings < 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {formatCurrency(budget.savings)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No budgets found. Create your first budget to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-4">
          {selectedBudget ? (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>{selectedBudget.name}</CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => {
                        setShowBudgetForm(true);
                        // Create a copy of the selected budget
                      }}
                    >
                      <CopyIcon className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => handleDeleteBudget(selectedBudget.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Income</div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(selectedBudget.totalIncome)}
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Expenses</div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(selectedBudget.totalExpenses)}
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Savings</div>
                      <div className={`text-2xl font-bold ${
                        selectedBudget.savings < 0 ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {formatCurrency(selectedBudget.savings)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Expenses</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowExpenseForm(true)}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                </CardHeader>
                <CardContent>
                  {budgetExpenses.length > 0 ? (
                    <div className="space-y-2">
                      {budgetExpenses.map((expense) => (
                        <div key={expense.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">
                                {expense.categoryId}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(expense.date)}
                              </div>
                            </div>
                            <div className="font-medium">
                              {formatCurrency(expense.amount)}
                            </div>
                          </div>
                          {expense.notes && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              {expense.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No expenses found for this budget.
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">
                  Select a budget from the list to view details
                </p>
                <Button onClick={() => setShowBudgetForm(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create New Budget
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <BudgetForm 
        open={showBudgetForm} 
        onClose={() => setShowBudgetForm(false)} 
      />

      <ExpenseForm 
        open={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
        budgetId={selectedBudget?.id}
      />
    </div>
  );
} 