'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, LayoutDashboard, PieChart, Settings, Wallet, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useTheme } from '@/providers/theme-provider';

export function SidebarNav() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  
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
        <Link href="/dashboard" prefetch={true} className="flex items-center gap-2">
          <span className="font-bold text-xl">BudgetPal</span>
        </Link>
      </div>
      
      {/* Navigation Links - Using Next.js Link components */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              prefetch={true}
              className={`flex items-center gap-3 px-4 py-2 rounded-md ${
                pathname === item.path ? "bg-primary text-white" : "text-gray-600"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
      
      {/* Theme Toggle and Logout Button */}
      <div className="px-4 py-6 border-t">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm">Theme</span>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2"
          >
            {theme === 'dark' ? (
              <Sun size={18} className="text-yellow-400" />
            ) : (
              <Moon size={18} className="text-slate-700" />
            )}
          </button>
        </div>
        <button
          className="flex items-center gap-3 w-full px-4 py-2 text-gray-600"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
} 