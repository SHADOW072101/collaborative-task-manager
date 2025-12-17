import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

console.log('🔗 API Base URL:', API_URL);

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Enhanced request interceptor with logging


// Enhanced response interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔐 [apiClient] Request:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      tokenPreview: token?.substring(0, 20) + '...'
    });
    return config;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      code: error.code,
      responseData: error.response?.data,
    });
    
    
    return Promise.reject(error);
  }
);