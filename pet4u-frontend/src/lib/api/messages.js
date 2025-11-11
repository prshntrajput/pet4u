import apiWrapper from './axios';

// Message API functions
export const messageAPI = {
  // Send message
  sendMessage: async (messageData) => {
    try {
      const response = await apiWrapper.post('/messages', messageData);
      return response;
    } catch (error) {
      console.error('Send message API error:', error);
      throw error;
    }
  },

  // Get all conversations
  getConversations: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiWrapper.get(`/messages/conversations?${queryString}`);
      return response;
    } catch (error) {
      console.error('Get conversations API error:', error);
      throw error;
    }
  },

  // Get conversation with specific user
  getConversation: async (otherUserId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiWrapper.get(`/messages/conversations/${otherUserId}?${queryString}`);
      return response;
    } catch (error) {
      console.error('Get conversation API error:', error);
      throw error;
    }
  },

  // Mark messages as read
  markAsRead: async (otherUserId) => {
    try {
      const response = await apiWrapper.put(`/messages/conversations/${otherUserId}/read`);
      return response;
    } catch (error) {
      console.error('Mark as read API error:', error);
      throw error;
    }
  },

  // Delete message
  deleteMessage: async (messageId) => {
    try {
      const response = await apiWrapper.delete(`/messages/${messageId}`);
      return response;
    } catch (error) {
      console.error('Delete message API error:', error);
      throw error;
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await apiWrapper.get('/messages/unread/count');
      return response;
    } catch (error) {
      console.error('Get unread count API error:', error);
      throw error;
    }
  },
};
