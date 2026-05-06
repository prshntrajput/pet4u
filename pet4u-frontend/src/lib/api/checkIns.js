import apiWrapper from './axios';

export const checkInsAPI = {
  getMyCheckIns: () => apiWrapper.get('/check-ins/my'),
  getShelterCheckIns: () => apiWrapper.get('/check-ins/shelter'),
  submitCheckIn: (checkInId, data) => apiWrapper.post(`/check-ins/${checkInId}/submit`, data),
  markAdoptionComplete: (requestId) => apiWrapper.post(`/check-ins/complete/${requestId}`),
};
