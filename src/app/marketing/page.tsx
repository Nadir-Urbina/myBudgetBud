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
  Moon,
  Sun,
  Menu,
  Clock,
  Globe,
  Wifi,
  PlusCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Shield,
  Rocket,
  Laptop,
  WifiOff,
  Target,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Simple standalone theme toggle component
function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  
  // Initialize on mount
  useEffect(() => {
    // Check if dark mode is active
    const darkModeActive = document.documentElement.classList.contains('dark');
    setIsDark(darkModeActive);
  }, []);
  
  const toggleTheme = () => {
    // Toggle the state
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    // Apply the change directly to DOM
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-background/80 border border-border hover:bg-accent transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun size={16} className="text-yellow-400" />
      ) : (
        <Moon size={16} className="text-slate-700" />
      )}
    </button>
  );
}

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const { user, loading } = useAuth();
  
  // Refs for DOM elements
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const isTogglingRef = useRef(false);

  // Prevent hydration errors by only rendering the page once mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle clicks outside the mobile menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (isTogglingRef.current || !mobileMenuOpen) return;
      
      const targetElement = event.target as Node;
      const menuButton = menuButtonRef.current;
      const mobileMenu = mobileMenuRef.current;
      
      if (
        mobileMenu && 
        !mobileMenu.contains(targetElement) && 
        menuButton && 
        !menuButton.contains(targetElement)
      ) {
        setMobileMenuOpen(false);
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside as EventListener, true);
      document.addEventListener('touchstart', handleClickOutside as EventListener, true);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside as EventListener, true);
      document.removeEventListener('touchstart', handleClickOutside as EventListener, true);
    };
  }, [mobileMenuOpen]);

  // Handle menu toggle with debounce
  const handleMenuToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isTogglingRef.current) return;
    
    isTogglingRef.current = true;
    setMobileMenuOpen(prev => !prev);
    
    setTimeout(() => {
      isTogglingRef.current = false;
    }, 100);
  };

  if (!mounted) {
    return null;
  }

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Wallet className="h-8 w-8 text-primary" />
            <span className="font-bold text-2xl">MyBudgetPal</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Link 
              href="/signin" 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link href="/signup">
              <Button size="sm" variant="secondary" className="hover:bg-secondary/90 transition-colors">Get Started</Button>
            </Link>
          </div>
          
          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              ref={menuButtonRef}
              onClick={handleMenuToggle}
              className="p-2 rounded-full bg-background/80 border border-border hover:bg-accent transition-colors menu-toggle"
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu - improved implementation */}
        {mobileMenuOpen && (
          <div 
            ref={mobileMenuRef}
            className="absolute right-4 top-16 w-48 py-2 bg-background rounded-md shadow-lg border border-border z-50 mobile-menu"
          >
            <Link 
              href="/signin" 
              className="block px-4 py-2 text-sm hover:bg-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="block px-4 py-2 text-sm font-medium text-primary hover:bg-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="container mx-auto py-24 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500 leading-tight">
            Take control of your <br className="hidden sm:block" />
            personal finances
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Track expenses, set budgets, and reach your financial goals with our intuitive and easy-to-use personal finance tool.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <Link href="/signup">
                <Button size="lg" className="gap-2 w-full sm:w-auto px-8 py-6 text-base hover:bg-primary/90 transition-all hover:shadow-md">
                  Start 30-day free trial <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/dashboard">
                <Button size="lg" className="gap-2 w-full sm:w-auto px-8 py-6 text-base hover:bg-primary/90 transition-all hover:shadow-md">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <Link href={user ? "/dashboard" : "/signin"}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-6 text-base hover:bg-accent transition-all">
                {user ? "Go to your Dashboard" : "Learn More"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="container mx-auto py-24 px-4 border-b border-border/30">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-foreground/95">Money management made simple</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Our intuitive app helps you create budgets, track expenses, and achieve your financial goals with ease.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              title: "Set up in minutes",
              description: "Create your first budget in less than 5 minutes with our guided setup process. No financial expertise required - perfect for beginners taking control of their finances.",
              icon: Rocket,
            },
            {
              title: "Access anywhere",
              description: "Use on any device with our progressive web app - no downloads needed. Your budget is always accessible on your phone, tablet, or computer for convenient financial tracking.",
              icon: Laptop,
            },
            {
              title: "Work offline",
              description: "Track expenses even without internet connection - your data syncs automatically when you reconnect. Never miss logging an expense, even in areas with poor connectivity.",
              icon: WifiOff,
            },
          ].map((item, index) => (
            <div
              key={index}
              className="rounded-xl border bg-background p-6 shadow-sm hover:shadow-md text-center"
            >
              <div className="inline-flex items-center justify-center p-3 rounded-lg bg-primary/10 mb-4">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground/95">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* App Screenshot */}
      <section className="container mx-auto py-24 px-4 bg-sky-50/70 dark:bg-sky-950/5">
        <div className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-tr from-primary/5 via-primary/10 to-background border shadow-xl overflow-hidden">
          <div className="p-2">
            <div className="w-full h-[300px] md:h-[500px] bg-card rounded-xl flex flex-col items-center justify-center">
              <div className="text-center mb-8">
                <div className="inline-flex bg-primary/20 p-4 rounded-full mb-4">
                  <DollarSign className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground/95 mb-2">Comprehensive Dashboard Experience</h3>
                <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
                  Intuitive financial visualizations help you understand spending patterns, track budget progress, and make informed decisions with real-time expense tracking and analytics.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 md:p-6 w-full max-w-4xl bg-background/50 rounded-lg border border-primary/10 shadow-sm">
                <div className="bg-background p-4 rounded-md shadow-sm border">
                  <h4 className="font-medium text-sm mb-2">Monthly Spending Breakdown</h4>
                  <div className="h-20 bg-primary/10 rounded-md mb-2"></div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Food & Dining</span>
                      <span>$320</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Transportation</span>
                      <span>$150</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Housing & Utilities</span>
                      <span>$800</span>
                    </div>
                  </div>
                </div>
                <div className="bg-background p-4 rounded-md shadow-sm border">
                  <h4 className="font-medium text-sm mb-2">Budget Progress Tracking</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Food & Dining</span>
                        <span>80%</span>
                      </div>
                      <div className="h-2 bg-primary/20 rounded-full">
                        <div className="h-2 bg-primary rounded-full w-4/5"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Transportation</span>
                        <span>60%</span>
                      </div>
                      <div className="h-2 bg-primary/20 rounded-full">
                        <div className="h-2 bg-primary rounded-full w-3/5"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Entertainment</span>
                        <span>45%</span>
                      </div>
                      <div className="h-2 bg-primary/20 rounded-full">
                        <div className="h-2 bg-primary rounded-full w-2/5"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-background p-4 rounded-md shadow-sm border">
                  <h4 className="font-medium text-sm mb-2">Recent Expense Transactions</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs py-1 border-b">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span>Grocery Store</span>
                      </div>
                      <span>-$65.20</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-1 border-b">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Monthly Income</span>
                      </div>
                      <span>+$2,500.00</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-1">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span>Restaurant Dinner</span>
                      </div>
                      <span>-$42.80</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-6">
                Visualize your financial journey with detailed analytics and instant insights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto py-24 px-4 border-b border-border/30">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-foreground/95">Everything you need to manage your money</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            MyBudgetPal combines powerful features with a simple interface to make managing your finances effortless.
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
              icon: Target,
            },
            {
              title: 'Scheduled Payments',
              description: 'Never miss a bill with reminders for recurring expenses.',
              icon: Calendar,
            },
            {
              title: 'Secure & Private',
              description: 'Your financial data is encrypted and never shared with third parties.',
              icon: Shield,
            },
          ].map((feature, index) => (
            <div 
              key={index} 
              className={cn(
                "rounded-xl border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:translate-y-[-5px] duration-300",
                index === 3 || index === 4 ? "md:translate-y-4" : ""
              )}
            >
              <div className="inline-flex items-center justify-center p-3 rounded-lg bg-primary/10 mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground/95">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mobile Experience */}
      <section className="container mx-auto py-24 px-4 bg-sky-50/70 dark:bg-sky-950/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
              Mobile Experience
            </div>
            <h2 className="text-3xl font-bold mb-6 text-foreground/95">Budget tracking that works anywhere</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-xl leading-relaxed">
              Track expenses on the go with our responsive and offline-capable progressive web app. Keep your financial management uninterrupted, even without an internet connection.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                'Works on any device with a web browser',
                'Install as a PWA for app-like experience',
                'Full offline functionality for expense tracking',
                'Automatic syncing across all your devices when online',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="rounded-full p-1 bg-primary/10 mt-1">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <div className="hidden md:block">
              <p className="font-medium text-foreground/90 mb-2">Track expenses anywhere, even offline</p>
              <p className="text-muted-foreground leading-relaxed max-w-xl">
                Never miss recording an expense with our offline-first approach. Add transactions even without internet access, and they'll automatically sync to your account when you reconnect.
              </p>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-64 h-[500px] rounded-3xl bg-gradient-to-tr from-primary/5 via-primary/10 to-background border-4 border-background shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 p-2">
                <div className="w-full h-full bg-card rounded-2xl flex items-center justify-center flex-col">
                  <Smartphone className="h-10 w-10 text-primary mb-4" />
                  <div className="text-center">
                    <p className="font-semibold">Mobile App Preview</p>
                    <p className="text-xs text-muted-foreground">Budget tracking that works offline</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-tr from-primary/5 via-background to-primary/5 py-24 border-b border-border/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground/95">What our users say</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover how MyBudgetPal has transformed financial management for our users.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "MyBudgetPal revolutionized my expense tracking habits. The budget tracking features made it possible to save for my dream vacation in just 6 months by helping me understand my spending patterns.",
                name: "Alex Johnson",
                title: "Product Designer"
              },
              {
                quote: "As someone who struggled with financial management, this app has been transformative. Now I track every expense, understand my spending habits, and consistently reach my monthly financial goals.",
                name: "Samantha Lee",
                title: "Marketing Manager"
              },
              {
                quote: "Setting category-specific budgets and visualizing my expense management has made household finance so much simpler. The best personal budget tool I've ever used.",
                name: "Michael Roberts",
                title: "Software Engineer"
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-background rounded-xl border p-6 shadow-sm hover:shadow-md transition-all">
                <div className="mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="italic mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto py-24 px-4 bg-sky-50/70 dark:bg-sky-950/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground/95">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Find answers to common questions about MyBudgetPal
            </p>
          </div>
          
          <div className="space-y-4">
            {[
              {
                question: "How do I install MyBudgetPal on my device?",
                answer: "MyBudgetPal is a progressive web app (PWA) that works in any modern browser. When you visit our site, you'll see an 'Add to Home Screen' option (on mobile) or an install button in your browser's address bar (on desktop). This lets you install the app for offline use without going through an app store."
              },
              {
                question: "Is MyBudgetPal suitable for someone new to budgeting?",
                answer: "Absolutely! MyBudgetPal was designed with beginners in mind. Our guided setup process and intuitive interface make it easy to start budgeting even if you've never done it before. We focus on simplicity and clarity to help you build good financial habits from day one."
              },
              {
                question: "How does MyBudgetPal help me reach my financial goals?",
                answer: "MyBudgetPal allows you to set specific savings goals and tracks your progress with visual indicators. You can create targets for emergency funds, vacations, major purchases, or debt payoff, and we'll show you exactly how close you are to achieving each goal based on your budget and actual spending."
              },
              {
                question: "Is my financial data secure with MyBudgetPal?",
                answer: "Your security is our priority. MyBudgetPal uses bank-level encryption to protect your data, and our progressive web app includes built-in security features. We never sell your personal information, and your data is encrypted both in transit and at rest, following industry best practices."
              },
              {
                question: "What happens after my 30-day free trial ends?",
                answer: "After your 30-day free trial, you can choose from our flexible subscription plans starting at just $4.99/month. All your data and budgets will remain intact when you subscribe. We also offer a basic free tier that lets you continue using core budgeting features."
              }
            ].map((faq, i) => (
              <div key={i} className="border rounded-lg bg-background overflow-hidden shadow-sm hover:shadow-md transition-all">
                <button
                  className="flex items-center justify-between w-full p-4 text-left"
                  onClick={() => toggleFaq(i)}
                >
                  <span className="font-medium text-foreground/95">{faq.question}</span>
                  {openFaqIndex === i ? (
                    <ChevronUp className="h-5 w-5 text-primary" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                {openFaqIndex === i && (
                  <div className="p-4 pt-0 text-muted-foreground">
                    <p className="leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto py-24 px-4 border-t border-border/30">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-tr from-primary/20 via-primary/10 to-background rounded-2xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold mb-4 text-foreground/95">Ready to transform your financial habits?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of users who have taken control of their finances with MyBudgetPal.
            Start your 30-day free trial today - no credit card required!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2 px-8 py-6 text-base hover:bg-primary/90 transition-all hover:shadow-md">
                Start 30-day free trial <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={user ? "/dashboard" : "/signin"}>
              <Button size="lg" variant="outline" className="px-8 py-6 text-base hover:bg-accent transition-all">
                {user ? "Go to your Dashboard" : "Learn More"}
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
                <span className="font-bold text-xl">MyBudgetPal</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Your personal finance companion for a better financial future.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-foreground/95">Product</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">FAQs</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-foreground/95">Company</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-foreground/95">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} MyBudgetPal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 