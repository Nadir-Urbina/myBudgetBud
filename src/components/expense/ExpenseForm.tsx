'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollection } from '@/hooks/useFirestore';
import { DEFAULT_CATEGORIES } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Expense } from '@/types/budget';

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  budgetId?: string;
}

export function ExpenseForm({ open, onClose, onSuccess, budgetId }: ExpenseFormProps) {
  const { user } = useAuth();
  const { add } = useCollection<Expense>('expenses', user?.uid || '');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const expenseCategories = DEFAULT_CATEGORIES.filter(cat => cat.type === 'expense');

  const handleSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await add({
        userId: user.uid,
        budgetId: budgetId || 'unassigned',
        categoryId: formData.categoryId,
        amount: parseFloat(formData.amount) || 0,
        date: new Date(formData.date),
        notes: formData.notes,
        tags: [],
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error adding expense:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this expense"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !formData.categoryId || !formData.amount}
          >
            {loading ? 'Adding...' : 'Add Expense'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 