// src/lib/socket.js
import { io } from 'socket.io-client';

let socket = null;
let isConnecting = false; // ✅ Prevent concurrent connections

export const initializeSocket = (accessToken) => {
  // ✅ Return existing socket if already connected
  if (socket?.connected) {
    console.log('🔄 Socket already connected, reusing instance');
    return socket;
  }

  // ✅ Prevent multiple simultaneous connection attempts
  if (isConnecting) {
    console.log('⏳ Socket connection in progress...');
    return socket;
  }

  if (!accessToken) {
    console.error('❌ Cannot initialize socket: No access token');
    return null;
  }

  isConnecting = true;
  console.log('🔌 Initializing Socket.IO...');

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
    auth: {
      token: accessToken,
    },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 10000,
  });

  socket.on('connect', () => {
    console.log('✅ Socket.IO connected:', socket.id);
    isConnecting = false;
    socket.emit('user:online');
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket.IO disconnected:', reason);
    isConnecting = false;
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket.IO connection error:', error.message);
    isConnecting = false;
  });

  socket.on('error', (error) => {
    console.error('❌ Socket.IO error:', error);
    isConnecting = false;
  });

  socket.io.on('reconnect', (attemptNumber) => {
    console.log('✅ Reconnected after', attemptNumber, 'attempts');
    isConnecting = false;
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
    socket = null;
    isConnecting = false;
    console.log('🔌 Socket disconnected manually');
  }
};

export const getSocket = () => {
  return socket;
};

export const joinConversation = (otherUserId) => {
  if (socket?.connected) {
    socket.emit('conversation:join', otherUserId);
    console.log('📨 Joined conversation:', otherUserId);
  } else {
    console.warn('⚠️ Cannot join conversation: Socket not connected');
  }
};

export const leaveConversation = (otherUserId) => {
  if (socket?.connected) {
    socket.emit('conversation:leave', otherUserId);
    console.log('👋 Left conversation:', otherUserId);
  }
};

export const emitTyping = (receiverId) => {
  if (socket?.connected) {
    socket.emit('message:typing', { receiverId });
  }
};

export const emitStopTyping = (receiverId) => {
  if (socket?.connected) {
    socket.emit('message:stop-typing', { receiverId });
  }
};
