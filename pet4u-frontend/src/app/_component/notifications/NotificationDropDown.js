'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/store/slices/notificationSlice';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function NotificationDropdown() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { notifications, unreadCount, isLoading } = useSelector((state) => state.notifications);
  const [isOpen, setIsOpen] = useState(false);

  // ✅ Fetch notifications on mount - NO dependencies that change
  useEffect(() => {
    dispatch(fetchNotifications({ limit: 10, unreadOnly: false }));
    dispatch(fetchUnreadCount());
  }, [dispatch]); // ✅ Only dispatch as dependency

  // ✅ Log updates for debugging - separate useEffect
  useEffect(() => {
    console.log('🔔 Notification state updated:', {
      count: notifications.length,
      unread: unreadCount,
      latest: notifications[0]?.title,
    });
  }, [notifications.length, unreadCount]); // ✅ Use .length instead of whole array

  const handleOpen = () => {
    setIsOpen(true);
    dispatch(fetchNotifications({ limit: 10, unreadOnly: false }));
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await dispatch(markNotificationAsRead(notification.id)).unwrap();
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }

    setIsOpen(false);
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    
    try {
      await dispatch(markAllNotificationsAsRead()).unwrap();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark notifications as read');
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

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={handleOpen}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-auto p-1 text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No notifications yet
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.slice(0, 10).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`cursor-pointer p-3 ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            router.push('/notifications');
            setIsOpen(false);
          }}
          className="text-center justify-center text-blue-600 font-medium cursor-pointer"
        >
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
