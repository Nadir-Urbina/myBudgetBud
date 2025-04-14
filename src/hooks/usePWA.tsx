'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isPWASupported, setIsPWASupported] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if on iOS - improved detection
    const isIOSDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
      
      // Check for iOS devices: iPhone, iPad, iPod
      if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
        return true;
      }
      
      // Additional check for iOS 13+ iPad (without userAgentData which causes TS errors)
      if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
        return true;
      }
      
      return false;
    };
    
    setIsIOS(isIOSDevice());

    // Check if in standalone mode
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      (window as any).navigator.standalone ||
      document.referrer.includes('android-app://');
    setIsStandalone(isInStandaloneMode);

    // PWA is supported on Chrome, Edge, Safari (iOS 11.3+), Samsung Internet, Opera, Firefox (Android)
    const isPWASupportedBrowser = 
      'serviceWorker' in navigator && 
      ('BeforeInstallPromptEvent' in window || isIOSDevice());
    setIsPWASupported(isPWASupportedBrowser);

    // Check if already installed to home screen
    // This is an approximate check as there's no definitive way to detect installed state
    if (isInStandaloneMode) {
      setIsInstalled(true);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event so it can be triggered later
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Check if display-mode changes to standalone
    const mediaQueryList = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
      if (e.matches) {
        setIsInstalled(true);
      }
    };
    
    mediaQueryList.addEventListener('change', handleChange);

    // Log detection results for debugging
    console.log('PWA Detection:', {
      isIOS: isIOSDevice(),
      isStandalone: isInStandaloneMode,
      isPWASupported: isPWASupportedBrowser,
      userAgent: navigator.userAgent
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, []);

  const promptInstall = async () => {
    if (!installPrompt) return false;

    try {
      // Show the install prompt
      await installPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const choiceResult = await installPrompt.userChoice;
      
      // Reset the installPrompt - it can only be used once
      setInstallPrompt(null);
      
      return choiceResult.outcome === 'accepted';
    } catch (error) {
      console.error('Error during installation prompt:', error);
      return false;
    }
  };

  return {
    isInstallable: !!installPrompt && !isStandalone,
    isInstalled,
    isStandalone,
    isIOS,
    isPWASupported,
    promptInstall
  };
} 