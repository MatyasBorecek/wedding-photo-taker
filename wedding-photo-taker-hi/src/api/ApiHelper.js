import axios from 'axios';
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

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
  timeout: 30000, // 30-second timeout
});

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log outgoing requests in debug mode
    logger.debug(`API Request: ${config.method.toUpperCase()} ${config.url}`, {
      method: config.method,
      url: config.url,
      data: config.data
    });

    return config;
  },
  error => {
    // Log request errors
    logger.error('API Request Error', {
      message: error.message,
      stack: error.stack
    });
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  response => {
    // Log successful responses in debug mode
    logger.debug(`API Response: ${response.config.method.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });

    return response;
  },
  error => {
    // Extract response data for logging
    const response = error.response || {};
    const request = error.config || {};

    // Log the error with context
    logger.error('API Response Error', {
      url: request.url,
      method: request.method,
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      message: error.message,
      stack: error.stack
    });

    // Enhance error object with user-friendly message
    if (response.status === 401) {
      error.userMessage = 'Your session has expired. Please log in again.';
    } else if (response.status === 403) {
      error.userMessage = 'You do not have permission to perform this action.';
    } else if (response.status === 404) {
      error.userMessage = 'The requested resource was not found.';
    } else if (response.status >= 500) {
      error.userMessage = 'A server error occurred. Please try again later.';
    } else {
      error.userMessage = response.data?.message || 'An error occurred. Please try again.';
    }

    return Promise.reject(error);
  }
);

export const registerDevice = (name) => api.post('/api/auth/register', { name, deviceId: getDeviceId() });
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

// Export the api object for direct use (needed for logger)
export default {
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  patch: (url, data, config) => api.patch(url, data, config),
  delete: (url, config) => api.delete(url, config)
};
