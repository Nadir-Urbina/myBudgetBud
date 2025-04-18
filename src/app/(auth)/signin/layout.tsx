import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - MyBudgetPal',
  description: 'Sign in to your MyBudgetPal account',
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 