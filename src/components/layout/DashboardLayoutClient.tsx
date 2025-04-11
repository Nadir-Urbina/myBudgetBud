'use client';

import { useEffect, useState, useRef } from 'react';
import { MainNav } from '@/components/layout/MainNav';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { PageTransition } from '@/components/ui/page-transition';
import { getAuth } from "firebase/auth";

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuExiting, setMenuExiting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    // Set loading to false when component mounts
    setIsLoading(false);
    
    // Only check authentication and redirect if we haven't redirected already
    // and we're not already on the signin page
    if (!redirected && !loading && !user && !pathname.includes('/signin')) {
      console.log('User not authenticated, redirecting to signin');
      setRedirected(true);
      router.push('/signin');
    }
  }, [user, loading, router, pathname, redirected]);

  useEffect(() => {
    // Close the mobile menu when the route changes
    setMenuExiting(true);
    const timer = setTimeout(() => {
      setMobileMenuOpen(false);
      setMenuExiting(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleMenuToggle = () => {
    if (mobileMenuOpen) {
      // Start the exit animation
      setMenuExiting(true);
      
      // Actually close the menu after animation completes
      setTimeout(() => {
        setMobileMenuOpen(false);
        setMenuExiting(false);
      }, 300); // Match to your animation duration
    } else {
      setMobileMenuOpen(true);
    }
  };
  
  const handleNavItemClick = () => {
    // Start the exit animation
    setMenuExiting(true);
    
    // Actually close the menu after animation completes
    setTimeout(() => {
      setMobileMenuOpen(false);
      setMenuExiting(false);
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

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

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
        <MainNav />
      </aside>

      {/* Mobile menu */}
      <div className="flex flex-col flex-1 md:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-2 border-b bg-card/80 backdrop-blur md:hidden">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 relative flex-shrink-0">
              <Image 
                src="/icons/mainLogo.png" 
                alt="MyBudgetBud Logo" 
                width={32} 
                height={32} 
                className="object-contain"
              />
            </div>
            <h1 className="text-lg font-semibold">MyBudgetBud</h1>
          </div>
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
            <MainNav onNavItemClick={handleNavItemClick} />
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
} 