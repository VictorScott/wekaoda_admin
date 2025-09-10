import axios from 'axios';

// Base URLs for WeKaoda API
const isLocal = window.location.hostname === 'localhost';
const BASE_URL = isLocal ? 'http://localhost:8105/api/v1/admin' : 'https://wekaoda.little.africa/api/v1/admin';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Add authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract error message from response
    const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject({
      message: errorMessage,
      ...error.response?.data
    });
  }
);

export default axiosInstance;
