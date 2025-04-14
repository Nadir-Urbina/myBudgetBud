'use client';

import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, Smartphone } from "lucide-react";

export function InstallAppCard() {
  const { canPromptInstall, platform, isStandalone, promptInstall } = useInstallPrompt();
  
  if (isStandalone) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            App Installation
          </CardTitle>
          <CardDescription>Manage app installation options</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            You're already using Budget Bud as an installed app. Enjoy the full experience!
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Install Budget Bud
        </CardTitle>
        <CardDescription>Get the full app experience</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          {platform === 'ios' 
            ? "Add Budget Bud to your home screen for easier access, offline capabilities, and a better experience."
            : "Install Budget Bud to your device for quick access, offline capabilities, and a full-screen experience."}
        </p>
      </CardContent>
      <CardFooter>
        {platform === 'ios' ? (
          <div className="text-sm text-muted-foreground">
            <p className="font-medium">iOS Installation Steps:</p>
            <ol className="list-decimal pl-5 space-y-1 mt-2">
              <li>Tap the share icon <span className="rounded-md border px-1 py-0.5">⎙</span> in Safari</li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" in the top right</li>
            </ol>
          </div>
        ) : (
          <Button 
            className="w-full" 
            onClick={promptInstall}
            disabled={!canPromptInstall}
          >
            <ArrowDown className="mr-2 h-4 w-4" />
            Install App
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 