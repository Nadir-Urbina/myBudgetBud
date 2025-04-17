'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollection } from '@/hooks/useFirestore';
import { DEFAULT_CATEGORIES } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import type { Budget } from '@/types/budget';

interface BudgetItemFormProps {
  open: boolean;
  onClose: () => void;
  budgetId?: string;
  editItem?: {
    id: string;
    categoryId: string;
    amount: number;
    notes?: string;
    date: Date;
    completed?: boolean;
    type: 'budget' | 'actual';
  } | null;
}

export function BudgetItemForm({ open, onClose, budgetId, editItem }: BudgetItemFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  
  const { data: budgets = [], refresh: refreshBudgets } = useCollection<Budget>('budgets', user?.uid || '');
  const { update: updateExpense, add: addExpense, refresh: refreshExpenses } = useCollection<any>('expenses', user?.uid || '');
  const [selectedBudget, setSelectedBudget] = useState<string>(budgetId || '');
  
  // Refresh all data function
  const refreshAllData = () => {
    refreshBudgets();
    refreshExpenses();
  };
  
  // Reset form on open/close and populate with editItem if provided
  useEffect(() => {
    if (open) {
      if (editItem) {
        // Populate form with item being edited
        setCategory(editItem.categoryId || '');
        setAmount(editItem.amount.toString() || '');
        setNotes(editItem.notes || '');
        setSelectedBudget(budgetId || '');
      } else {
        // Reset form for new item
        setCategory('');
        setAmount('');
        setNotes('');
        setSelectedBudget(budgetId || '');
      }
    }
  }, [open, budgetId, editItem]);
  
  // Update selected budget when budgetId changes
  useEffect(() => {
    if (budgetId) {
      setSelectedBudget(budgetId);
    }
  }, [budgetId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to manage budget items');
      return;
    }
    
    if (!selectedBudget || !category || !amount) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    try {
      setLoading(true);
      
      if (editItem) {
        // Update existing item using the useCollection hook's update method
        await updateExpense(editItem.id, {
          categoryId: category,
          amount: numAmount,
          notes,
          updatedAt: serverTimestamp(),
        });
        
        toast.success('Budget item updated successfully');
      } else {
        // Create new budget item document using the useCollection hook's add method
        const itemData = {
          userId: user.uid,
          budgetId: selectedBudget,
          categoryId: category,
          amount: numAmount,
          notes,
          type: 'budget', // This identifies it as a planned budget item, not an actual expense
          date: new Date(), // Use current date as reference
          completed: false, // Default to not completed
          completedAt: null, // Will be set when marked as completed
          createdAt: serverTimestamp(),
        };
        
        await addExpense(itemData);
        
        // Update the budget's total expenses and savings
        const budget = budgets.find(b => b.id === selectedBudget);
        if (budget) {
          const budgetRef = doc(db, 'budgets', selectedBudget);
          
          // Update the budget's planned totals
          const newTotalExpenses = (budget.totalExpenses || 0) + numAmount;
          const newSavings = (budget.totalIncome || 0) - newTotalExpenses;
          
          await updateDoc(budgetRef, {
            totalExpenses: newTotalExpenses,
            savings: newSavings,
            updatedAt: serverTimestamp(),
          });
        }
        
        toast.success('Budget item added successfully');
      }
      
      // Explicitly refresh the data
      refreshAllData();
      
      // Close the form
      onClose();
    } catch (error) {
      console.error(`Error ${editItem ? 'updating' : 'adding'} budget item:`, error);
      toast.error(`Failed to ${editItem ? 'update' : 'add'} budget item`);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter to only expense categories
  const expenseCategories = DEFAULT_CATEGORIES.filter(cat => cat.type === 'expense');
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editItem ? 'Edit Budget Item' : 'Add Budget Item'}</DialogTitle>
          <DialogDescription>
            {editItem ? 
              'Edit the details of your budget item.' : 
              'Add a forecasted expense to your budget.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {!budgetId && (
              <div className="space-y-2">
                <Label htmlFor="budget">Budget</Label>
                <Select
                  value={selectedBudget}
                  onValueChange={setSelectedBudget}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a budget" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgets.map((budget) => (
                      <SelectItem key={budget.id} value={budget.id}>
                        {budget.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={setCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Planned Amount</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional details about this budget item..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? (editItem ? 'Updating...' : 'Adding...') : (editItem ? 'Update Item' : 'Add Item')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 