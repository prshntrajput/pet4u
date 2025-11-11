'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  markNotificationAsRead,
  deleteNotification,
} from '@/lib/store/slices/notificationSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Loader2, Trash2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { notifications, isLoading, error } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 50 }));
  }, [dispatch]);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await dispatch(markNotificationAsRead(notification.id));
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    
    try {
      await dispatch(deleteNotification(notificationId)).unwrap();
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      adoption_request: '🐾',
      message: '💬',
      request_approved: '✅',
      request_rejected: '❌',
    };
    return icons[type] || '🔔';
  };

  const getNotificationColor = (type) => {
    const colors = {
      adoption_request: 'bg-blue-50 border-blue-200',
      message: 'bg-purple-50 border-purple-200',
      request_approved: 'bg-green-50 border-green-200',
      request_rejected: 'bg-red-50 border-red-200',
    };
    return colors[type] || 'bg-gray-50 border-gray-200';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Bell className="mr-3 h-8 w-8 text-blue-600" />
          Notifications
        </h1>
        <p className="text-gray-600 mt-2">
          {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <div className="flex justify-center mb-4">
            <Bell className="h-24 w-24 text-gray-300" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            No notifications yet
          </h3>
          <p className="text-gray-600">
            You will see notifications here when theres activity on your account
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                !notification.isRead ? 'border-l-4 border-l-blue-600' : ''
              } ${getNotificationColor(notification.type)}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="text-3xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {notification.type.replace('_', ' ')}
                      </Badge>
                      {!notification.isRead && (
                        <Badge variant="default" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {notification.actionUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNotificationClick(notification);
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(e, notification.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
