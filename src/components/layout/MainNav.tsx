'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu, X, LayoutDashboard, PieChart, DollarSign, Settings, Wallet } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Separate component for mobile menu button
function MobileMenuButton() {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  useEffect(() => {
    setIsMounted(true);
    
    // Close menu on route changes
    const handleRouteChange = () => {
      setIsOpen(false);
    };
    
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);
  
  // Close menu when pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);
  
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
  
  const handleNavigation = (path: string) => {
    setIsOpen(false);
    if (pathname !== path) {
      router.push(path);
    }
  };
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  // Mobile Menu component
  const MobileMenu = () => {
    if (!isMounted) return null;
    
    const menuContent = (
      <div 
        className="fixed z-50 mt-2 w-56 rounded-md border border-border bg-background shadow-lg"
        style={{
          top: buttonRef.current ? buttonRef.current.getBoundingClientRect().bottom + 8 : 60,
          right: buttonRef.current ? window.innerWidth - buttonRef.current.getBoundingClientRect().right : 16,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="py-1">
          {navItems.map((item) => (
            <div 
              key={item.path}
              className={`flex cursor-pointer items-center px-4 py-2 text-sm font-medium transition-colors ${
                pathname === item.path 
                  ? "bg-primary/10 text-primary" 
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
              onClick={() => handleNavigation(item.path)}
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
            </div>
          ))}
          <div className="my-1 border-t border-border"></div>
          <div 
            className="flex cursor-pointer items-center px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
          >
            <LogOut size={18} />
            <span className="ml-2">Logout</span>
          </div>
        </div>
      </div>
    );
    
    return createPortal(menuContent, document.body);
  };
  
  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        className="p-2 rounded-md"
        onClick={toggleMenu}
        aria-label="Toggle Menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      
      {isOpen && <MobileMenu />}
    </div>
  );
}

export function MainNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current && 
        buttonRef.current && 
        !menuRef.current.contains(event.target as Node) && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    }
    
    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);
  
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
    <div className="flex items-center justify-between py-2 px-4 border-b border-border bg-background">
      <div className="flex items-center">
        <Link href="/dashboard" className="font-semibold text-lg text-primary">
          MyBudgetPal
        </Link>
      </div>
      
      {/* Desktop Navigation */}
      <nav className="mx-6 hidden md:flex items-center space-x-6">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            prefetch={true}
            scroll={true}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              route.active ? "text-primary font-semibold" : "text-muted-foreground"
            )}
            aria-current={route.active ? "page" : undefined}
          >
            {route.label}
          </Link>
        ))}
      </nav>
      
      {/* Desktop Actions */}
      <div className="ml-auto hidden md:flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
        <Button
          asChild
          size="sm"
          className="ml-2"
        >
          <Link href="/dashboard/add-expense">
            New Expense
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      
      {/* Mobile Menu Button */}
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          ref={menuRef}
          className="absolute z-50 top-[60px] right-4 w-[200px] rounded-md shadow-lg bg-popover border border-border"
        >
          <div className="p-2 flex flex-col">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "p-2 text-sm rounded-md",
                  route.active 
                    ? "bg-accent text-accent-foreground font-medium" 
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                )}
              >
                {route.label}
              </Link>
            ))}
            
            <hr className="my-2 border-border" />
            
            <button
              onClick={handleLogout}
              className="p-2 text-sm text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground rounded-md flex items-center"
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