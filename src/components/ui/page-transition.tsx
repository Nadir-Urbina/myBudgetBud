'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
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
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If the path changes, update immediately but with animation
    if (pathname !== prevPathname) {
      setIsTransitioning(true);
      
      // Allow the fade-out to occur
      setTimeout(() => {
        // Update content with new children
        setCurrentChildren(children);
        setPrevPathname(pathname);
        setIsTransitioning(false);
        
        // Ensure the page scrolls to top when navigating
        if (contentRef.current && contentRef.current.parentElement) {
          contentRef.current.parentElement.scrollTop = 0;
        }
        
        // Make sure body scroll is enabled
        document.body.style.overflow = '';
      }, 150);
    } else {
      // Same path, just update the children
      setCurrentChildren(children);
    }
  }, [pathname, children, prevPathname]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div 
      ref={contentRef}
      className={cn(
        "w-full", 
        isTransitioning ? "opacity-0" : "opacity-100",
        "transition-opacity duration-150 ease-in-out",
        className
      )}
    >
      {currentChildren}
    </div>
  );
} 