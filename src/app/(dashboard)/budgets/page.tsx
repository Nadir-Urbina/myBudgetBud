'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollection } from '@/hooks/useFirestore';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, CopyIcon, TrashIcon, ReceiptIcon, PencilIcon, CheckCircle } from 'lucide-react';
import { BudgetForm } from '@/components/budget/BudgetForm';
import { BudgetCreationForm } from '@/components/budget/BudgetCreationForm';
import { BudgetItemForm } from '@/components/budget/BudgetItemForm';
import { ExpenseForm } from '@/components/expense/ExpenseForm';
import type { Budget } from '@/types/budget';
import { toast } from 'sonner';
import { updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Extended interface for our application's Expense type
interface ExtendedExpense {
  id: string;
  userId: string;
  budgetId: string;
  categoryId: string;
  category?: string;
  amount: number;
  date: Date;
  notes?: string;
  type: 'budget' | 'actual';
  completed?: boolean;
  completedAt?: Date | null;
}

export default function BudgetsPage() {
  const { user } = useAuth();
  const { data: budgets = [], loading: loadingBudgets, remove: removeBudget, refresh: refreshBudgets } = 
    useCollection<Budget>('budgets', user?.uid || '', 'startDate');
  const { data: expenses = [], loading: loadingExpenses, update: updateExpense, remove: removeExpense, refresh: refreshExpenses } = 
    useCollection<ExtendedExpense>('expenses', user?.uid || '', 'date');
  
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showBudgetItemForm, setShowBudgetItemForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showRegisterExpenseForm, setShowRegisterExpenseForm] = useState(false);
  const [expenseFormMode, setExpenseFormMode] = useState<'budget' | 'actual'>('budget');
  const [editingItem, setEditingItem] = useState<ExtendedExpense | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Instead of storing the entire budget object, find it from the budgets array when needed
  const selectedBudget = selectedBudgetId ? budgets.find(b => b.id === selectedBudgetId) || null : null;

  // Filter all expenses related to the selected budget if there is one
  const selectedBudgetItems = selectedBudgetId
    ? expenses.filter(expense => expense.budgetId === selectedBudgetId && expense.type === 'budget')
    : [];
  
  const selectedActualExpenses = selectedBudgetId
    ? expenses.filter(expense => expense.budgetId === selectedBudgetId && expense.type === 'actual')
    : [];

  // Force refresh of data
  const refreshAllData = () => {
    refreshBudgets();
    refreshExpenses();
  };

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
      if (selectedBudgetId === budgetId) {
        setSelectedBudgetId(null);
      }
    }
  };

  const handleMarkCompleted = async (item: ExtendedExpense) => {
    try {
      await updateExpense(item.id, {
        completed: !item.completed,
        completedAt: !item.completed ? new Date() : null
      });
      toast.success(`Item ${!item.completed ? 'marked as completed' : 'unmarked'}`);
      refreshAllData();
    } catch (error) {
      console.error('Error updating item status:', error);
      toast.error('Failed to update item status');
    }
  };

  const handleEditItem = (item: ExtendedExpense) => {
    setEditingItem(item);
    setShowBudgetItemForm(true);
  };

  const handleDeleteItem = (itemId: string) => {
    setItemToDelete(itemId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    
    try {
      await removeExpense(itemToDelete);
      toast.success('Item deleted successfully');
      refreshAllData();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    } finally {
      setItemToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleAddBudgetItem = () => {
    setShowBudgetItemForm(true);
  };

  const handleRegisterExpense = () => {
    setShowExpenseForm(true);
  };

  const handleBudgetItemFormClose = () => {
    setShowBudgetItemForm(false);
    setEditingItem(null);
    refreshAllData();
  };

  const handleExpenseFormClose = () => {
    setShowExpenseForm(false);
    refreshAllData();
  };

  // Calculate proper statistics for the selected budget
  const calculateBudgetStats = (budget: Budget | null) => {
    if (!budget) return { totalForecasted: 0, totalActual: 0, totalSavings: 0, remainingFunds: 0 };
    
    // Get all items for this budget
    const budgetItems = expenses.filter(expense => expense.budgetId === budget.id && expense.type === 'budget');
    const actualExpenses = expenses.filter(expense => expense.budgetId === budget.id && expense.type === 'actual');
    
    // Calculate totals
    const totalForecasted = budgetItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalActual = actualExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    
    // Calculate savings (amount specifically allocated to savings category)
    const savingsItems = budgetItems.filter(item => 
      item.category?.toLowerCase() === 'savings' || 
      item.categoryId?.toLowerCase() === 'savings'
    );
    const totalSavings = savingsItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    // Calculate remaining funds (income - actual expenses)
    const remainingFunds = (budget.totalIncome || 0) - totalActual;

    return { totalForecasted, totalActual, totalSavings, remainingFunds };
  };

  const selectedStats = calculateBudgetStats(selectedBudget);

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
                  budgets.map((budget) => {
                    const stats = calculateBudgetStats(budget);
                    return (
                      <div
                        key={budget.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedBudgetId === budget.id 
                            ? 'bg-muted border-primary' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedBudgetId(budget.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{budget.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                            </div>
                          </div>
                          <div className={`font-medium ${
                            stats.remainingFunds < 0 
                              ? 'text-red-500' 
                              : 'text-green-500'
                          }`}>
                            {formatCurrency(stats.remainingFunds)}
                          </div>
                        </div>
                      </div>
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
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Income</div>
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(selectedBudget.totalIncome)}
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Forecasted</div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(selectedStats.totalForecasted)}
                      </div>
                    </div>

                    <div className="p-4 border border-green-100 dark:border-green-900 rounded-lg bg-green-50/50 dark:bg-green-950/20">
                      <div className="text-sm font-medium text-green-600">Savings</div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(selectedStats.totalSavings)}
                      </div>
                      <div className="text-xs mt-1 text-green-600/80">
                        {((selectedStats.totalSavings / selectedBudget.totalIncome) * 100).toFixed(1)}% of income
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Balance</div>
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Expenses:</span>
                          <span className="font-medium text-destructive">{formatCurrency(selectedStats.totalActual)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Remaining:</span>
                          <span className={`font-medium ${selectedStats.remainingFunds < 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {formatCurrency(selectedStats.remainingFunds)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Forecasted Items</CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleAddBudgetItem}
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Forecasted Item
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={handleRegisterExpense}
                    >
                      <ReceiptIcon className="h-4 w-4 mr-2" />
                      Register Expense
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedBudgetItems.length > 0 ? (
                    <div className="space-y-2">
                      {selectedBudgetItems.map((expense) => (
                        <div 
                          key={expense.id} 
                          className={`p-3 border rounded-lg ${expense.completed ? 'bg-muted/50' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Checkbox 
                                checked={expense.completed || false}
                                onCheckedChange={() => handleMarkCompleted(expense)}
                                className="h-5 w-5"
                              />
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {expense.categoryId}
                                  {expense.completed && (
                                    <Badge variant="outline" className="text-green-500 border-green-200">
                                      Completed
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {formatDate(expense.date)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="font-medium">
                                {formatCurrency(expense.amount)}
                              </div>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleEditItem(expense)}
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => handleDeleteItem(expense.id)}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          {expense.notes && (
                            <div className="mt-2 text-sm text-muted-foreground ml-8">
                              {expense.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No forecasted items found for this budget.
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedActualExpenses.length > 0 && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Actual Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedActualExpenses.map((expense) => (
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
                            <div className="font-medium text-destructive">
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
                  </CardContent>
                </Card>
              )}
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

      <BudgetCreationForm 
        open={showBudgetForm} 
        onClose={() => setShowBudgetForm(false)} 
      />

      <BudgetItemForm 
        open={showBudgetItemForm}
        onClose={handleBudgetItemFormClose}
        budgetId={selectedBudgetId || undefined}
        editItem={editingItem}
      />

      <ExpenseForm 
        open={showExpenseForm}
        onClose={handleExpenseFormClose}
        budgetId={selectedBudgetId || undefined}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected budget item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteItem} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 