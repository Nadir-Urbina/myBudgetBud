import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - MyBudgetBud',
  description: 'Create a new MyBudgetBud account',
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 