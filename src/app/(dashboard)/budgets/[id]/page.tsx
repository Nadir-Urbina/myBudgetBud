'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useDocument, useCollection } from '@/hooks/useFirestore';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyIcon, ReceiptIcon, PlusIcon, TrashIcon, CheckCircle, CircleIcon } from 'lucide-react';
import { BudgetItemForm } from '@/components/budget/BudgetItemForm';
import { ExpenseForm } from '@/components/expense/ExpenseForm';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Budget, Expense } from '@/types/budget';

export default function BudgetDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { data: budget, loading, update: updateBudget } = useDocument<Budget>('budgets', id as string);
  const { data: expenses = [], loading: loadingExpenses, remove: removeExpense, update: updateExpense } = useCollection<Expense>('expenses', user?.uid || '', 'date');
  
  const [showBudgetItemForm, setShowBudgetItemForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingItem, setDeletingItem] = useState<string | null>(null);

  // Filter for budget items and actual expenses related to this budget
  const budgetItems = expenses.filter(
    expense => expense.budgetId === id && expense.type === 'budget'
  );

  const actualExpenses = expenses.filter(
    expense => expense.budgetId === id && expense.type === 'actual'
  );

  // Calculate proper statistics for the budget
  const calculateBudgetStats = () => {
    if (!budget) return { totalForecasted: 0, totalActual: 0, totalSavings: 0, remainingFunds: 0 };
    
    // Calculate totals
    const totalForecasted = budgetItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalActual = actualExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    
    // Calculate savings (amount specifically allocated to savings category)
    const savingsItems = budgetItems.filter(item => item.category?.toLowerCase() === 'savings' || item.categoryId?.toLowerCase() === 'savings');
    const totalSavings = savingsItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    // Calculate remaining funds (income - actual expenses)
    const remainingFunds = (budget.totalIncome || 0) - totalActual;

    return { totalForecasted, totalActual, totalSavings, remainingFunds };
  };

  const { totalForecasted, totalActual, totalSavings, remainingFunds } = calculateBudgetStats();

  const handleAddBudgetItem = () => {
    setShowBudgetItemForm(true);
  };

  const handleRegisterExpense = () => {
    setShowExpenseForm(true);
  };

  const confirmDelete = (itemId: string) => {
    setDeletingItem(itemId);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (deletingItem) {
      try {
        await removeExpense(deletingItem);
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
    setShowDeleteDialog(false);
    setDeletingItem(null);
  };

  const toggleCompletedStatus = async (itemId: string, currentStatus: boolean) => {
    try {
      await updateExpense(itemId, { 
        completed: !currentStatus,
        completedAt: !currentStatus ? new Date() : null
      });
    } catch (error) {
      console.error('Error updating item status:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (!budget) {
    return <div className="flex items-center justify-center h-full">Budget not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{budget.name}</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            Back
          </Button>
          <Button variant="destructive" size="sm">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(budget.totalIncome)}</div>
            <p className="text-sm text-muted-foreground">
              {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Forecasted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalForecasted)}</div>
            <p className="text-sm text-muted-foreground">
              Planned budget items
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-100 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-600">Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalSavings)}
            </div>
            <p className="text-sm text-green-600/80">
              {((totalSavings / budget.totalIncome) * 100).toFixed(1)}% of income
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Expenses:</span>
                <span className="font-medium text-destructive">{formatCurrency(totalActual)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Remaining:</span>
                <span className={`font-medium ${remainingFunds < 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {formatCurrency(remainingFunds)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Items Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Budget Items</CardTitle>
          <Button variant="outline" size="sm" onClick={handleAddBudgetItem}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Budget Item
          </Button>
        </CardHeader>
        <CardContent>
          {loadingExpenses ? (
            <div className="text-center p-4">Loading budget items...</div>
          ) : budgetItems.length > 0 ? (
            <div className="space-y-3">
              {budgetItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between border p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={item.completed || false} 
                      onCheckedChange={() => toggleCompletedStatus(item.id, item.completed || false)} 
                      className="h-5 w-5"
                    />
                    <div>
                      <div className="font-medium capitalize flex items-center gap-2">
                        {item.categoryId}
                        {item.completed && (
                          <Badge variant="outline" className="text-green-500 border-green-200">
                            Completed
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(item.date)} {item.notes && `- ${item.notes}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{formatCurrency(item.amount)}</div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => confirmDelete(item.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 text-muted-foreground">
              No budget items added yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actual Expenses Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Actual Expenses</CardTitle>
          <Button variant="default" size="sm" onClick={handleRegisterExpense}>
            <ReceiptIcon className="h-4 w-4 mr-2" />
            Register Expense
          </Button>
        </CardHeader>
        <CardContent>
          {loadingExpenses ? (
            <div className="text-center p-4">Loading expenses...</div>
          ) : actualExpenses.length > 0 ? (
            <div className="space-y-3">
              {actualExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between border p-3 rounded-lg">
                  <div>
                    <div className="font-medium capitalize">{expense.categoryId}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(expense.date)} {expense.notes && `- ${expense.notes}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{formatCurrency(expense.amount)}</div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => confirmDelete(expense.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 text-muted-foreground">
              No actual expenses recorded yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forms and Dialogs */}
      <BudgetItemForm 
        open={showBudgetItemForm} 
        onClose={() => setShowBudgetItemForm(false)} 
        budgetId={id as string} 
      />

      <ExpenseForm 
        open={showExpenseForm} 
        onClose={() => setShowExpenseForm(false)}
        budgetId={id as string}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 