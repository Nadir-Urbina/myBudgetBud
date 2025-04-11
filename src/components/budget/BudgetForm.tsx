'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollection } from '@/hooks/useFirestore';
import { DEFAULT_CATEGORIES, calculateDateRange, formatCurrency } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import type { Budget, BudgetItem } from '@/types/budget';

interface BudgetFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BudgetForm({ open, onClose, onSuccess }: BudgetFormProps) {
  const { user } = useAuth();
  const { add } = useCollection<Budget>('budgets', user?.uid || '');
  const [income, setIncome] = useState<number>(0);
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleIncomeChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setIncome(numValue);
    
    // Update tithe automatically (10% of income)
    const titheItem = items.find(item => item.categoryId === 'tithes');
    if (titheItem) {
      const updatedItems = items.map(item => 
        item.categoryId === 'tithes' 
          ? { ...item, amount: numValue * 0.1 }
          : item
      );
      setItems(updatedItems);
    }
  };

  const handleItemChange = (categoryId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const existingItem = items.find(item => item.categoryId === categoryId);
    
    if (existingItem) {
      setItems(items.map(item => 
        item.categoryId === categoryId 
          ? { ...item, amount: numValue }
          : item
      ));
    } else {
      const { startDate, endDate } = calculateDateRange('weekly', new Date());
      setItems([...items, {
        id: crypto.randomUUID(),
        categoryId,
        amount: numValue,
        period: 'weekly',
        startDate,
        endDate,
      }]);
    }
  };

  const calculateTotals = () => {
    const totalExpenses = items.reduce((sum, item) => sum + item.amount, 0);
    const savings = income - totalExpenses;
    return { totalExpenses, savings };
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { startDate, endDate } = calculateDateRange('weekly', new Date());
      const { totalExpenses, savings } = calculateTotals();
      
      await add({
        userId: user.uid,
        name: `Weekly Budget ${startDate.toLocaleDateString()}`,
        period: 'weekly',
        startDate,
        endDate,
        items,
        totalIncome: income,
        totalExpenses,
        savings,
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const { totalExpenses, savings } = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Weekly Budget</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="income">Income</Label>
            <Input
              id="income"
              type="number"
              placeholder="Enter your income"
              value={income || ''}
              onChange={(e) => handleIncomeChange(e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {DEFAULT_CATEGORIES.filter(cat => cat.type === 'expense').map((category) => (
              <Card key={category.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{category.icon}</span>
                    <Label htmlFor={category.id}>{category.name}</Label>
                  </div>
                  <Input
                    id={category.id}
                    type="number"
                    placeholder={`Enter ${category.name.toLowerCase()} amount`}
                    value={items.find(item => item.categoryId === category.id)?.amount || ''}
                    onChange={(e) => handleItemChange(category.id, e.target.value)}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Total Expenses</div>
              <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Savings</div>
              <div className={`text-2xl font-bold ${savings < 0 ? 'text-red-500' : 'text-green-500'}`}>
                {formatCurrency(savings)}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Budget'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 