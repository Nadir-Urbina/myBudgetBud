import { cn } from '@/lib/utils';

export const metadata = {
  title: 'MyBudgetBud - Personal Finance Made Simple',
  description: 'Track expenses, manage budgets, and reach your financial goals with MyBudgetBud, the most intuitive personal finance app.',
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
} 