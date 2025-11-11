'use client';

import { useAuth } from '@/hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/lib/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import NotificationDropdown from '../_component/notifications/NotificationDropDown';
import { LogOut, Home, Heart, Settings, PawPrint, List, Plus, MessageSquare, Inbox, FileText } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import SocketProvider from '../_component/providers/SocketProviders';

export default function DashboardLayout({ children }) {
  const { user, isLoading } = useAuth({ requireAuth: true });
  const dispatch = useDispatch();
  const router = useRouter();
  const { unreadCount: messageUnreadCount } = useSelector((state) => state.messages);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <PawPrint className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-blue-600">PET4U</h1>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 flex items-center space-x-1">
                <Home size={18} />
                <span>Home</span>
              </Link>
              
              <Link href="/pets" className="text-gray-700 hover:text-blue-600 flex items-center space-x-1">
                <PawPrint size={18} />
                <span>Browse Pets</span>
              </Link>
              
              {user?.role === 'shelter' ? (
                <>
                  <Link href="/my-pets" className="text-gray-700 hover:text-blue-600 flex items-center space-x-1">
                    <List size={18} />
                    <span>My Pets</span>
                  </Link>
                  <Link href="/pets/create" className="text-gray-700 hover:text-blue-600 flex items-center space-x-1">
                    <Plus size={18} />
                    <span>Add Pet</span>
                  </Link>
                  <Link href="/adoption-requests" className="text-gray-700 hover:text-blue-600 flex items-center space-x-1">
                    <Inbox size={18} />
                    <span>Requests</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/favorites" className="text-gray-700 hover:text-blue-600 flex items-center space-x-1">
                    <Heart size={18} />
                    <span>Favorites</span>
                  </Link>
                  <Link href="/my-requests" className="text-gray-700 hover:text-blue-600 flex items-center space-x-1">
                    <FileText size={18} />
                    <span>My Requests</span>
                  </Link>
                </>
              )}
              
              <Link href="/messages" className="text-gray-700 hover:text-blue-600 flex items-center space-x-1 relative">
                <MessageSquare size={18} />
                <span>Messages</span>
                {messageUnreadCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {messageUnreadCount > 9 ? '9+' : messageUnreadCount}
                  </Badge>
                )}
              </Link>
              
              <Link href="/settings" className="text-gray-700 hover:text-blue-600 flex items-center space-x-1">
                <Settings size={18} />
                <span>Settings</span>
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <NotificationDropdown />
              
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center space-x-1"
              >
                <LogOut size={16} />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
        
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            © 2025 PET4U. All rights reserved. Made with ❤️ for pets.
          </div>
        </div>
      </footer>
    </div>
  );
}
