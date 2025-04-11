'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ 
  children,
  className
}: PageTransitionProps) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentChildren, setCurrentChildren] = useState(children);
  const [prevPathname, setPrevPathname] = useState(pathname);

  useEffect(() => {
    // If the path changes, trigger transition
    if (pathname !== prevPathname) {
      setIsTransitioning(true);
      
      // After animation completes, update the current children
      const timer = setTimeout(() => {
        setCurrentChildren(children);
        setIsTransitioning(false);
        setPrevPathname(pathname);
      }, 300); // match this with CSS animation duration
      
      return () => clearTimeout(timer);
    }
  }, [pathname, children, prevPathname]);

  return (
    <div 
      className={cn(
        "transition-all duration-300 w-full", 
        isTransitioning ? "opacity-0 transform translate-x-4" : "opacity-100 transform translate-x-0",
        className
      )}
    >
      {currentChildren}
    </div>
  );
} 