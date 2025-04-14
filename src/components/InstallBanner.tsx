'use client';

import { X, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type DismissReason = 'temporary' | 'permanent';

export function InstallBanner() {
  const [visible, setVisible] = useState(false);
  const { isInstallable, promptInstall, isIOS } = usePWA();
  const [dismissed, setDismissed] = useLocalStorage<{
    permanent: boolean;
    timestamp?: number;
  }>('pwa-install-dismissed', { permanent: false });

  // Show the banner if:
  // 1. The app is installable
  // 2. Not permanently dismissed
  // 3. If temporarily dismissed, at least 3 days have passed
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkVisibility = () => {
      if (!isInstallable) return;
      
      if (dismissed.permanent) return;
      
      if (dismissed.timestamp) {
        const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
        if (Date.now() - dismissed.timestamp < threeDaysInMs) return;
      }
      
      setVisible(true);
    };
    
    checkVisibility();
  }, [isInstallable, dismissed]);

  const handleDismiss = (reason: DismissReason) => {
    setVisible(false);
    
    if (reason === 'permanent') {
      setDismissed({ permanent: true });
    } else {
      setDismissed({ 
        permanent: false, 
        timestamp: Date.now() 
      });
    }
  };

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setVisible(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slideUp">
      <Card className="border bg-card text-card-foreground shadow-lg mx-auto max-w-md">
        <div className="flex items-start p-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Add to Home Screen</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isIOS 
                ? 'Install this app on your device: tap the share button and then "Add to Home Screen"'
                : 'Install this app on your device for quick and easy access when you're on the go.'
              }
            </p>
            
            <div className="flex gap-2 mt-4">
              {!isIOS && (
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={handleInstall}
                >
                  <Download size={16} />
                  Install
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDismiss('temporary')}
              >
                Later
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleDismiss('permanent')}
              >
                Don't show again
              </Button>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => handleDismiss('temporary')}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </Card>
    </div>
  );
} 