'use client';

import { X } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export function InstallAppBanner() {
  const { canPromptInstall, platform, promptInstall, dismissPrompt } = useInstallPrompt();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (canPromptInstall) {
      // Slight delay to allow the page to load first
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [canPromptInstall]);

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-50 shadow-lg",
      "animate-slideUp"
    )}>
      <div className="flex items-center justify-between max-w-screen-lg mx-auto">
        <div className="flex-1 mr-4">
          <p className="font-medium">Install Budget Bud</p>
          <p className="text-sm text-muted-foreground">
            {platform === 'ios' ? 
              "Add to Home Screen for the best experience" : 
              "Install our app for easier access and offline use"
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          {platform !== 'ios' && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => {
                promptInstall();
                setIsVisible(false);
              }}
            >
              Install
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              dismissPrompt();
              setIsVisible(false);
            }}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </div>
    </div>
  );
} 