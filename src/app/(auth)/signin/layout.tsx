import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - MyBudgetBud',
  description: 'Sign in to your MyBudgetBud account',
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 