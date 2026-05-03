import apiWrapper from './axios';

export const appointmentsAPI = {
  getMyAppointments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiWrapper.get(`/appointments/my?${query}`);
  },

  getShelterAvailability: async (shelterId) => {
    return apiWrapper.get(`/appointments/availability/${shelterId}`);
  },

  setAvailability: async (data) => {
    return apiWrapper.post('/appointments/availability', data);
  },

  bookAppointment: async (data) => {
    return apiWrapper.post('/appointments', data);
  },

  updateStatus: async (appointmentId, data) => {
    return apiWrapper.patch(`/appointments/${appointmentId}/status`, data);
  },

  cancelAppointment: async (appointmentId, cancellationReason = '') => {
    return apiWrapper.patch(`/appointments/${appointmentId}/cancel`, { cancellationReason });
  }
};
