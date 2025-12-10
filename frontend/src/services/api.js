import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Flag untuk mencegah multiple redirects
let isRedirecting = false;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000, // 30 detik timeout
});

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor dengan handling yang lebih baik
api.interceptors.response.use(
  response => response,
  error => {
    // Cek apakah error adalah 401 Unauthorized
    if (error.response?.status === 401) {
      // Cegah multiple redirects
      if (!isRedirecting) {
        isRedirecting = true;
        
        console.warn('🔐 Token expired atau invalid, redirecting to login...');
        
        // Hapus token
        localStorage.removeItem('access_token');
        
        // Gunakan setTimeout untuk memastikan semua request selesai
        setTimeout(() => {
          // Gunakan replace agar tidak bisa back
          window.location.replace('/login');
          
          // Reset flag setelah redirect
          setTimeout(() => {
            isRedirecting = false;
          }, 1000);
        }, 100);
      }
      
      // Return rejected promise dengan info yang jelas
      return Promise.reject({
        ...error,
        isAuthError: true,
        message: 'Session expired. Please login again.'
      });
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('🌐 Network error:', error.message);
      return Promise.reject({
        ...error,
        isNetworkError: true,
        message: 'Network error. Please check your connection.'
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;
