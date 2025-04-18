'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollection } from '@/hooks/useFirestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UserPreferences } from '@/types/budget';
import { useTheme } from '@/providers/theme-provider';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme: currentTheme, setTheme } = useTheme();
  const { data: preferences, loading, update, add } = 
    useCollection<UserPreferences>('preferences', user?.uid || '');
  
  const [currency, setCurrency] = useState<string>('USD');
  const [defaultPeriod, setDefaultPeriod] = useState<string>('weekly');
  const [theme, setThemeState] = useState<string>('light');
  const [isSaving, setIsSaving] = useState(false);

  // Load preferences when data is available
  useEffect(() => {
    if (preferences && preferences.length > 0) {
      setCurrency(preferences[0].currency || 'USD');
      setDefaultPeriod(preferences[0].defaultBudgetPeriod || 'weekly');
      setThemeState(preferences[0].theme || currentTheme);
    } else {
      // Use current theme as default if no preferences are found
      setThemeState(currentTheme);
    }
  }, [preferences, currentTheme]);

  const handleSavePreferences = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const userPreferences: Omit<UserPreferences, 'id'> = {
        userId: user.uid,
        currency,
        defaultBudgetPeriod: defaultPeriod as 'weekly' | 'bi-weekly' | 'monthly',
        theme: theme as 'light' | 'dark' | 'system',
        defaultCategories: [],  // We'll set this to default categories
      };

      if (preferences && preferences.length > 0) {
        // Make sure the id exists before trying to update
        if (preferences[0].id) {
          await update(preferences[0].id, userPreferences);
        } else {
          console.error('Preference found but has no ID');
          await add(userPreferences);
        }
      } else {
        await add(userPreferences);
      }
      
      alert('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle theme changes
  const handleThemeChange = (value: string) => {
    setThemeState(value);
    // Immediately apply the theme
    setTheme(value as 'light' | 'dark' | 'system');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>
              Customize your budget application settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={currency}
                onValueChange={setCurrency}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="GBP">British Pound (£)</SelectItem>
                  <SelectItem value="MXN">Mexican Peso ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultPeriod">Default Budget Period</Label>
              <Select
                value={defaultPeriod}
                onValueChange={setDefaultPeriod}
              >
                <SelectTrigger id="defaultPeriod">
                  <SelectValue placeholder="Select default period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={theme}
                onValueChange={handleThemeChange}
              >
                <SelectTrigger id="theme">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleSavePreferences}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Manage your account settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
              />
            </div>

            <div className="pt-4">
              <Button 
                variant="destructive" 
                onClick={() => logout()}
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 