'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

interface AuthFormProps {
  mode: 'signin' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  console.log('Auth form rendered, mode:', mode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted', { email, password, mode });
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        console.log('Attempting to sign in...');
        await signIn(email, password);
        console.log('Sign in successful!');
      } else {
        // Validate password match
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        
        // Validate minimum password length
        if (password.length < 6) {
          setError('Password should be at least 6 characters');
          return;
        }

        console.log('Attempting to sign up with fullName:', fullName);
        await signUp(email, password, fullName);
        console.log('Sign up successful!');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className={cn("w-full shadow-lg border border-border")}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pr-10"
              />
              <button 
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pr-10"
                />
              </div>
            </div>
          )}
          
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          {mode === 'signin' ? (
            <>
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link href="/signin" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </>
          )}
        </p>
      </CardFooter>
    </Card>
  );
} 