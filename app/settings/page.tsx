"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/components/ui/ToastProvider';
import {
  LogOut,
  Save,
  User,
  Shield,
  Loader2,
  Bell,
  Sun,
  Moon,
  Palette,
  MapPin,
  Thermometer,
  Languages,
  Smartphone
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SettingsPage() {
  const { showToast } = useToast();
  const { user, signOut, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferences, setPreferences] = useState({
    farmName: 'My Farm',
    location: 'Chennai, Tamil Nadu',
    temperatureUnit: 'celsius',
    language: 'english',
    darkMode: false,
    emailNotifications: true,
    pushNotifications: true,
    alertsForHighTemp: true,
    alertsForLowMoisture: true,
    alertsForIrrigation: true,
    weeklyReport: true,
  });

  const [saving, setSaving] = useState(false);

  // Update form data when user loads
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.user_metadata?.full_name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: formData.name }
      });

      if (error) throw error;
      showToast('Profile updated successfully');
    } catch (error) {
      showToast('Failed to update profile');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      showToast('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) throw error;

      showToast('Password updated successfully');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      showToast('Failed to update password');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceSave = () => {
    showToast('Preferences saved successfully');
  };

  const handleLogout = async () => {
    await signOut();
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (user?.user_metadata?.full_name) {
      const names = user.user_metadata.full_name.split(' ');
      return names.map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-3xl flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="container mx-auto p-6 max-w-3xl text-center">
        <p>Please sign in to access settings.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl space-y-8">
      {/* Header with User Info */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 ring-4 ring-green-100">
            <AvatarImage
              src={user.user_metadata?.avatar_url}
              alt={user.user_metadata?.full_name || 'User'}
            />
            <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xl">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-4 h-12">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" /> Alerts
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Palette className="h-4 w-4" /> Preferences
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4 mt-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="h-12 rounded-xl bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>
                <Button
                  type="submit"
                  className="gap-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Farm Info Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Farm Details
              </CardTitle>
              <CardDescription>Your farm information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="farmName">Farm Name</Label>
                <Input
                  id="farmName"
                  value={preferences.farmName}
                  onChange={(e) => setPreferences({ ...preferences, farmName: e.target.value })}
                  placeholder="e.g., Green Valley Farm"
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={preferences.location}
                  onChange={(e) => setPreferences({ ...preferences, location: e.target.value })}
                  placeholder="City, State"
                  className="h-12 rounded-xl"
                />
              </div>
              <Button
                onClick={handlePreferenceSave}
                className="gap-2 bg-gradient-to-r from-green-600 to-emerald-500"
              >
                <Save className="h-4 w-4" /> Save Farm Details
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4 mt-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Change Password
              </CardTitle>
              <CardDescription>Update your security credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
                    className="h-12 rounded-xl"
                  />
                </div>
                <Button
                  type="submit"
                  className="gap-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Connected Devices */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-green-600" />
                Connected Devices
              </CardTitle>
              <CardDescription>Manage your active sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Smartphone className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Current Device</p>
                      <p className="text-sm text-gray-500">Active now</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4 mt-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-green-600" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure how you receive alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive alerts via email</p>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, emailNotifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Push Notifications</Label>
                  <p className="text-sm text-gray-500">Browser push notifications</p>
                </div>
                <Switch
                  checked={preferences.pushNotifications}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, pushNotifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Weekly Reports</Label>
                  <p className="text-sm text-gray-500">Get weekly farm summaries</p>
                </div>
                <Switch
                  checked={preferences.weeklyReport}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, weeklyReport: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-orange-500" />
                Alert Triggers
              </CardTitle>
              <CardDescription>Get notified for these conditions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">🌡️ High Temperature</Label>
                  <p className="text-sm text-gray-500">When temp exceeds 40°C</p>
                </div>
                <Switch
                  checked={preferences.alertsForHighTemp}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, alertsForHighTemp: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">💧 Low Soil Moisture</Label>
                  <p className="text-sm text-gray-500">When moisture drops below 20%</p>
                </div>
                <Switch
                  checked={preferences.alertsForLowMoisture}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, alertsForLowMoisture: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">🚿 Irrigation Events</Label>
                  <p className="text-sm text-gray-500">When irrigation starts/stops</p>
                </div>
                <Switch
                  checked={preferences.alertsForIrrigation}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, alertsForIrrigation: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4 mt-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-green-600" />
                Appearance
              </CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {preferences.darkMode ? <Moon className="h-5 w-5 text-indigo-500" /> : <Sun className="h-5 w-5 text-yellow-500" />}
                  <div className="space-y-0.5">
                    <Label className="text-base">Dark Mode</Label>
                    <p className="text-sm text-gray-500">Toggle dark theme</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.darkMode}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, darkMode: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5 text-green-600" />
                Language & Units
              </CardTitle>
              <CardDescription>Regional preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <select
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white"
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                >
                  <option value="english">English</option>
                  <option value="hindi">हिन्दी (Hindi)</option>
                  <option value="tamil">தமிழ் (Tamil)</option>
                  <option value="telugu">తెలుగు (Telugu)</option>
                  <option value="kannada">ಕನ್ನಡ (Kannada)</option>
                  <option value="marathi">मराठी (Marathi)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Temperature Unit</Label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={preferences.temperatureUnit === 'celsius' ? 'default' : 'outline'}
                    className={preferences.temperatureUnit === 'celsius' ? 'bg-green-600' : ''}
                    onClick={() => setPreferences({ ...preferences, temperatureUnit: 'celsius' })}
                  >
                    °C Celsius
                  </Button>
                  <Button
                    type="button"
                    variant={preferences.temperatureUnit === 'fahrenheit' ? 'default' : 'outline'}
                    className={preferences.temperatureUnit === 'fahrenheit' ? 'bg-green-600' : ''}
                    onClick={() => setPreferences({ ...preferences, temperatureUnit: 'fahrenheit' })}
                  >
                    °F Fahrenheit
                  </Button>
                </div>
              </div>
              <Button
                onClick={handlePreferenceSave}
                className="gap-2 bg-gradient-to-r from-green-600 to-emerald-500 mt-4"
              >
                <Save className="h-4 w-4" /> Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
