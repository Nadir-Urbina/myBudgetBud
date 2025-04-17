'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BudgetCreationForm } from '@/components/budget/BudgetCreationForm';

export default function NewBudgetPage() {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  
  const handleClose = () => {
    router.push('/budgets');
  };
  
  const handleSuccess = (budgetId: string) => {
    router.push('/budgets');
  };

  return (
    <BudgetCreationForm 
      open={open} 
      onClose={handleClose} 
      onSuccess={handleSuccess} 
    />
  );
} 