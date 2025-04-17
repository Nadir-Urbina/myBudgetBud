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
    // If the path changes, update immediately but with animation
    if (pathname !== prevPathname) {
      // Update content immediately but with transition effect
      setCurrentChildren(children);
      setPrevPathname(pathname);
    }
  }, [pathname, children, prevPathname]);

  return (
    <div 
      className={cn(
        "transition-opacity duration-200 ease-in-out w-full", 
        className
      )}
      key={pathname}
      style={{
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      {currentChildren}
    </div>
  );
} 