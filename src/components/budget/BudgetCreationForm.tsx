'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { calculateDateRange } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

// Frequency options
const FREQUENCIES = [
  { id: 'weekly', name: 'Weekly' },
  { id: 'biweekly', name: 'Bi-Weekly' },
  { id: 'monthly', name: 'Monthly' },
];

// Week options for weekly frequency
const WEEKS = Array.from({ length: 52 }, (_, i) => ({ 
  id: (i + 1).toString(), 
  name: `Week ${i + 1}` 
}));

// Bi-weekly periods
const BIWEEKLY_PERIODS = Array.from({ length: 26 }, (_, i) => ({ 
  id: (i + 1).toString(), 
  name: `Bi-week ${i + 1}` 
}));

// Months
const MONTHS = [
  { id: '1', name: 'January' },
  { id: '2', name: 'February' },
  { id: '3', name: 'March' },
  { id: '4', name: 'April' },
  { id: '5', name: 'May' },
  { id: '6', name: 'June' },
  { id: '7', name: 'July' },
  { id: '8', name: 'August' },
  { id: '9', name: 'September' },
  { id: '10', name: 'October' },
  { id: '11', name: 'November' },
  { id: '12', name: 'December' },
];

interface BudgetCreationFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (budgetId: string) => void;
}

export function BudgetCreationForm({ open, onClose, onSuccess }: BudgetCreationFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    frequency: 'weekly',
    period: '1',
    income: ''
  });
  const [loading, setLoading] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [createdBudgetId, setCreatedBudgetId] = useState<string | null>(null);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    if (name === 'frequency') {
      // Reset period when frequency changes
      setFormData(prev => ({ ...prev, frequency: value, period: '1' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Get period options based on frequency
  const getPeriodOptions = () => {
    switch (formData.frequency) {
      case 'weekly':
        return WEEKS;
      case 'biweekly':
        return BIWEEKLY_PERIODS;
      case 'monthly':
        return MONTHS;
      default:
        return [];
    }
  };

  // Get period label
  const getPeriodLabel = () => {
    switch (formData.frequency) {
      case 'weekly':
        return 'Week';
      case 'biweekly':
        return 'Bi-week';
      case 'monthly':
        return 'Month';
      default:
        return 'Period';
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to create a budget');
      return;
    }
    
    if (!formData.name || !formData.frequency || !formData.period || !formData.income) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const incomeValue = parseFloat(formData.income);
    if (isNaN(incomeValue) || incomeValue < 0) {
      toast.error('Please enter a valid income amount');
      return;
    }
    
    try {
      setLoading(true);
      
      // Calculate start and end dates based on frequency and period
      const { startDate, endDate } = calculateDateRange(
        formData.frequency as 'weekly' | 'biweekly' | 'monthly',
        new Date(),
        formData.period
      );
      
      let periodLabel = '';
      if (formData.frequency === 'weekly') {
        periodLabel = `Week ${formData.period}`;
      } else if (formData.frequency === 'biweekly') {
        periodLabel = `Bi-week ${formData.period}`;
      } else if (formData.frequency === 'monthly') {
        periodLabel = MONTHS.find(m => m.id === formData.period)?.name || '';
      }
      
      const budgetName = formData.name || `${formData.frequency.charAt(0).toUpperCase() + formData.frequency.slice(1)} Budget: ${periodLabel}`;
      
      // Create the budget document with explicit JavaScript Date objects
      const budgetData = {
        userId: user.uid,
        name: budgetName,
        frequency: formData.frequency,
        period: formData.period,
        startDate: new Date(startDate), // Ensure this is a JavaScript Date object
        endDate: new Date(endDate),     // Ensure this is a JavaScript Date object
        totalIncome: incomeValue,
        totalExpenses: 0,
        savings: incomeValue, // Initially savings equals income (before expenses)
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const budgetsCollection = collection(db, 'budgets');
      const docRef = await addDoc(budgetsCollection, budgetData);
      
      setCreatedBudgetId(docRef.id);
      setSuccessDialogOpen(true);
      toast.success('Budget created successfully!');
    } catch (error) {
      console.error('Error creating budget:', error);
      toast.error('Failed to create budget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Navigate to add budget items
  const handleAddBudgetItems = () => {
    setSuccessDialogOpen(false);
    onClose();
    if (createdBudgetId) {
      router.push(`/budgets/${createdBudgetId}`);
    }
  };

  // Go to budgets list
  const handleGoToBudgets = () => {
    setSuccessDialogOpen(false);
    onClose();
    if (onSuccess && createdBudgetId) {
      onSuccess(createdBudgetId);
    } else {
      router.push('/budgets');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Budget</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Budget Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Monthly Household Budget"
                  value={formData.name}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank for auto-generated name based on period
                </p>
              </div>
              
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Budget Period</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => handleSelectChange('frequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map((frequency) => (
                        <SelectItem key={frequency.id} value={frequency.id}>
                          {frequency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="period">{getPeriodLabel()}</Label>
                  <Select
                    value={formData.period}
                    onValueChange={(value) => handleSelectChange('period', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${getPeriodLabel().toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {getPeriodOptions().map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="income">Total Income</Label>
                <Input
                  id="income"
                  name="income"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 5000"
                  value={formData.income}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Budget'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Budget Created Successfully!</AlertDialogTitle>
            <AlertDialogDescription>
              Your budget has been created. What would you like to do next?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogAction onClick={handleGoToBudgets} className="w-full">
              Go to Budgets List
            </AlertDialogAction>
            <AlertDialogAction onClick={handleAddBudgetItems} className="w-full bg-primary">
              Add Budget Items
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 