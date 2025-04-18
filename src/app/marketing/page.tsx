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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Prevent hydration errors by only rendering the page once mounted
  useEffect(() => {
    setMounted(true);
  }, []);

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
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full bg-background/80 border border-border hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun size={18} className="text-yellow-400" />
              ) : (
                <Moon size={18} className="text-slate-700" />
              )}
            </button>
            
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
          
          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full bg-background/80 border border-border hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun size={16} className="text-yellow-400" />
              ) : (
                <Moon size={16} className="text-slate-700" />
              )}
            </button>
            
            <div className="relative">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-full bg-background/80 border border-border hover:bg-accent transition-colors"
                aria-label="Menu"
              >
                <Menu size={16} />
              </button>
              
              {mobileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 py-2 bg-background rounded-md shadow-lg border border-border z-50">
                  <Link 
                    href="/signin" 
                    className="block px-4 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/signup" 
                    className="block px-4 py-2 text-sm font-medium text-primary hover:bg-accent transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto pt-16 md:pt-20 pb-20 md:pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
            Your Personal Budget Companion
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Take control of your finances with{' '}
            <span className="text-primary">MyBudgetPal</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track expenses, set budgets, and reach your financial goals with our intuitive and easy-to-use personal finance tool.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                Start 30-day free trial <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/signin">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="container mx-auto pb-24 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              title: "Easy to start",
              description: "Set up your first budget in minutes, no financial expertise required",
              icon: Clock,
            },
            {
              title: "Accessible anywhere",
              description: "Use on any device with our progressive web app - no downloads needed",
              icon: Globe,
            },
            {
              title: "Always available",
              description: "Track expenses even offline - your data syncs when you reconnect",
              icon: Wifi,
            },
          ].map((item, index) => (
            <div
              key={index}
              className="rounded-xl border bg-background p-6 shadow-sm transition-all hover:shadow-md text-center"
            >
              <div className="inline-flex items-center justify-center p-3 rounded-lg bg-primary/10 mb-4">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* App Screenshot */}
      <section className="container mx-auto px-4 -mt-16 md:-mt-24 mb-16 md:mb-24">
        <div className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-tr from-primary/5 via-primary/10 to-background border shadow-xl overflow-hidden">
          <div className="p-2">
            <div className="w-full h-[300px] md:h-[500px] bg-card rounded-xl flex flex-col items-center justify-center">
              <div className="text-center">
                <div className="inline-flex bg-primary/20 p-4 rounded-full mb-4">
                  <DollarSign className="h-10 w-10 text-primary" />
                </div>
                <p className="text-lg font-medium">App Dashboard Preview</p>
                <p className="text-muted-foreground mb-6">Beautiful visualizations of your finances</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 md:p-6 w-full max-w-4xl bg-background/50 rounded-lg border border-primary/10 shadow-sm">
                <div className="bg-background p-4 rounded-md shadow-sm border">
                  <h4 className="font-medium text-sm mb-2">Monthly Spending</h4>
                  <div className="h-20 bg-primary/10 rounded-md mb-2"></div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Food</span>
                      <span>$320</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Transport</span>
                      <span>$150</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Housing</span>
                      <span>$800</span>
                    </div>
                  </div>
                </div>
                <div className="bg-background p-4 rounded-md shadow-sm border">
                  <h4 className="font-medium text-sm mb-2">Budget Progress</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Food</span>
                        <span>80%</span>
                      </div>
                      <div className="h-2 bg-primary/20 rounded-full">
                        <div className="h-2 bg-primary rounded-full w-4/5"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Transport</span>
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
                  <h4 className="font-medium text-sm mb-2">Recent Transactions</h4>
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
                        <span>Salary</span>
                      </div>
                      <span>+$2,500.00</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-1">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span>Restaurant</span>
                      </div>
                      <span>-$42.80</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-6">
                See your complete financial picture at a glance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto py-24 px-4">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Everything you need to manage your money</h2>
          <p className="text-lg text-muted-foreground">
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
            <h2 className="text-3xl font-bold mb-6">Take MyBudgetPal with you everywhere</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Access your finances on the go with our responsive web app. Add expenses in real-time and keep track of your budget wherever you are.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                'Works on any device with a web browser',
                'Install as a PWA for app-like experience',
                'Access your budget even without internet connection',
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
              Discover how MyBudgetPal has transformed financial management for our users.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "MyBudgetPal's budget tracking features helped me save for my dream vacation in just 6 months. The visualization makes managing my expenses fun and insightful!",
                name: "Alex Johnson",
                title: "Freelance Designer"
              },
              {
                quote: "As someone who struggled with expense management, this app has been a game-changer. I've finally achieved my financial goals by seeing exactly where every dollar goes.",
                name: "Samantha Lee",
                title: "Marketing Manager"
              },
              {
                quote: "I love how I can track different budget categories. It's made managing household expenses with my partner so much easier and helped us reach our long-term financial goals.",
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

      {/* FAQ Section */}
      <section className="container mx-auto py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about MyBudgetPal
            </p>
          </div>
          
          <div className="space-y-4">
            {[
              {
                question: "Do I need to download an app to use MyBudgetPal?",
                answer: "No, there's no download required! MyBudgetPal is a Progressive Web App (PWA) that works directly in your browser. You can also add it to your home screen for app-like experience on mobile devices, but this is optional."
              },
              {
                question: "Is MyBudgetPal suitable for someone new to budgeting?",
                answer: "Absolutely! MyBudgetPal was designed with beginners in mind. The intuitive interface guides you through setting up your first budget, and our helpful tips make financial management accessible to everyone, regardless of experience level."
              },
              {
                question: "Is my financial data secure with MyBudgetPal?",
                answer: "Your security is our top priority. MyBudgetPal uses bank-level encryption to protect your data, and we never share your information with third parties. Your financial data is stored securely, and you maintain complete control over your information."
              }
            ].map((faq, i) => (
              <div key={i} className="border rounded-lg bg-background overflow-hidden">
                <button
                  className="flex items-center justify-between w-full p-4 text-left"
                  onClick={() => toggleFaq(i)}
                >
                  <span className="font-medium">{faq.question}</span>
                  {openFaqIndex === i ? (
                    <ChevronUp className="h-5 w-5 text-primary" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                {openFaqIndex === i && (
                  <div className="p-4 pt-0 text-muted-foreground">
                    <p>{faq.answer}</p>
                  </div>
                )}
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
            Join thousands of users who have taken control of their finances with MyBudgetPal.
            Start your journey to financial freedom today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start 30-day free trial <ArrowRight className="h-4 w-4" />
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
                <span className="font-bold text-xl">MyBudgetPal</span>
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
            <p>© {new Date().getFullYear()} MyBudgetPal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 