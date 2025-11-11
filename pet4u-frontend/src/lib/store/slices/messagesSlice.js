import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { messageAPI } from '../../api/messages';

// Async thunks
export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await messageAPI.sendMessage(messageData);
      if (response.success) {
        return response.data.data.message;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await messageAPI.getConversations(params);
      if (response.success) {
        return response.data.data;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchConversation = createAsyncThunk(
  'messages/fetchConversation',
  async ({ otherUserId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await messageAPI.getConversation(otherUserId, params);
      if (response.success) {
        return { otherUserId, ...response.data.data };
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markMessagesAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (otherUserId, { rejectWithValue }) => {
    try {
      const response = await messageAPI.markAsRead(otherUserId);
      if (response.success) {
        return otherUserId;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  conversations: [],
  currentConversation: null,
  currentMessages: [],
  currentUserId: null, // ✅ Track current user ID
  unreadCount: 0,
  isLoading: false,
  isSending: false,
  error: null,
};

// Message slice
const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearMessageError: (state) => {
      state.error = null;
    },
    
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
      state.currentMessages = [];
    },
    
    // ✅ Set current user ID
    setCurrentUserId: (state, action) => {
      state.currentUserId = action.payload;
    },
    
    // ✅ Add message to current conversation (for real-time Socket.IO)
    addMessageToConversation: (state, action) => {
      const newMessage = action.payload;
      
      // Check if message already exists to prevent duplicates
      const exists = state.currentMessages.some(msg => msg.id === newMessage.id);
      
      if (!exists) {
        state.currentMessages.push(newMessage);
      }
    },
    
    // ✅ Update conversations list when new message arrives
    updateConversationsList: (state, action) => {
      const message = action.payload;
      
      // Find the conversation by checking both senderId and receiverId
      const convIndex = state.conversations.findIndex(
        conv => conv.otherUser.id === message.senderId || conv.otherUser.id === message.receiverId
      );
      
      if (convIndex !== -1) {
        const conversation = state.conversations[convIndex];
        conversation.lastMessageContent = message.content;
        conversation.lastMessageAt = message.createdAt;
        
        // ✅ Only increment unread if message is FROM other user (not from current user)
        if (message.senderId === conversation.otherUser.id) {
          conversation.unreadCount = (conversation.unreadCount || 0) + 1;
        }
        
        // Move conversation to top
        const updatedConv = state.conversations.splice(convIndex, 1)[0];
        state.conversations.unshift(updatedConv);
      }
    },
    
    // ✅ Decrement unread count for a conversation
    decrementUnreadCount: (state, action) => {
      const otherUserId = action.payload;
      const conversation = state.conversations.find(
        conv => conv.otherUser.id === otherUserId
      );
      
      if (conversation && conversation.unreadCount > 0) {
        conversation.unreadCount -= 1;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    
    // ✅ Increment total unread count
    incrementTotalUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    
    // ✅ Set total unread count
    setTotalUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    
    resetMessageState: (state) => {
      return initialState;
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSending = false;
        
        // ✅ Always add sent message to current conversation
        const exists = state.currentMessages.some(msg => msg.id === action.payload.id);
        if (!exists) {
          state.currentMessages.push(action.payload);
        }
        
        state.error = null;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload;
      })
      
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload.conversations;
        
        // ✅ Calculate total unread count
        state.unreadCount = action.payload.conversations.reduce(
          (total, conv) => total + (conv.unreadCount || 0),
          0
        );
        
        state.error = null;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch conversation
      .addCase(fetchConversation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentConversation = action.payload.otherUserId;
        state.currentMessages = action.payload.messages;
        state.error = null;
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Mark as read
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        const otherUserId = action.payload;
        
        // Find and update conversation
        const conversation = state.conversations.find(
          c => c.otherUser.id === otherUserId
        );
        
        if (conversation) {
          // Subtract from total unread count
          state.unreadCount = Math.max(0, state.unreadCount - conversation.unreadCount);
          
          // Reset conversation unread count
          conversation.unreadCount = 0;
        }
      });
  },
});

export const {
  clearMessageError,
  clearCurrentConversation,
  setCurrentUserId,
  addMessageToConversation,
  updateConversationsList,
  decrementUnreadCount,
  incrementTotalUnreadCount,
  setTotalUnreadCount,
  resetMessageState,
} = messageSlice.actions;

export default messageSlice.reducer;
