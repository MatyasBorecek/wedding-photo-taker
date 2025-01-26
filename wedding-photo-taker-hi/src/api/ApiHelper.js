import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  withCredentials: true,
});

api.interceptors.request.use(config => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerDevice = (name) => api.post('/api/auth/register', { name });
export const getCurrentUser = () => api.get('/api/auth/me');
export const uploadPhoto = (file, isPublic, config) => {
  const formData = new FormData();
  formData.append('photo', file);
  formData.append('isPublic', isPublic.toString());
  return api.post('/api/photos', formData, config);
};
export const checkDeviceRegistration = () => api.get('/api/auth/check-registration');
export const listPhotos = () => api.get('/api/photos');
export const deletePhoto = (id) => api.delete(`/api/photos/${id}`);
export const updatePhoto = (id, data) => api.patch(`/api/photos/${id}`, data);
export const adminUpdatePhoto = (id, data) => api.patch(`/api/admin/photos/${id}`, data);