'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { doc, setDoc, collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

// Expense categories (same as budget categories for consistency)
const CATEGORIES = [
  { id: 'housing', name: 'Housing', icon: '🏠' },
  { id: 'transportation', name: 'Transportation', icon: '🚗' },
  { id: 'food', name: 'Food & Groceries', icon: '🍔' },
  { id: 'utilities', name: 'Utilities', icon: '💡' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
  { id: 'health', name: 'Healthcare', icon: '🏥' },
  { id: 'debt', name: 'Debt Payments', icon: '💳' },
  { id: 'savings', name: 'Savings', icon: '💰' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️' },
  { id: 'education', name: 'Education', icon: '📚' },
  { id: 'personal', name: 'Personal Care', icon: '💆' },
  { id: 'travel', name: 'Travel', icon: '✈️' },
  { id: 'pets', name: 'Pets', icon: '🐾' },
  { id: 'gifts', name: 'Gifts & Donations', icon: '🎁' },
  { id: 'other', name: 'Other', icon: '📋' },
];

interface Budget {
  id: string;
  name: string;
  category: string;
  amount: number;
  spent: number;
  remaining: number;
}

export default function AddExpensePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const budgetIdFromUrl = searchParams.get('budgetId');
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingBudgets, setLoadingBudgets] = useState(true);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date(),
    budgetId: '',
  });
  
  // Load user's budgets
  useEffect(() => {
    const fetchBudgets = async () => {
      if (!user) return;
      
      try {
        setLoadingBudgets(true);
        const budgetsCollection = collection(db, 'budgets');
        const q = query(budgetsCollection, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        const budgetsList: Budget[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          budgetsList.push({
            id: doc.id,
            name: data.name,
            category: data.category,
            amount: data.amount,
            spent: data.spent || 0,
            remaining: data.amount - (data.spent || 0),
          });
        });
        
        setBudgets(budgetsList);
        
        // If budgetId is provided in URL and exists in fetched budgets, pre-select it
        if (budgetIdFromUrl) {
          const selectedBudget = budgetsList.find(b => b.id === budgetIdFromUrl);
          if (selectedBudget) {
            setFormData(prev => ({ 
              ...prev, 
              budgetId: budgetIdFromUrl,
              category: selectedBudget.category // Also set the category to match the budget
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching budgets:', error);
        toast.error('Failed to load budgets');
      } finally {
        setLoadingBudgets(false);
      }
    };
    
    fetchBudgets();
  }, [user, budgetIdFromUrl]);
  
  // Suggest a category based on expense description
  const suggestCategory = (description: string) => {
    const descLower = description.toLowerCase();
    
    // Map of keywords to categories (same logic as budget but for expenses)
    const keywordMap: Record<string, string> = {
      'rent': 'housing',
      'mortgage': 'housing',
      'apartment': 'housing',
      'car': 'transportation',
      'gas': 'transportation',
      'bus': 'transportation',
      'uber': 'transportation',
      'lyft': 'transportation',
      'food': 'food',
      'grocery': 'food',
      'restaurant': 'food',
      'takeout': 'food',
      'electricity': 'utilities',
      'water': 'utilities',
      'internet': 'utilities',
      'phone': 'utilities',
      'movie': 'entertainment',
      'netflix': 'entertainment',
      'hulu': 'entertainment',
      'spotify': 'entertainment',
      'doctor': 'health',
      'medical': 'health',
      'medicine': 'health',
      'hospital': 'health',
      'pharmacy': 'health',
      'loan': 'debt',
      'credit': 'debt',
      'saving': 'savings',
      'invest': 'savings',
      'clothes': 'shopping',
      'shoes': 'shopping',
      'amazon': 'shopping',
      'school': 'education',
      'college': 'education',
      'tuition': 'education',
      'course': 'education',
      'haircut': 'personal',
      'gym': 'personal',
      'vacation': 'travel',
      'trip': 'travel',
      'flight': 'travel',
      'pet': 'pets',
      'dog': 'pets',
      'cat': 'pets',
      'vet': 'pets',
      'gift': 'gifts',
      'charity': 'gifts',
      'donation': 'gifts'
    };
    
    // Check if any keywords match
    for (const [keyword, categoryId] of Object.entries(keywordMap)) {
      if (descLower.includes(keyword)) {
        return categoryId;
      }
    }
    
    return ''; // No suggestion
  };
  
  // Suggest a budget based on category
  const suggestBudget = (category: string) => {
    if (!category || budgets.length === 0) return '';
    
    // Find matching budget by category with remaining amount
    const matchingBudget = budgets.find(
      (budget) => budget.category === category && budget.remaining > 0
    );
    
    return matchingBudget ? matchingBudget.id : '';
  };
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'description') {
      // If changing description, suggest a category
      const suggestedCategory = suggestCategory(value);
      if (suggestedCategory && !formData.category) {
        // If we have a category suggestion, also suggest a matching budget
        const suggestedBudget = suggestBudget(suggestedCategory);
        setFormData(prev => ({ 
          ...prev, 
          [name]: value, 
          category: suggestedCategory,
          budgetId: suggestedBudget || prev.budgetId
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    if (name === 'category') {
      // If changing category, suggest a matching budget
      const suggestedBudget = suggestBudget(value);
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        budgetId: suggestedBudget || prev.budgetId 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, date }));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to add an expense');
      return;
    }
    
    if (!formData.description || !formData.amount || !formData.category || !formData.budgetId) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid amount');
        setLoading(false);
        return;
      }
      
      // Get the selected budget
      const selectedBudget = budgets.find(budget => budget.id === formData.budgetId);
      if (!selectedBudget) {
        toast.error('Selected budget not found');
        setLoading(false);
        return;
      }
      
      // Check if there's enough budget remaining
      if (amount > selectedBudget.remaining) {
        toast.error(`This expense exceeds your remaining budget of ${selectedBudget.remaining.toFixed(2)}`);
        setLoading(false);
        return;
      }
      
      // Create the expense document
      const expenseData = {
        userId: user.uid,
        budgetId: formData.budgetId,
        description: formData.description,
        amount: amount,
        category: formData.category,
        date: formData.date,
        createdAt: serverTimestamp(),
      };
      
      const expensesCollection = collection(db, 'expenses');
      await addDoc(expensesCollection, expenseData);
      
      // Update the budget's spent and remaining amounts
      const budgetRef = doc(db, 'budgets', formData.budgetId);
      const newSpent = selectedBudget.spent + amount;
      const newRemaining = selectedBudget.amount - newSpent;
      
      await updateDoc(budgetRef, {
        spent: newSpent,
        remaining: newRemaining,
        updatedAt: serverTimestamp(),
      });
      
      toast.success('Expense added successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format the date for display
  const formatDate = (date: Date) => {
    return format(date, 'PPP');
  };
  
  return (
    <div className="container max-w-lg py-6">
      <h1 className="text-2xl font-bold mb-6">Add New Expense</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
          <CardDescription>
            Add a new expense to track against your budget
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                placeholder="e.g., Grocery shopping at Trader Joe's"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                placeholder="e.g., 45.99"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <span className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? formatDate(formData.date) : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Select
                value={formData.budgetId}
                onValueChange={(value) => handleSelectChange('budgetId', value)}
                disabled={loadingBudgets || budgets.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    loadingBudgets 
                      ? "Loading budgets..." 
                      : budgets.length === 0 
                        ? "No budgets available" 
                        : "Select a budget"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {budgets.map((budget) => (
                    <SelectItem key={budget.id} value={budget.id}>
                      <span className="flex items-center justify-between w-full">
                        <span>{budget.name}</span>
                        <span className="text-sm text-muted-foreground">
                          (${budget.remaining.toFixed(2)} left)
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {budgets.length === 0 && !loadingBudgets && (
                <p className="text-sm text-muted-foreground">
                  You need to create a budget before adding expenses.{' '}
                  <Button 
                    variant="link" 
                    className="h-auto p-0" 
                    onClick={() => router.push('/budgets/new')}
                  >
                    Create a budget
                  </Button>
                </p>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              type="button"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || loadingBudgets || budgets.length === 0}
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 