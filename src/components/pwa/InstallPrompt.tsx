'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  // Track whether the app is already installed
  const [isInstalled, setIsInstalled] = useState(false);

  // Track dismiss count
  const [dismissCount, setDismissCount] = useState(0);
  
  useEffect(() => {
    // Load the dismiss count from localStorage
    const savedDismissCount = localStorage.getItem('pwa-dismiss-count');
    if (savedDismissCount) {
      setDismissCount(parseInt(savedDismissCount, 10));
    }
    
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      
      // Check conditions before showing prompt
      const lastDismissTime = localStorage.getItem('pwa-last-dismiss-time');
      const currentTime = new Date().getTime();
      
      // Show prompt if:
      // 1. User hasn't dismissed more than 3 times, or
      // 2. It's been at least 3 days since the last dismissal
      if (
        dismissCount < 3 || 
        (lastDismissTime && currentTime - parseInt(lastDismissTime, 10) > 3 * 24 * 60 * 60 * 1000)
      ) {
        // Show the prompt after a delay
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      }
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [dismissCount]);
  
  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We no longer need the prompt. Clear it up.
    setDeferredPrompt(null);
    setShowPrompt(false);
    
    // If the user installed the app, update the state
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
  };
  
  const handleDismiss = () => {
    setShowPrompt(false);
    
    // Update dismiss count
    const newDismissCount = dismissCount + 1;
    setDismissCount(newDismissCount);
    localStorage.setItem('pwa-dismiss-count', newDismissCount.toString());
    
    // Record dismiss time
    localStorage.setItem('pwa-last-dismiss-time', new Date().getTime().toString());
  };
  
  // Don't show if:
  // 1. There's no install prompt available
  // 2. The app is already installed
  // 3. The prompt is not meant to be shown
  if (!deferredPrompt || isInstalled || !showPrompt) {
    return null;
  }
  
  // Handle iOS devices separately since they don't support beforeinstallprompt
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  
  return (
    <div className="fixed bottom-4 left-4 right-4 md:right-auto md:w-80 bg-background border rounded-lg shadow-lg p-4 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-primary/10 p-2 rounded-full">
          <Download className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium mb-1">Install BudgetBud</h3>
          <p className="text-sm text-muted-foreground mb-3">
            {isIOS 
              ? "Add this app to your home screen for a better experience."
              : "Install our app for easy access to your budgets anytime."}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDismiss}>
              Not now
            </Button>
            <Button size="sm" onClick={handleInstall}>
              Install
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 