import { apiClient } from '../../../shared/services/apiClient';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      createdAt?: string;
    };
    token: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse['data']> {
    const response = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Login failed');
    }
    
    // Store token immediately
    localStorage.setItem('token', response.data.data.token);
    
    return {
      user: response.data.data.user,
      token: response.data.data.token // Actual JWT string
    };
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse['data']> {
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      name,
      email,
      password,
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Registration failed');
    }
    
    // Store token immediately
    localStorage.setItem('token', response.data.data.token);
    
    return {
      user: response.data.data.user,
      token: response.data.data.token // Actual JWT string
    };
  },

  async getCurrentUser() {
    // FIXED: Changed from /auth/profile to /auth/me
    const response = await apiClient.get('/auth/me');
    return response.data.data;
  },

  async updateProfile(userId: string, data: any) {
    const response = await apiClient.put(`/users/${userId}`, data);
    return response.data;
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('token');
      // Clear any other auth-related storage
      localStorage.removeItem('user');
    }
  },
};