'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, ShareIcon } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { usePWA } from '@/hooks/usePWA';

function InstallBanner() {
  const { isInstallable, isInstalled, isStandalone, promptInstall, isIOS } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [dismissCount, setDismissCount] = useLocalStorage<number>('pwa-banner-dismiss-count', 0);
  const [lastDismissed, setLastDismissed] = useLocalStorage<number>('pwa-banner-last-dismissed', 0);
  
  useEffect(() => {
    // Don't show banner if:
    // 1. App is already installed or running as PWA
    // 2. App is not installable and not on iOS (since iOS needs manual install)
    // 3. User has dismissed the banner more than 3 times
    // 4. User has dismissed the banner less than 3 days ago
    const shouldShow = 
      !isStandalone && 
      !isInstalled && 
      (isInstallable || isIOS) && 
      dismissCount < 3 && 
      (Date.now() - lastDismissed > 3 * 24 * 60 * 60 * 1000 || lastDismissed === 0);
    
    if (shouldShow) {
      // Show banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isStandalone, isInstalled, isInstallable, isIOS, dismissCount, lastDismissed]);
  
  const handleDismiss = () => {
    setIsVisible(false);
    setDismissCount(prev => prev + 1);
    setLastDismissed(Date.now());
  };
  
  const handleInstall = async () => {
    if (isIOS) {
      // Show iOS-specific instructions
      alert('To install on iOS:\n\n1. Tap the share icon at the bottom of your screen\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" in the top-right corner');
      setIsVisible(false);
    } else {
      const installed = await promptInstall();
      if (installed) {
        setIsVisible(false);
      }
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg z-50 animate-fadeIn">
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        aria-label="Dismiss"
      >
        <X size={18} />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-full">
          <Download size={24} className="text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Install MyBudgetPal</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-3">
            {isIOS 
              ? "Add to your home screen for offline access" 
              : "Install for better experience and offline use"}
          </p>
          <Button 
            size="sm" 
            onClick={handleInstall}
            className="w-full"
          >
            {isIOS ? "Show Install Instructions" : "Install App"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default InstallBanner; 