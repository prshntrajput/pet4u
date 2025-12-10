'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileForm from '@/app/_component/settings/ProfileForm';
import ProfileImageUpload from '@/app/_component/settings/ProfileImageUpload';
import LocationForm from '@/app/_component/settings/LocationForm';
import PasswordForm from '@/app/_component/settings/PasswordForm';
import DeleteAccountForm from '@/app/_component/settings/DeleteAccountForm';
import ShelterProfileForm from '@/app/_component/settings/ShelterProfileForm';
import { User, MapPin, Lock, Trash2, Building2, Settings as SettingsIcon, Sparkles } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth({ requireAuth: true });
  const [activeTab, setActiveTab] = useState('profile');

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex p-2 rounded-xl bg-primary/10 border-2 border-primary/20">
              <SettingsIcon className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          <p className="text-muted-foreground ml-14">
            Manage your account settings and preferences
          </p>
        </div>

        {/* User Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border-2 border-primary/20">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary capitalize">
            {user.role} Account
          </span>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full h-auto ${
          user.role === 'shelter' ? 'grid-cols-2 lg:grid-cols-5' : 'grid-cols-2 lg:grid-cols-4'
        }`}>
          <TabsTrigger value="profile" className="flex items-center gap-2 h-10">
            <User className="h-4 w-4" />
            <span className="text-sm">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="location" className="flex items-center gap-2 h-10">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">Location</span>
          </TabsTrigger>
          {user.role === 'shelter' && (
            <TabsTrigger value="shelter" className="flex items-center gap-2 h-10">
              <Building2 className="h-4 w-4" />
              <span className="text-sm">Shelter</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="security" className="flex items-center gap-2 h-10">
            <Lock className="h-4 w-4" />
            <span className="text-sm">Security</span>
          </TabsTrigger>
          <TabsTrigger value="danger" className="flex items-center gap-2 h-10">
            <Trash2 className="h-4 w-4" />
            <span className="text-sm">Danger Zone</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-2">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-lg">Profile Picture</CardTitle>
              </div>
              <CardDescription>
                Upload a profile picture to personalize your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileImageUpload />
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-lg">Profile Information</CardTitle>
              </div>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Tab */}
        <TabsContent value="location">
          <Card className="border-2">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-lg">Location Settings</CardTitle>
              </div>
              <CardDescription>
                Update your location to find pets near you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LocationForm />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shelter Tab (Only for shelter users) */}
        {user.role === 'shelter' && (
          <TabsContent value="shelter">
            <Card className="border-2">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Shelter Profile</CardTitle>
                </div>
                <CardDescription>
                  Manage your shelter organization details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ShelterProfileForm />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="border-2">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Lock className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-lg">Change Password</CardTitle>
              </div>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordForm />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger Zone Tab */}
        <TabsContent value="danger">
          <Card className="border-2 border-destructive/50 bg-destructive/5">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-destructive/10">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </div>
                <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
              </div>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeleteAccountForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
