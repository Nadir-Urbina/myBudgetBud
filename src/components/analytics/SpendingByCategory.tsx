'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DEFAULT_CATEGORIES } from '@/lib/utils';
import type { Expense } from '@/types/budget';

interface SpendingByCategoryProps {
  expenses: Expense[];
}

export function SpendingByCategory({ expenses }: SpendingByCategoryProps) {
  const data = useMemo(() => {
    const categoryTotals = expenses.reduce((acc, expense) => {
      const category = DEFAULT_CATEGORIES.find(cat => cat.id === expense.categoryId);
      if (!category) return acc;

      acc[category.id] = (acc[category.id] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals)
      .map(([categoryId, amount]) => {
        const category = DEFAULT_CATEGORIES.find(cat => cat.id === categoryId);
        return {
          name: category?.name || categoryId,
          value: amount,
          color: category?.color || '#94a3b8',
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const totalSpending = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 