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
import { User, MapPin, Lock, Trash2, Building2 } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth({ requireAuth: true });
  const [activeTab, setActiveTab] = useState('profile');

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User size={16} />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="location" className="flex items-center space-x-2">
            <MapPin size={16} />
            <span>Location</span>
          </TabsTrigger>
          {user.role === 'shelter' && (
            <TabsTrigger value="shelter" className="flex items-center space-x-2">
              <Building2 size={16} />
              <span>Shelter</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Lock size={16} />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="danger" className="flex items-center space-x-2">
            <Trash2 size={16} />
            <span>Danger Zone</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>
                Upload a profile picture to personalize your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileImageUpload />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
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
          <Card>
            <CardHeader>
              <CardTitle>Location Settings</CardTitle>
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
            <Card>
              <CardHeader>
                <CardTitle>Shelter Profile</CardTitle>
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
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
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
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
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
