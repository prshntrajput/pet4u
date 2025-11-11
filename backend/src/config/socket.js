const { Server } = require('socket.io');
const { logger } = require('./logger');
const jwtUtils = require('../utils/jwt');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: Token required'));
    }

    const decoded = jwtUtils.verifyAccessToken(token);
    
    if (!decoded) {
      return next(new Error('Authentication error: Invalid token'));
    }

    socket.userId = decoded.userId;
    socket.userEmail = decoded.email;
    socket.userRole = decoded.role;
    
    next();
  });

  // Connection handler
  io.on('connection', (socket) => {
    logger.info('User connected to Socket.IO', {
      socketId: socket.id,
      userId: socket.userId,
    });

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Handle user online status
    socket.on('user:online', () => {
      socket.broadcast.emit('user:status', {
        userId: socket.userId,
        status: 'online',
      });
    });

    // Join conversation room
    socket.on('conversation:join', (otherUserId) => {
      const roomId = [socket.userId, otherUserId].sort().join('-');
      socket.join(`conversation:${roomId}`);
      logger.debug('User joined conversation', { userId: socket.userId, roomId });
    });

    // Leave conversation room
    socket.on('conversation:leave', (otherUserId) => {
      const roomId = [socket.userId, otherUserId].sort().join('-');
      socket.leave(`conversation:${roomId}`);
      logger.debug('User left conversation', { userId: socket.userId, roomId });
    });

    // Typing indicator
    socket.on('message:typing', ({ receiverId }) => {
      const roomId = [socket.userId, receiverId].sort().join('-');
      socket.to(`conversation:${roomId}`).emit('message:typing', {
        userId: socket.userId,
        isTyping: true,
      });
    });

    // Stop typing indicator
    socket.on('message:stop-typing', ({ receiverId }) => {
      const roomId = [socket.userId, receiverId].sort().join('-');
      socket.to(`conversation:${roomId}`).emit('message:typing', {
        userId: socket.userId,
        isTyping: false,
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info('User disconnected from Socket.IO', {
        socketId: socket.id,
        userId: socket.userId,
      });

      socket.broadcast.emit('user:status', {
        userId: socket.userId,
        status: 'offline',
      });
    });
  });

  logger.info('Socket.IO initialized successfully');
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

// Emit message to specific user
const emitToUser = (userId, event, data) => {
  try {
    const io = getIO();
    io.to(`user:${userId}`).emit(event, data);
  } catch (error) {
    logger.error('Error emitting to user:', error);
  }
};

// Emit message to conversation
const emitToConversation = (userId1, userId2, event, data) => {
  try {
    const io = getIO();
    const roomId = [userId1, userId2].sort().join('-');
    io.to(`conversation:${roomId}`).emit(event, data);
  } catch (error) {
    logger.error('Error emitting to conversation:', error);
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitToUser,
  emitToConversation,
};
