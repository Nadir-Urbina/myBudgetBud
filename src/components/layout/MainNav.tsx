'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu, X, LayoutDashboard, PieChart, DollarSign, Settings, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function MainNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);
  
  const handleNavItemClick = (path: string) => {
    if (pathname === path) return;
    router.push(path);
  };
  
  const handleLogout = () => {
    signOut(auth).catch(error => console.error('Error signing out:', error));
  };
  
  const navItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
    },
    {
      path: '/budgets',
      label: 'Budgets',
      icon: <Wallet size={18} />,
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: <PieChart size={18} />,
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: <Settings size={18} />,
    },
  ];
  
  return (
    <div className="relative">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="flex items-center justify-center">
              <span className="font-bold text-xl">BudgetBud</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={pathname === item.path ? "default" : "ghost"}
                  className={`nav-item ${pathname === item.path ? "bg-primary text-primary-foreground" : "text-foreground"}`}
                  onClick={() => handleNavItemClick(item.path)}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </Button>
              ))}
              <Button
                variant="ghost"
                className="nav-item text-foreground"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </nav>
            <Button
              variant="ghost"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile menu with smoother animation */}
      <div 
        className={`fixed inset-0 top-14 z-40 md:hidden transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div 
          className={`fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`} 
          onClick={() => setMobileMenuOpen(false)}
        ></div>
        <nav className="fixed top-0 right-0 h-[calc(100vh-3.5rem)] w-full max-w-sm bg-background p-6 shadow-lg">
          <div className="flex flex-col space-y-3">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={pathname === item.path ? "default" : "ghost"}
                className={`justify-start nav-item ${pathname === item.path ? "bg-primary text-primary-foreground" : "text-foreground"}`}
                onClick={() => handleNavItemClick(item.path)}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </Button>
            ))}
            <Button
              variant="ghost"
              className="justify-start text-foreground nav-item"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </nav>
      </div>
    </div>
  );
}