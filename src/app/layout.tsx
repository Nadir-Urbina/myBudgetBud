import { Inter as FontSans } from "next/font/google";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from '@/components/ui/toaster';
import InstallBanner from '@/components/pwa/InstallBanner';
import PWASetup from '@/components/pwa/PWASetup';
import { cn } from '@/lib/utils';
import { Metadata } from 'next';

import "./globals.css";

const inter = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Define metadata for better SEO and PWA support
export const metadata: Metadata = {
  title: 'My Budget Bud - Personal Budget Tracking',
  description: 'Track and manage your personal finances with ease',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Budget Bud',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <InstallBanner />
            <Toaster />
            <PWASetup />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
