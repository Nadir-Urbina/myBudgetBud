import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - MyBudgetPal',
  description: 'Create a new MyBudgetPal account',
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 