import { apiClient } from '../../../shared/services/apiClient';

// interface LoginCredentials {
//   email: string;
//   password: string;
// }

// interface RegisterData {
//   name: string;
//   email: string;
//   password: string;
// }

interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export const authService = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    console.log('🔐 authService.login called for:', email);
    
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/login', { email, password });
      
      console.log('✅ Login response received:', {
        success: response.data.success,
        message: response.data.message,
        hasToken: !!response.data.data?.token,
        tokenPreview: response.data.data?.token?.substring(0, 50) + '...',
        userEmail: response.data.data?.user?.email,
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }
      
      if (!response.data.data?.token) {
        console.error('❌ No token in response data:', response.data);
        throw new Error('No token received from server');
      }
      
      // Store token immediately
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      
      return {
        user: response.data.data.user,
        token: response.data.data.token
      };
      
    } catch (error: any) {
      console.error('❌ authService.login error:', {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    console.log('📝 authService.register called for:', email);
    
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/register', {
        name,
        email,
        password,
      });
      
      console.log('✅ Register response:', {
        success: response.data.success,
        hasToken: !!response.data.data?.token,
        userEmail: response.data.data?.user?.email,
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Registration failed');
      }
      
      // Store token immediately
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      
      return {
        user: response.data.data.user,
        token: response.data.data.token
      };
      
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  },

  async getCurrentUser(): Promise<User> {
    console.log('👤 authService.getCurrentUser called');
    
    try {
      // Use the correct endpoint from your backend
      const response = await apiClient.get('/api/auth/profile');
      
      console.log('✅ Current user response:', response.data);
      
      // Handle both response formats
      if (response.data.data) {
        return response.data.data; // { success: true, data: user }
      }
      
      return response.data; // Direct user object
      
    } catch (error: any) {
      console.error('❌ Failed to get current user:', {
        message: error.message,
        status: error.response?.status,
      });
      throw error;
    }
  },

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    try {
      // Use the correct endpoint
      const response = await apiClient.put(`/api/auth/profile`, data);
      console.error('updated profile Id :', userId);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    console.log('🚪 authService.logout called');
    
    try {
      await apiClient.post('/auth/logout');
      console.log('✅ Logout API call successful');
    } catch (error: any) {
      console.warn('⚠️ Logout API error (proceeding anyway):', error.message);
    } finally {
      // Always clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('🗑️ Local storage cleared');
    }
  },
};