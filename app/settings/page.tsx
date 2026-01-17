"use client";

import { useState } from 'react';
import { useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/components/ui/ToastProvider';
import { LogOut, Save, Wifi } from 'lucide-react';

export default function SettingsPage() {
  const { showToast } = useToast();
  const { user } = useUser();
  const { signOut } = useClerk();

  const [formData, setFormData] = useState({
    name: user?.fullName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    espIp: '192.168.1.100'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (user) {
        await user.update({
          firstName: formData.name.split(' ')[0],
          lastName: formData.name.split(' ').slice(1).join(' ')
        });
        showToast('Profile updated successfully');
      }
    } catch (error) {
      showToast('Failed to update profile');
      console.error(error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      showToast('Passwords do not match');
      return;
    }

    try {
      // Note: This is a placeholder. Actual password change 
      // would typically be handled through Clerk's methods
      showToast('Password update functionality depends on Clerk configuration');
    } catch (error) {
      showToast('Failed to update password');
      console.error(error);
    }
  };

  const handleESPConfig = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('ESP32 configuration saved');
    // Add actual ESP configuration logic here
  };

  const handleLogout = () => {
    signOut();
  };

  // Prevent rendering if user is not loaded
  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button variant="outline" className="gap-2" onClick={handleLogout}>
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">User Profile</TabsTrigger>
          <TabsTrigger value="device">ESP32 Config</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    disabled // Typically, email is managed through Clerk
                  />
                </div>
                <Button type="submit" className="gap-2">
                  <Save className="h-4 w-4" /> Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your security credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
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
                  />
                </div>
                <Button type="submit" className="gap-2">
                  <Save className="h-4 w-4" /> Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="device">
          <Card>
            <CardHeader>
              <CardTitle>ESP32 Configuration</CardTitle>
              <CardDescription>Configure your device settings</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleESPConfig} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="espIp">ESP32 IP Address</Label>
                  <Input
                    id="espIp"
                    name="espIp"
                    value={formData.espIp}
                    onChange={handleInputChange}
                    placeholder="192.168.1.100"
                  />
                </div>
                <Button type="submit" className="gap-2">
                  <Wifi className="h-4 w-4" /> Save Configuration
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}