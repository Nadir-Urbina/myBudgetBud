'use client';

import { Download, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';

type InstallButtonProps = {
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
};

export default function InstallButton({
  variant = 'default',
  size = 'default',
  className = '',
}: InstallButtonProps) {
  const { isInstallable, isInstalled, isStandalone, isIOS, promptInstall } = usePWA();

  if (isStandalone || isInstalled) {
    return (
      <Button 
        variant="outline" 
        size={size} 
        className={`${className} cursor-default`}
        disabled
      >
        <CheckCircle2 className="mr-2 h-4 w-4" />
        App Installed
      </Button>
    );
  }

  if (!isInstallable && isIOS) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        className={className}
        onClick={() => {
          // Open a modal or tooltip with iOS installation instructions
          alert("To install on iOS:\n1. Tap the share button\n2. Scroll down and tap 'Add to Home Screen'\n3. Tap 'Add'");
        }}
      >
        <Download className="mr-2 h-4 w-4" />
        Add to Home Screen
      </Button>
    );
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <Button 
      variant={variant} 
      size={size} 
      className={className}
      onClick={promptInstall}
    >
      <Download className="mr-2 h-4 w-4" />
      Install App
    </Button>
  );
} 