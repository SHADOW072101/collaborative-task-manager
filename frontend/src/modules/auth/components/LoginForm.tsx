import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { Mail, Lock, LogIn } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  loading?: boolean;
}

export const LoginForm = ({ onSubmit, loading = false }: LoginFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-5">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Mail className="h-5 w-5 text-blue-500" />
          </div>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            className="pl-12 bg-white/60 backdrop-blur-sm border-white/40 focus:border-blue-400 focus:ring-blue-300"
            {...register('email')}
          />
        </div>

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Lock className="h-5 w-5 text-blue-500" />
          </div>
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            className="pl-12 bg-white/60 backdrop-blur-sm border-white/40 focus:border-blue-400 focus:ring-blue-300"
            {...register('password')}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Remember me</span>
        </label>
        <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline">
          Forgot password?
        </a>
      </div>

      <Button
        type="submit"
        fullWidth
        loading={loading}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 group"
      >
        <LogIn className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform" />
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>

      {/* <div className="relative mt-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/30"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white/20 backdrop-blur-sm text-gray-600 rounded-full">
            Or continue with
          </span>
        </div>
      </div> */}

      {/* <div className="grid grid-cols-2 gap-3 mt-6">
        <button
          type="button"
          className="flex items-center justify-center gap-2 p-3 bg-white/40 backdrop-blur-sm border border-white/50 rounded-lg hover:bg-white/60 transition-colors text-sm font-medium text-gray-700"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          </svg>
          Google
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 p-3 bg-white/40 backdrop-blur-sm border border-white/50 rounded-lg hover:bg-white/60 transition-colors text-sm font-medium text-gray-700"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub
        </button>
      </div> */}
    </form>
  );
};