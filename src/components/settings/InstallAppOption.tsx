'use client';

import { Download, SmartphoneNfc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function InstallAppOption() {
  const { isInstallable, isInstalled, isStandalone, isIOS, promptInstall } = usePWA();
  const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);

  // If already installed or can't be installed, don't show the option
  if (isStandalone || isInstalled || (!isInstallable && !isIOS)) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SmartphoneNfc className="h-5 w-5" />
          Install Budget Bud App
        </CardTitle>
        <CardDescription>
          Get offline access and a better experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {isIOS ? (
            <>
              Install Budget Bud on your home screen for quick access and improved performance. This app works offline and feels like a native app.
            </>
          ) : isAndroid ? (
            <>
              Install Budget Bud on your device to use it offline and get a better experience. You can access all your budgets even without an internet connection.
            </>
          ) : (
            <>
              Install this application on your device for a better experience. The app works offline and provides quick access to your budgets.
            </>
          )}
        </p>
      </CardContent>
      <CardFooter>
        {isIOS ? (
          <div className="space-y-2 text-sm">
            <p className="font-medium">To install on iOS:</p>
            <ol className="ml-5 list-decimal space-y-1">
              <li>Tap the share button in Safari</li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" in the top right corner</li>
            </ol>
          </div>
        ) : (
          <Button onClick={promptInstall} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Install App
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 