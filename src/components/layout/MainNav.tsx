'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu, X, Wallet } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function MainNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);
  
  const handleLogout = async () => {
    await logout();
    router.push("/signin");
  };
  
  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      active: pathname === "/dashboard",
    },
    {
      href: "/budgets",
      label: "Budgets",
      active: pathname?.includes("/budgets"),
    },
    {
      href: "/expenses",
      label: "Expenses",
      active: pathname?.includes("/expenses"),
    },
    {
      href: "/settings",
      label: "Settings",
      active: pathname === "/settings",
    },
  ];

  return (
    <div className="flex items-center justify-between py-2 px-4 border-b">
      <div className="flex items-center">
        <Link href="/dashboard" className="font-semibold text-lg">
          MyBudgetPal
        </Link>
      </div>
      
      {/* Desktop Navigation - Using Next.js Link */}
      <nav className="mx-6 hidden md:flex items-center space-x-6">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            prefetch={true}
            className={route.active ? "text-primary font-semibold" : "text-muted-foreground"}
          >
            {route.label}
          </Link>
        ))}
      </nav>
      
      {/* Desktop Actions */}
      <div className="ml-auto hidden md:flex items-center space-x-2">
        <button 
          onClick={handleLogout}
          className="text-sm flex items-center"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </button>
        <Link
          href="/expenses/add"
          className="bg-primary text-white px-3 py-1 rounded text-sm ml-2 flex items-center"
        >
          New Expense
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
      
      {/* Mobile Menu Button */}
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="md:hidden p-2"
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      
      {/* Mobile Menu - Simplified */}
      {mobileMenuOpen && (
        <div 
          ref={menuRef}
          className="absolute z-50 top-[60px] right-4 w-[200px] bg-white shadow-lg border rounded-md"
        >
          <div className="p-2 flex flex-col">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="p-2 text-sm"
                prefetch={true}
              >
                {route.label}
              </Link>
            ))}
            
            <hr className="my-2" />
            
            <button
              onClick={handleLogout}
              className="p-2 text-sm flex items-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}