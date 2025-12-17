import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../shared/services/apiClient';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}


interface AuthContextType{
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
  console.log('🔄 AuthContext useEffect running');
  
  const validateToken = async () => {
    console.log('🔍 Validating token...');
    
    // Check what's actually in localStorage
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('🔍 localStorage token:', storedToken);
    console.log('🔍 localStorage user:', storedUser);
    console.log('🔍 Is token "true"?', storedToken === 'true');
    console.log('🔍 Is token JWT?', storedToken?.startsWith('eyJ'));
    
    if (!storedToken || storedToken === 'true') { // ← Check for "true" string
      console.log('❌ Invalid or missing token');
      setLoading(false);
      return;
    }
    
    // Token looks valid, set it
    setToken(storedToken);
    
    
    try {
      setLoading(true);
      setToken(storedToken);
      console.log('📡 Fetching current user from backend...');
      const freshUser = await authService.getCurrentUser();
      console.log('✅ User fetched:', freshUser);
      setUser(freshUser);
    } catch (error: any) {
      console.error('❌ Token validation failed:', error);
      console.error('Error details:', error.message);
      
      // Use stored user as fallback
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('🔄 Using stored user as fallback:', parsedUser.email);
          setUser(parsedUser);
        } catch (parseError) {
          console.error('Failed to parse stored user:', parseError);
        }
      } else {
        // No stored user, clear everything
        console.log('🔄 No stored user, clearing auth');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
      }
    } finally {
      console.log('🏁 Auth loading complete');
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
      console.log('🔐 Attempting login for:', email);
      
      const result = await authService.login(email, password);
      const { user: userData, token: newToken } = result;
      
      console.log('✅ Login successful');
      console.log('📝 Token received:', newToken?.substring(0, 50) + '...');
      console.log('📝 User received:', userData);
      
      //Check if token is boolean true
      if (newToken === 'true') {
        console.error('❌ ERROR: Received boolean true instead of JWT token!');
        console.error('Check authService.ts - it should return actual token string');
        throw new Error('Invalid token received from server');
      }
      
      // Store auth data
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // CRITICAL FIX: Update BOTH user AND token states
      setUser(userData);
      setToken(newToken);
      
      console.log('✅ Auth state updated');
      console.log('🔍 Current state:', { 
        user: !!userData, 
        token: !!newToken,
        isAuthenticated: true 
      });
      
      // Redirect to dashboard
      navigate('/dashboard', { replace: true });
      
    } catch (err: any) {
      console.error('❌ Login error:', err);
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
      const { user: userData, token } = await authService.register(name, email, password);
      
      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      setToken(token);
      
      // Redirect to dashboard
      navigate('/dashboard', { replace: true });
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local state and storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
      setError(null);
      
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
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};