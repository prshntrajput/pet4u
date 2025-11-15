'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Search, Ban, CheckCircle, Trash2, Mail, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function AdminUsersPage() {
  const { user } = useAuth({ requireAuth: true });
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (user && user.role === 'admin') {
      loadUsers();
    }
  }, [user, router, roleFilter]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await adminAPI.getAllUsers(params);
      if (response.success) {
        setUsers(response.data.data.users);
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    setProcessingId(userId);
    try {
      const response = await adminAPI.toggleUserStatus(userId);
      if (response.success) {
        toast.success(`User ${currentStatus ? 'suspended' : 'activated'} successfully`);
        loadUsers();
      }
    } catch (error) {
      toast.error('Failed to update user status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    setProcessingId(userId);
    try {
      const response = await adminAPI.deleteUser(userId);
      if (response.success) {
        toast.success('User deleted successfully');
        loadUsers();
      }
    } catch (error) {
      toast.error('Failed to delete user');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadUsers();
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">Manage platform users and their permissions</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="adopter">Adopters</option>
              <option value="shelter">Shelters</option>
              <option value="admin">Admins</option>
            </select>

            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Users List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600">No users found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((userData) => (
            <Card key={userData.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  {/* User Info */}
                  <div className="flex items-center space-x-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={userData.profileImage} alt={userData.name} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {userData.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{userData.name}</h3>
                        <Badge variant="secondary" className="capitalize">
                          {userData.role}
                        </Badge>
                        {!userData.isActive && (
                          <Badge variant="destructive">Suspended</Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail size={14} className="mr-1" />
                          {userData.email}
                        </div>
                        {userData.city && (
                          <div className="flex items-center">
                            <MapPin size={14} className="mr-1" />
                            {userData.city}, {userData.state}
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mt-1">
                        Joined {formatDistanceToNow(new Date(userData.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  {userData.role !== 'admin' && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(userData.id, userData.isActive)}
                        disabled={processingId === userData.id}
                      >
                        {processingId === userData.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : userData.isActive ? (
                          <>
                            <Ban className="h-4 w-4 mr-2" />
                            Suspend
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Activate
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(userData.id, userData.name)}
                        disabled={processingId === userData.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        {processingId === userData.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
