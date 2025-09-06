import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.removeItem('enrollment');
      localStorage.removeItem('studentProfile');
      localStorage.removeItem('tempUserData');
      
      // Redirect to login page
      window.location.href = '/feedback-system/login';
    }
    return Promise.reject(error);
  }
);

export default api;
