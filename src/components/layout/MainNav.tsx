'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboardIcon, 
  LineChartIcon, 
  PieChartIcon, 
  SettingsIcon, 
  LogOutIcon,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

const links = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboardIcon,
  },
  {
    name: 'Budgets',
    href: '/budgets',
    icon: PieChartIcon,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: LineChartIcon,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: SettingsIcon,
  },
];

interface MainNavProps {
  onNavItemClick?: () => void;
}

export function MainNav({ onNavItemClick }: MainNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [activeLink, setActiveLink] = useState(pathname);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Track route changes
  useEffect(() => {
    if (pathname !== activeLink) {
      setIsTransitioning(true);
      
      const timer = setTimeout(() => {
        setActiveLink(pathname);
        setIsTransitioning(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [pathname, activeLink]);

  const handleNavItemClick = (href: string) => {
    // Only navigate if it's a different route
    if (href !== pathname) {
      setIsTransitioning(true);
      
      // Call the onNavItemClick from the parent component first
      if (onNavItemClick) {
        onNavItemClick();
      }
      
      // Slightly longer delay for navigation to ensure menu animation starts
      setTimeout(() => {
        router.push(href);
      }, 100);
    } else if (onNavItemClick) {
      // If it's the same route, just close the menu
      onNavItemClick();
    }
  };

  const handleLogout = () => {
    if (onNavItemClick) {
      onNavItemClick();
    }
    // Delay logout action to allow menu close animation
    setTimeout(() => {
      logout();
    }, 100);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Desktop Logo Header - hidden on mobile */}
      <div className="hidden md:flex items-center space-x-2 px-6 py-4">
        <div className="relative w-8 h-8 flex-shrink-0">
          <Image 
            src="/icons/mainLogo.png" 
            alt="MyBudgetBud Logo" 
            width={32} 
            height={32} 
            className="object-contain"
          />
        </div>
        <Link href="/dashboard" className="font-bold text-xl">
          MyBudgetBud
        </Link>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 space-y-2 px-4 py-4">
        {links.map((link, index) => (
          <button
            key={link.href}
            onClick={() => handleNavItemClick(link.href)}
            className={cn(
              "flex w-full items-center space-x-3 rounded-md px-4 py-3 text-sm font-medium nav-item text-left",
              pathname === link.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
            style={{ 
              animationDelay: `${index * 50}ms`,
              animation: isTransitioning ? 'none' : 'slideUp 0.3s ease-out forwards'
            }}
          >
            <link.icon className={cn(
              "h-5 w-5",
              pathname === link.href && "animate-pulse"
            )} />
            <span>{link.name}</span>
          </button>
        ))}
      </nav>
      
      {/* Logout Button */}
      <div className="border-t border-border px-4 py-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center space-x-3 rounded-md px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-destructive hover:text-destructive-foreground nav-item"
        >
          <LogOutIcon className="h-5 w-5" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
} 