'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (user && !loading) {
      console.log('User is authenticated, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Only render children if user is not authenticated or still loading
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // Only show auth pages to non-authenticated users
  return !user ? children : null;
} 