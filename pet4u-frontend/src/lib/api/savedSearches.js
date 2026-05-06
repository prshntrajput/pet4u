import apiWrapper from './axios';

export const savedSearchesAPI = {
  getMyAlerts: () => apiWrapper.get('/alerts'),
  createAlert: (data) => apiWrapper.post('/alerts', data),
  toggleAlert: (id) => apiWrapper.patch(`/alerts/${id}/toggle`),
  deleteAlert: (id) => apiWrapper.delete(`/alerts/${id}`),
};
