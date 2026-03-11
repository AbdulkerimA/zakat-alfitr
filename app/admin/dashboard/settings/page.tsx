'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Settings, Save, Database, Bell, Shield, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    systemName: 'Zakat Management System',
    systemEmail: 'admin@zakat.com',
    defaultCurrency: 'ETB',
    zakatPerPerson: '100',
    notificationsEnabled: true,
    backupEnabled: true,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>

      <div className="grid gap-4 md:gap-6">
        {/* System Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle>System Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="systemName">System Name</Label>
              <Input
                id="systemName"
                value={settings.systemName}
                onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="systemEmail">System Email</Label>
              <Input
                id="systemEmail"
                type="email"
                value={settings.systemEmail}
                onChange={(e) => setSettings({ ...settings, systemEmail: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Currency & Zakat Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <CardTitle>Currency & Zakat Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultCurrency">Default Currency</Label>
              <Input
                id="defaultCurrency"
                value={settings.defaultCurrency}
                onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
              />
              <p className="text-xs text-gray-500">Currency code (e.g., ETB, USD, EUR)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zakatPerPerson">Default Zakat Amount per Person</Label>
              <Input
                id="zakatPerPerson"
                type="number"
                value={settings.zakatPerPerson}
                onChange={(e) => setSettings({ ...settings, zakatPerPerson: e.target.value })}
              />
              <p className="text-xs text-gray-500">Default amount for new masjids</p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive email notifications for important events</p>
              </div>
              <Button
                variant={settings.notificationsEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setSettings({ ...settings, notificationsEnabled: !settings.notificationsEnabled })}
              >
                {settings.notificationsEnabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Backup & Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Backup & Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Automatic Backups</p>
                <p className="text-sm text-gray-500">Enable daily automatic database backups</p>
              </div>
              <Button
                variant={settings.backupEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setSettings({ ...settings, backupEnabled: !settings.backupEnabled })}
              >
                {settings.backupEnabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
            <Separator />
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                <Database className="h-4 w-4 mr-2" />
                Create Manual Backup
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading} size="lg">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
