import axios from 'axios';
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';

const getDeviceId = () => {
  let deviceId = Cookies.get('deviceId');
  if (!deviceId) {
    deviceId = uuidv4();
    Cookies.set('deviceId', deviceId, { expires: 365 });
  }
  return deviceId;
};

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3030',
  withCredentials: true,
});

api.interceptors.request.use(config => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerDevice = (name) => api.post('/api/auth/register', { name, deviceId: getDeviceId() });
export const getCurrentUser = () => api.get('/api/auth/me');
export const uploadPhoto = (file, isPublic, config) => {
  const formData = new FormData();
  formData.append('photo', file);
  formData.append('isPublic', isPublic.toString());
  console.log(formData, config)
  return api.post('/api/photos', formData, config);
};
export const checkDeviceRegistration = () => api.get('/api/auth/check-registration');
export const listPhotos = () => api.get('/api/photos');
export const deletePhoto = (id) => api.delete(`/api/photos/${id}`);
export const updatePhoto = (id, data) => api.patch(`/api/photos/${id}`, data);
