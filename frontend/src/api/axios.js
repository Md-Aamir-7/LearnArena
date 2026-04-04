import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    
    // Unauthorized: Logout user
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // window.location.href = '/login'; // Optional: Redirect to login
    }
    
    toast.error(message);
    return Promise.reject(error);
  }
);

export default api;
