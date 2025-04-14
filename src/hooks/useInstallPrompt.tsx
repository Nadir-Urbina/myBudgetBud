'use client';

import { useState, useEffect } from 'react';

// Define the interface for the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Define the return type of the hook
interface InstallPromptHook {
  isInstallable: boolean;
  isIOS: boolean;
  isStandalone: boolean;
  canPromptInstall: boolean;
  promptInstall: () => Promise<void>;
}

export function useInstallPrompt(): InstallPromptHook {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if the app is running in standalone mode
    if (typeof window !== 'undefined') {
      setIsStandalone(
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      );
    }

    // Check if the device is iOS
    const checkIOSDevice = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
    };
    
    setIsIOS(checkIOSDevice());

    // Set up event listener for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Clean up event listener
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Function to prompt the user to install the app
  const promptInstall = async () => {
    if (!deferredPrompt) return;

    // Show the prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // Clear the saved prompt
    setDeferredPrompt(null);

    return outcome;
  };

  return {
    isInstallable: deferredPrompt !== null || isIOS,
    isIOS,
    isStandalone,
    canPromptInstall: deferredPrompt !== null,
    promptInstall,
  };
} 