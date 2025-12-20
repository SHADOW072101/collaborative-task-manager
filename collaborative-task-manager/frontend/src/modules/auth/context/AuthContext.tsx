import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔄 AuthContext useEffect running');
    
    const validateToken = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('🔍 Stored token:', storedToken?.substring(0, 50) + '...');
      console.log('🔍 Stored user:', storedUser);
      
      if (!storedToken) {
        console.log('❌ No token found');
        setLoading(false);
        return;
      }
      
      // Set token from storage first
      setToken(storedToken);
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('🔄 Using stored user temporarily:', parsedUser.email);
          setUser(parsedUser);
        } catch (error) {
          console.error('Failed to parse stored user:', error);
        }
      }
      
      try {
        console.log('📡 Fetching fresh user data from backend...');
        const freshUser = await authService.getCurrentUser();
        console.log('✅ Fresh user fetched:', freshUser.email);
        
        // Update with fresh data
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
        
      } catch (error: any) {
        console.error('❌ Failed to fetch fresh user:', error.message);
        
        // If token is invalid, clear everything
        if (error.response?.status === 401) {
          console.log('🔄 Token invalid, clearing auth data');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  const clearError = () => setError(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔐 AuthContext.login called for:', email);
      
      const result = await authService.login(email, password);
      const { user: userData, token: newToken } = result;
      
      console.log('✅ Login successful:', {
        userEmail: userData.email,
        tokenLength: newToken.length,
        tokenStartsWith: newToken.substring(0, 20) + '...',
      });
      
      // Update state
      setUser(userData);
      setToken(newToken);
      
      console.log('✅ Auth state updated successfully');
      
      // Redirect to dashboard
      navigate('/dashboard', { replace: true });
      
    } catch (err: any) {
      console.error('❌ Login error in AuthContext:', {
        message: err.message,
        response: err.response?.data,
      });
      
      const errorMessage = err.response?.data?.error || err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📝 AuthContext.register called for:', email);
      
      const result = await authService.register(name, email, password);
      const { user: userData, token: newToken } = result;
      
      console.log('✅ Registration successful:', userData.email);
      
      // Update state
      setUser(userData);
      setToken(newToken);
      
      // Redirect to dashboard
      navigate('/dashboard', { replace: true });
      
    } catch (err: any) {
      console.error('❌ Registration error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log('🚪 AuthContext.logout called');
    
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state and storage
      localStorage.removeItem('token');
      // Clear any other auth-related storage
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
      setError(null);
      
      console.log('✅ Auth state cleared');
      
      // Redirect to login
      navigate('/login', { replace: true });
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    
    setLoading(true);
    try {
      const updatedUser = await authService.updateProfile(user.id, data);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Profile update failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const logout = async () => {
    console.log('🚪 AuthContext.logout called');
    
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state and storage
      localStorage.removeItem('token');
      // Clear any other auth-related storage
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
      setError(null);
      
      console.log('✅ Auth state cleared');
      
      // Redirect to login
      navigate('/login', { replace: true });
    }
    return logout
  };

  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};