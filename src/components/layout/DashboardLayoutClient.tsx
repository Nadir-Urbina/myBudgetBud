'use client';

import { useEffect, useState, useRef } from 'react';
import { MainNav } from '@/components/layout/MainNav';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, LogOut, Wallet, PieChart, Settings, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { PageTransition } from '@/components/ui/page-transition';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useTheme } from '@/providers/theme-provider';

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuExiting, setMenuExiting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Authentication check - only redirect once and only if needed
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Close the mobile menu when the route changes
    if (mobileMenuOpen) {
      setMenuExiting(true);
      const timer = setTimeout(() => {
        setMobileMenuOpen(false);
        setMenuExiting(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [pathname, mobileMenuOpen]);

  const handleMenuToggle = () => {
    if (mobileMenuOpen) {
      // Start the exit animation
      setMenuExiting(true);
      
      // Actually close the menu after animation completes
      setTimeout(() => {
        setMobileMenuOpen(false);
        setMenuExiting(false);
        // Enable scrolling on the main content
        if (mainContentRef.current) {
          mainContentRef.current.style.overflow = 'auto';
        }
        document.body.style.overflow = '';
      }, 300); // Match to your animation duration
    } else {
      setMobileMenuOpen(true);
      // Disable scrolling on the main content
      if (mainContentRef.current) {
        mainContentRef.current.style.overflow = 'hidden';
      }
      // Only disable body scroll on mobile
      if (window.innerWidth < 768) {
        document.body.style.overflow = 'hidden';
      }
    }
  };
  
  const handleNavItemClick = () => {
    // Start the exit animation
    setMenuExiting(true);
    
    // Actually close the menu after animation completes
    setTimeout(() => {
      setMobileMenuOpen(false);
      setMenuExiting(false);
      // Re-enable scrolling
      if (mainContentRef.current) {
        mainContentRef.current.style.overflow = 'auto';
      }
      document.body.style.overflow = '';
    }, 300); // Match to your animation duration
  };

  // Close menu when escape key is pressed
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        handleMenuToggle();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  // Ensure overflow is properly reset on component unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Reset scrolling when route changes
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
    document.body.style.overflow = '';
  }, [pathname]);

  // Show loading indicator while checking authentication
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // Don't render dashboard for non-authenticated users
  if (!user) {
    return <div className="flex h-screen items-center justify-center">Redirecting to sign in...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - hidden on mobile, visible on medium screens and up */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 border-r bg-card">
        <SidebarNav />
      </aside>

      {/* Mobile menu */}
      <div className="flex flex-col flex-1 md:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-2 border-b bg-card/80 backdrop-blur md:hidden">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 relative flex-shrink-0">
              <Image 
                src="/icons/mainLogo.png" 
                alt="MyBudgetPal Logo" 
                width={32} 
                height={32} 
                className="object-contain"
              />
            </div>
            <h1 className="text-lg font-semibold">MyBudgetPal</h1>
          </div>
          <div className="flex items-center gap-2">
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
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleMenuToggle}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </header>

        {/* Mobile menu overlay */}
        {(mobileMenuOpen || menuExiting) && (
          <div 
            ref={menuRef}
            className="absolute inset-x-0 top-14 bottom-0 z-40 bg-background overflow-y-auto"
            style={{ 
              animation: menuExiting 
                ? 'slideOutLeft 0.3s ease-out forwards' 
                : 'slideInFromLeft 0.3s ease-out forwards'
            }}
          >
            <nav className="flex flex-col p-4 space-y-2">
              {/* Use the same nav items as in SidebarNav but with mobile styling */}
              <div className="flex flex-col space-y-1 pb-4">
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                    pathname === '/dashboard' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={handleNavItemClick}
                >
                  <Menu className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/budgets"
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                    pathname === '/budgets' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={handleNavItemClick}
                >
                  <Wallet className="h-4 w-4" />
                  Budgets
                </Link>
                <Link
                  href="/analytics"
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                    pathname === '/analytics' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={handleNavItemClick}
                >
                  <PieChart className="h-4 w-4" />
                  Analytics
                </Link>
                <Link
                  href="/settings"
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                    pathname === '/settings' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={handleNavItemClick}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </div>
              <div className="border-t pt-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm font-medium text-muted-foreground"
                  onClick={() => signOut(auth)}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </nav>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6" ref={mainContentRef}>
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}