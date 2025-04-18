import { AuthForm } from '@/components/auth/AuthForm';
import Image from 'next/image';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative w-16 h-16">
              <Image 
                src="/icons/mainLogo.png" 
                alt="MyBudgetPal Logo" 
                fill
                className="object-contain" 
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-primary">MyBudgetPal</h1>
          <p className="text-sm text-muted-foreground">Create your account to get started</p>
        </div>
        <AuthForm mode="signup" />
      </div>
    </div>
  );
} 