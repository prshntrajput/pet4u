import apiWrapper from './axios';

export const lostFoundAPI = {
  getReports: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiWrapper.get(`/lost-found?${query}`);
  },

  getReportById: async (reportId) => {
    return apiWrapper.get(`/lost-found/${reportId}`);
  },

  getMyReports: async () => {
    return apiWrapper.get('/lost-found/user/my-reports');
  },

  createReport: async (data) => {
    return apiWrapper.post('/lost-found', data);
  },

  resolveReport: async (reportId, resolvedNote = '') => {
    return apiWrapper.patch(`/lost-found/${reportId}/resolve`, { resolvedNote });
  },

  deleteReport: async (reportId) => {
    return apiWrapper.delete(`/lost-found/${reportId}`);
  }
};
