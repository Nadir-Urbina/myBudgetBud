'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show our install prompt after a delay
      setTimeout(() => {
        setIsVisible(true);
      }, 2000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!isVisible || isInstalled || !deferredPrompt) {
    return null;
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the browser install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // We no longer need the prompt
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const dismissPrompt = () => {
    setIsVisible(false);
    // Store in localStorage that user dismissed the prompt
    localStorage.setItem('installPromptDismissed', 'true');
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-72 bg-background border rounded-lg shadow-lg p-4 z-50 flex flex-col gap-3 animate-fadeIn">
      <div className="flex justify-between items-start">
        <div className="flex gap-2 items-center">
          <Download className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Install MyBudgetPal</h3>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          onClick={dismissPrompt}
          aria-label="Dismiss installation prompt"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Install as an app on your device for better performance and offline access to your budgets
      </p>
      <div className="flex gap-2 justify-end">
        <Button 
          variant="default" 
          size="sm" 
          className="gap-1"
          onClick={handleInstallClick}
        >
          <Download className="h-4 w-4" />
          Install Now
        </Button>
      </div>
    </div>
  );
} 