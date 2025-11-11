// src/components/providers/SocketProvider.jsx
'use client';

import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { initializeSocket, disconnectSocket } from '@/lib/socket';
import { addNotification, incrementUnreadCount } from '@/lib/store/slices/notificationSlice';
import { 
  addMessageToConversation, 
  updateConversationsList,
  incrementTotalUnreadCount
} from '@/lib/store/slices/messagesSlice';
import { toast } from 'sonner';

export default function SocketProvider({ children }) {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) {
      console.log('⚠️ Socket already initialized, skipping...');
      return;
    }

    console.log('🔍 SocketProvider useEffect triggered');
    
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    
    console.log('Auth check:', {
      isAuthenticated,
      hasUser: !!user,
      hasUserId: user?.id,
      hasToken: !!accessToken,
    });

    if (!isAuthenticated || !accessToken || !user?.id) {
      console.warn('⚠️ Not authenticated or no token found');
      disconnectSocket();
      return;
    }

    console.log('🚀 Initializing socket...');
    const socket = initializeSocket(accessToken);

    if (!socket) {
      console.error('❌ Socket initialization failed');
      return;
    }

    isInitialized.current = true;

    // ✅ Listen for new messages - ONLY from other users
    socket.on('message:new', (data) => {
      console.log('💬 New message received:', data);
      console.log('Current user ID:', user.id);
      console.log('Message sender ID:', data.message?.senderId);
      
      // ✅ IGNORE messages sent by current user
      if (data.message?.senderId === user.id) {
        console.log('⏭️ Ignoring own message');
        return;
      }
      
      // Only process messages from OTHER users
      if (data.message) {
        dispatch(addMessageToConversation(data.message));
        dispatch(updateConversationsList(data.message));
        dispatch(incrementTotalUnreadCount());
        console.log('✅ Message from other user dispatched to Redux');
        
        // Show notification if not in the conversation
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          const isInConversation = currentPath.includes(`/messages/${data.message.senderId}`);
          
          if (!isInConversation && data.sender?.name) {
            toast.info(`New message from ${data.sender.name}`, {
              description: data.message.content?.substring(0, 50) || '',
            });
          }
        }
      }
    });

    // ✅ Listen for new notifications
    socket.on('notification:new', (data) => {
      console.log('📬 New notification received:', data);
      
      if (data.notification) {
        dispatch(addNotification(data.notification));
        dispatch(incrementUnreadCount());
        console.log('✅ Notification dispatched to Redux');
        
        toast.info(data.notification.title, {
          description: data.notification.message,
        });
      }
    });

    // ✅ Listen for message notifications - ONLY from other users
    socket.on('message:notification', (data) => {
      console.log('🔔 Message notification:', data);
      console.log('Notification sender ID:', data.senderId);
      console.log('Current user ID:', user.id);
      
      // ✅ IGNORE notifications about own messages
      if (data.senderId === user.id) {
        console.log('⏭️ Ignoring own message notification');
        return;
      }
      
      dispatch(incrementTotalUnreadCount());
    });

    // Listen for typing indicators
    socket.on('message:typing', (data) => {
      console.log('✏️ User typing:', data);
    });

    // Listen for notification updates
    socket.on('notification:read', (data) => {
      console.log('✅ Notification read:', data);
    });

    socket.on('notification:all_read', () => {
      console.log('✅ All notifications read');
    });

    socket.on('notification:deleted', (data) => {
      console.log('🗑️ Notification deleted:', data);
    });

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up socket listeners');
      isInitialized.current = false;
      
      socket.off('message:new');
      socket.off('notification:new');
      socket.off('message:notification');
      socket.off('message:typing');
      socket.off('notification:read');
      socket.off('notification:all_read');
      socket.off('notification:deleted');
      
      disconnectSocket();
    };
  }, [isAuthenticated, dispatch, user?.id]); // ✅ Added user?.id as dependency

  return <>{children}</>;
}
