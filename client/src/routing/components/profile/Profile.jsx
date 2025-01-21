import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit, Trash2, LogOut, Shield, Camera } from 'lucide-react';

export function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [profile, setProfile] = useState({
    name: 'Sarah Anderson',
    email: 'sarah.anderson@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    joinDate: 'January 2024',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: true
    }
  });

  const handleDeleteAccount = () => {
    // Handle account deletion logic here
    setShowDeleteConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <button className="absolute bottom-0 right-0 bg-pink-500 p-2 rounded-full text-white shadow-lg hover:bg-pink-600 transition">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{profile.name}</h1>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {profile.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Member since {profile.joinDate}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 text-gray-600 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={profile.location}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-50"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button className="px-6 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition">
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-xl font-semibold mb-6">Preferences</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={profile.preferences.emailNotifications}
                className="w-4 h-4 text-pink-500 rounded border-gray-300 focus:ring-pink-500"
              />
              <span className="text-gray-700">Email Notifications</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={profile.preferences.smsNotifications}
                className="w-4 h-4 text-pink-500 rounded border-gray-300 focus:ring-pink-500"
              />
              <span className="text-gray-700">SMS Notifications</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={profile.preferences.marketingEmails}
                className="w-4 h-4 text-pink-500 rounded border-gray-300 focus:ring-pink-500"
              />
              <span className="text-gray-700">Marketing Emails</span>
            </label>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-xl font-semibold mb-6">Account Actions</h2>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between px-4 py-3 text-left border border-gray-200 rounded-xl hover:bg-gray-50 transition">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Change Password</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
            <button className="w-full flex items-center justify-between px-4 py-3 text-left border border-gray-200 rounded-xl hover:bg-gray-50 transition">
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Sign Out</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Delete Account</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}