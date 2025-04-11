'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Budget } from '@/types/budget';

interface SavingsTrendProps {
  budgets: Budget[];
}

export function SavingsTrend({ budgets }: SavingsTrendProps) {
  const data = useMemo(() => {
    return budgets
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .map(budget => ({
        date: formatDate(budget.startDate),
        savings: budget.savings,
        income: budget.totalIncome,
        expenses: budget.totalExpenses,
      }));
  }, [budgets]);

  const cumulativeSavings = data.reduce((acc, curr, index) => {
    const previousTotal = index > 0 ? acc[index - 1].total : 0;
    acc.push({
      ...curr,
      total: previousTotal + curr.savings,
    });
    return acc;
  }, [] as any[]);

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle>Savings Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={cumulativeSavings} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Amount']}
            />
            <Line 
              type="monotone" 
              dataKey="savings" 
              stroke="#22c55e" 
              name="Weekly Savings"
            />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#3b82f6" 
              name="Total Savings"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 