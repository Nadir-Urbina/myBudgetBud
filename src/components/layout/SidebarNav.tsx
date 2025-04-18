'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard, PieChart, DollarSign, Settings, Wallet, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { useTheme } from '@/providers/theme-provider';

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  
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
      icon: <LayoutDashboard size={20} />,
    },
    {
      path: '/budgets',
      label: 'Budgets',
      icon: <Wallet size={20} />,
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: <PieChart size={20} />,
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: <Settings size={20} />,
    },
  ];
  
  return (
    <div className="flex flex-col h-full">
      {/* App Logo/Name */}
      <div className="flex items-center h-14 px-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-bold text-xl">BudgetPal</span>
        </Link>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={pathname === item.path ? "default" : "ghost"}
              className={cn(
                "w-full justify-start text-sm font-medium transition-colors",
                "h-11 px-4",
                pathname === item.path ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => handleNavItemClick(item.path)}
            >
              <span className="flex items-center gap-3">
                {item.icon}
                {item.label}
              </span>
            </Button>
          ))}
        </div>
      </nav>
      
      {/* Theme Toggle and Logout Button */}
      <div className="px-4 py-6 border-t">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Theme</span>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-accent transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun size={18} className="text-yellow-400" />
            ) : (
              <Moon size={18} className="text-slate-700" />
            )}
          </button>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          onClick={handleLogout}
        >
          <span className="flex items-center gap-3">
            <LogOut size={20} />
            Logout
          </span>
        </Button>
      </div>
    </div>
  );
} 