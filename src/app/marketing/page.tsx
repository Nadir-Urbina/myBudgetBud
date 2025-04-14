'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  BarChart3,
  Calendar,
  DollarSign,
  Fingerprint,
  Lightbulb,
  Smartphone,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration errors by only rendering the page once mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="container mx-auto py-6 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="h-8 w-8 text-primary" />
          <span className="font-bold text-2xl">MyBudgetBud</span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/signin" 
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Sign In
          </Link>
          <Link href="/signup">
            <Button size="sm" variant="secondary">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto pt-20 pb-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
            Your Personal Budget Companion
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Take control of your finances with{' '}
            <span className="text-primary">MyBudgetBud</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track expenses, set budgets, and reach your financial goals with our intuitive and easy-to-use personal finance tool.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start for Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/signin">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* App Screenshot */}
      <section className="container mx-auto px-4 -mt-24 mb-24">
        <div className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-tr from-primary/5 via-primary/10 to-background border shadow-xl overflow-hidden">
          <div className="p-2">
            <div className="w-full h-[500px] bg-card rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex bg-primary/20 p-4 rounded-full mb-4">
                  <DollarSign className="h-10 w-10 text-primary" />
                </div>
                <p className="text-lg font-medium">App Dashboard Preview</p>
                <p className="text-muted-foreground">Beautiful visualizations of your finances</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto py-24 px-4">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Everything you need to manage your money</h2>
          <p className="text-lg text-muted-foreground">
            MyBudgetBud combines powerful features with a simple interface to make managing your finances effortless.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: 'Expense Tracking',
              description: 'Easily log and categorize your expenses to see where your money is going.',
              icon: DollarSign,
            },
            {
              title: 'Budget Creation',
              description: 'Set realistic budgets for different categories and track your progress.',
              icon: Wallet,
            },
            {
              title: 'Visual Analytics',
              description: 'Gain insights with intuitive charts and reports of your spending habits.',
              icon: BarChart3,
            },
            {
              title: 'Financial Goals',
              description: 'Define and track your saving goals with progress indicators.',
              icon: Sparkles,
            },
            {
              title: 'Scheduled Payments',
              description: 'Never miss a bill with reminders for recurring expenses.',
              icon: Calendar,
            },
            {
              title: 'Secure & Private',
              description: 'Your financial data is encrypted and never shared with third parties.',
              icon: Fingerprint,
            },
          ].map((feature, index) => (
            <div 
              key={index} 
              className={cn(
                "rounded-xl border bg-background p-6 shadow-sm transition-all hover:shadow-md",
                index === 3 || index === 4 ? "md:translate-y-4" : ""
              )}
            >
              <div className="inline-flex items-center justify-center p-3 rounded-lg bg-primary/10 mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mobile Experience */}
      <section className="container mx-auto py-20 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
              Mobile Experience
            </div>
            <h2 className="text-3xl font-bold mb-6">Take MyBudgetBud with you everywhere</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Access your finances on the go with our responsive web app. Add expenses in real-time and keep track of your budget wherever you are.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                'Works on any device with a web browser',
                'Install as a PWA for app-like experience',
                'Offline functionality for tracking expenses anywhere',
                'Sync across all your devices automatically',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="rounded-full p-1 bg-primary/10 mt-1">
                    <Lightbulb className="h-4 w-4 text-primary" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-64 h-[500px] rounded-3xl bg-gradient-to-tr from-primary/5 via-primary/10 to-background border-4 border-background shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 p-2">
                <div className="w-full h-full bg-card rounded-2xl flex items-center justify-center flex-col">
                  <Smartphone className="h-10 w-10 text-primary mb-4" />
                  <div className="text-center">
                    <p className="font-semibold">Mobile App Preview</p>
                    <p className="text-xs text-muted-foreground">Your finances at your fingertips</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-tr from-primary/5 via-background to-primary/5 py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What our users say</h2>
            <p className="text-lg text-muted-foreground">
              Discover how MyBudgetBud has transformed financial management for our users.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "MyBudgetBud helped me save for my dream vacation in just 6 months. The visualization makes tracking expenses fun!",
                name: "Alex Johnson",
                title: "Freelance Designer"
              },
              {
                quote: "As someone who was always bad with money, this app has been a game-changer. Now I know exactly where every dollar goes.",
                name: "Samantha Lee",
                title: "Marketing Manager"
              },
              {
                quote: "I love how I can set different budgets for each category. It's made managing household expenses with my partner so much easier.",
                name: "Michael Roberts",
                title: "Software Engineer"
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-background rounded-xl border p-6 shadow-sm">
                <div className="mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="italic mb-6">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto py-24 px-4">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-tr from-primary/20 via-primary/10 to-background rounded-2xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your financial habits?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who have taken control of their finances with MyBudgetBud.
            Start your journey to financial freedom today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Get Started for Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/signin">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">MyBudgetBud</span>
              </div>
              <p className="text-muted-foreground">
                Your personal finance companion for a better financial future.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Features</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Testimonials</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Pricing</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">FAQs</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">About</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Blog</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Careers</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} MyBudgetBud. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 