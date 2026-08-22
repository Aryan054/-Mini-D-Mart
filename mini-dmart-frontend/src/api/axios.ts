import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:8000/api/v1');

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add interceptor to handle 401s and refresh token (simplified for now)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // In a full implementation, you would handle token refresh here
    // For now, if we get a 401, we just clear the token and redirect to login if needed
    if (error.response?.status === 401) {
      // localStorage.removeItem('access_token');
      // localStorage.removeItem('refresh_token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
