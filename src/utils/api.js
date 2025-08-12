import axios from 'axios';

// Base URLs – single or multiple
const BASE_URLS = [
    'http://localhost:8105/api/v1/admin'
    // You can add more URLs here if needed
];

// Use the first URL as the default base
const DEFAULT_BASE_URL = BASE_URLS[0];

const API = axios.create({
    baseURL: DEFAULT_BASE_URL,
});

// Request Interceptor
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const errorMessage = error.response?.data?.error || 'Unauthorized';

            if (errorMessage === 'Token is expired') {
                try {
                    const refreshToken = localStorage.getItem('refresh_token');
                    if (!refreshToken) throw new Error('No refresh token available');

                    const refreshBaseUrl =
                        BASE_URLS.includes(originalRequest.baseURL) ? originalRequest.baseURL : DEFAULT_BASE_URL;

                    const { data } = await axios.post(`${refreshBaseUrl}/auth/refresh-token`, {
                        refresh_token: refreshToken,
                    });

                    // Save new tokens
                    localStorage.setItem('token', data.access_token);
                    localStorage.setItem('refresh_token', data.refresh_token);

                    originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
                    return API(originalRequest);
                } catch (refreshError) {
                    console.error('Failed to refresh token:', refreshError);
                    handleLogout();
                }
            } else if (
                errorMessage === 'Token is invalid' ||
                errorMessage === 'Token not found'
            ) {
                console.error('Token error:', errorMessage);
                handleLogout();
            }
        }

        // Fallback to second base URL if available
        if (!originalRequest._retry && BASE_URLS.length > 1 && !originalRequest._fallback) {
            originalRequest._fallback = true;
            originalRequest.baseURL = BASE_URLS[1];

            try {
                return await axios(originalRequest);
            } catch (retryError) {
                return Promise.reject(retryError);
            }
        }

        return Promise.reject(error);
    }
);

// Logout Helper
const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login?reason=unauthorized';
};

export default API;
