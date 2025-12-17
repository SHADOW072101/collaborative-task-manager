import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';
import {  CheckSquare, Shield } from 'lucide-react';

export const LoginPage = () => {
  const [error, setError] = useState<string>('');
  const { login, loading, isAuthenticated } = useAuth(); // Add isAuthenticated
  const navigate = useNavigate();

  // Debug: Log auth state
  useEffect(() => {
    console.log('LoginPage - isAuthenticated:', isAuthenticated);
    console.log('LoginPage - localStorage token:', localStorage.getItem('token'));
    console.log('LoginPage - localStorage user:', localStorage.getItem('user'));
  }, [isAuthenticated]);

  const handleSubmit = async (data: { email: string; password: string }) => {
    try {
      setError('');
      console.log('Login attempt starting...'); // Debug
      
      await login(data.email, data.password);
      
      console.log('Login successful in handleSubmit'); // Debug
      
      // Add a small delay then force redirect
      setTimeout(() => {
        console.log('Redirecting to dashboard...'); // Debug
        navigate('/dashboard', { replace: true });
      }, 100);
      
    } catch (err: any) {
      console.error('LoginPage error:', err); // Debug
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 -left-20 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Glass card */}
      <div className="relative z-10 w-full max-w-md mx-4 md:mx-0">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-60"></div>
              <div className="relative bg-white/20 backdrop-blur-lg border border-white/30 rounded-full p-4">
                <CheckSquare className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to continue to your dashboard</p>
        </div>

        {/* Glass form container */}
        <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl shadow-blue-500/10 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-400/20 backdrop-blur-sm border border-red-400/30 rounded-lg text-red-700 text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {error}
            </div>
          )}

          <LoginForm onSubmit={handleSubmit} loading={loading} />

          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors hover:underline"
              >
                Create one now
              </Link>
            </p>
          </div>
        </div>

        {/* Features highlight */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-700">Real-time</div>
            <div className="text-xs text-gray-600">Updates</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-700">Secure</div>
            <div className="text-xs text-gray-600">Encrypted</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-700">Fast</div>
            <div className="text-xs text-gray-600">Performance</div>
          </div>
        </div>
      </div>
    </div>
  );
};