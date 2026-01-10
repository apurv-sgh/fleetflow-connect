import api from './api';

export const bookingService = {
  create: async (payload) => {
    const { data } = await api.post('/bookings', payload);
    return data?.data;
  },

  getUserBookings: async (params = {}) => {
    const { data } = await api.get('/bookings', { params });
    return data?.data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/bookings/${id}`);
    return data?.data;
  },

  cancel: async (id, reason) => {
    const { data } = await api.put(`/bookings/${id}/cancel`, { reason });
    return data?.data;
  },

  rate: async (id, score, feedback) => {
    const { data } = await api.post(`/bookings/${id}/rate`, { score, feedback });
    return data?.data;
  },

  getAdminPending: async (page = 1, limit = 20) => {
    const { data } = await api.get('/bookings/admin/pending', { params: { page, limit } });
    return data?.data;
  },
};
