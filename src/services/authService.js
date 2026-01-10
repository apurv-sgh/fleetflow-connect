import api from './api';
import { initSocket, disconnectSocket } from './socket';

export const authService = {
  register: async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    const user = data?.data;
    if (user?.accessToken) {
      localStorage.setItem('accessToken', user.accessToken);
      localStorage.setItem('refreshToken', user.refreshToken || '');
      localStorage.setItem('user', JSON.stringify(user));
      initSocket(user.accessToken);
    }
    return data;
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const user = data?.data;
    if (user?.accessToken) {
      localStorage.setItem('accessToken', user.accessToken);
      localStorage.setItem('refreshToken', user.refreshToken || '');
      localStorage.setItem('user', JSON.stringify(user));
      initSocket(user.accessToken);
    }
    return data;
  },

  me: async () => {
    const { data } = await api.get('/auth/me');
    return data?.data;
  },

  updateProfile: async (payload) => {
    const { data } = await api.put('/auth/profile', payload);
    return data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    disconnectSocket();
  },
};
