import apiWrapper from './axios';

// Notification API functions
export const notificationAPI = {
  // Get all notifications
  getNotifications: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiWrapper.get(`/notifications?${queryString}`);
      return response;
    } catch (error) {
      console.error('Get notifications API error:', error);
      throw error;
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await apiWrapper.get('/notifications/unread/count');
      return response;
    } catch (error) {
      console.error('Get unread count API error:', error);
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await apiWrapper.put(`/notifications/${notificationId}/read`);
      return response;
    } catch (error) {
      console.error('Mark as read API error:', error);
      throw error;
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      const response = await apiWrapper.put('/notifications/read-all');
      return response;
    } catch (error) {
      console.error('Mark all as read API error:', error);
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await apiWrapper.delete(`/notifications/${notificationId}`);
      return response;
    } catch (error) {
      console.error('Delete notification API error:', error);
      throw error;
    }
  },
};
