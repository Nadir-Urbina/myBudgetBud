'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative w-16 h-16">
              <Image 
                src="/icons/mainLogo.png" 
                alt="MyBudgetBud Logo" 
                fill
                className="object-contain" 
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">MyBudgetBud</h1>
          <p className="mt-2 text-gray-600">Your personal budget tracking application</p>
        </div>
        
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
          <h2 className="mb-4 text-center text-2xl font-bold text-gray-900">Sign In</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
            
            <Button type="submit" className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700">
              Sign In
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 