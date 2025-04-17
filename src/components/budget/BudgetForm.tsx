'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCollection } from '@/hooks/useFirestore';
import { DEFAULT_CATEGORIES, calculateDateRange, formatCurrency } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Budget, BudgetItem } from '@/types/budget';

interface BudgetFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BudgetForm({ open, onClose, onSuccess }: BudgetFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { add } = useCollection<Budget>('budgets', user?.uid || '');
  const [income, setIncome] = useState<number>(0);
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('weekly');
  const [periodDetail, setPeriodDetail] = useState('1');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [createdBudgetId, setCreatedBudgetId] = useState<string | null>(null);

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
      const { startDate, endDate } = calculateDateRange(period as any, new Date(), periodDetail);
      setItems([...items, {
        id: crypto.randomUUID(),
        categoryId,
        amount: numValue,
        period: period as any,
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
      const { startDate, endDate } = calculateDateRange(period as any, new Date(), periodDetail);
      const { totalExpenses, savings } = calculateTotals();
      
      let periodLabel = '';
      if (period === 'weekly') {
        periodLabel = `Week ${periodDetail}`;
      } else if (period === 'biweekly') {
        periodLabel = `Bi-week ${periodDetail}`;
      } else if (period === 'monthly') {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        periodLabel = monthNames[parseInt(periodDetail) - 1];
      }
      
      const result = await add({
        userId: user.uid,
        name: `${period.charAt(0).toUpperCase() + period.slice(1)} Budget: ${periodLabel}`,
        period: period as any,
        startDate,
        endDate,
        items,
        totalIncome: income,
        totalExpenses,
        savings,
      });
      
      // Store the created budget ID for later use
      if (result?.id) {
        setCreatedBudgetId(result.id);
        setSuccessDialogOpen(true);
      } else {
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error('Error creating budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpenses = () => {
    setSuccessDialogOpen(false);
    onClose();
    router.push(`/budgets/${createdBudgetId}`);
  };

  const handleGoToBudgets = () => {
    setSuccessDialogOpen(false);
    onClose();
    router.push('/budgets');
  };

  const renderPeriodDetailOptions = () => {
    if (period === 'weekly') {
      return Array.from({ length: 52 }, (_, i) => (
        <SelectItem key={i + 1} value={(i + 1).toString()}>Week {i + 1}</SelectItem>
      ));
    } else if (period === 'biweekly') {
      return Array.from({ length: 26 }, (_, i) => (
        <SelectItem key={i + 1} value={(i + 1).toString()}>Bi-week {i + 1}</SelectItem>
      ));
    } else if (period === 'monthly') {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return months.map((month, i) => (
        <SelectItem key={i + 1} value={(i + 1).toString()}>{month}</SelectItem>
      ));
    }
    return null;
  };

  const { totalExpenses, savings } = calculateTotals();

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Budget</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="period">Budget Period</Label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="periodDetail">Period Detail</Label>
                <Select value={periodDetail} onValueChange={setPeriodDetail}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specific period" />
                  </SelectTrigger>
                  <SelectContent>
                    {renderPeriodDetailOptions()}
                  </SelectContent>
                </Select>
              </div>
            </div>

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

      <AlertDialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Budget Created Successfully!</AlertDialogTitle>
            <AlertDialogDescription>
              Your budget has been created. Would you like to add expenses now or go to the budgets list?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogAction onClick={handleGoToBudgets} className="w-full">
              Go to Budgets List
            </AlertDialogAction>
            <AlertDialogAction onClick={handleAddExpenses} className="w-full bg-primary">
              Add Expenses Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 