import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Enhanced request interceptor with better debugging
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    console.log('🔐 [Request]', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'NO TOKEN',
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request setup error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ [Response Success]', {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  (error) => {
    const url = error.config?.url;
    const status = error.response?.status;
    
    console.error('❌ [API Error]', {
      url,
      status,
      message: error.response?.data?.message || error.message,
    });
    
    // Don't clear tokens for /users endpoint if we're just searching
    // Only redirect to login for 401 on protected endpoints
    if (status === 401 && !url?.includes('/auth/login') && !url?.includes('/auth/register')) {
      console.warn('⚠️ 401 Unauthorized - Token may be invalid');
      
      // Optional: Try to refresh token here if you have refresh token logic
      // For now, just clear the token and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if we're not already on login page
      if (!window.location.pathname.includes('/login')) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    }
    
    return Promise.reject(error);
  }
);

export const isAuthenticated = () => !!localStorage.getItem('token');