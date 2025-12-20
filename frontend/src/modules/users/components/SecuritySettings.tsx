import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { 
  Shield, 
  Lock, 
  Mail, 
  AlertTriangle,
} from 'lucide-react';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

interface SecuritySettingsProps {
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  onChangePassword: (data: PasswordFormData) => Promise<void>;
  onToggleTwoFactor: (enabled: boolean) => Promise<void>;
  onSendVerificationEmail: () => Promise<void>;
  loading?: boolean;
}

export const SecuritySettings = ({
  emailVerified = false,
  twoFactorEnabled = false,
  onChangePassword,
  onToggleTwoFactor,
  onSendVerificationEmail,
  loading = false,
}: SecuritySettingsProps) => {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    try {
      await onChangePassword(data);
      setIsChangingPassword(false);
      reset();
    } catch (error) {
      console.error('Password change failed:', error);
    }
  };

  const handleTwoFactorToggle = async () => {
    setTwoFactorLoading(true);
    try {
      await onToggleTwoFactor(!twoFactorEnabled);
    } catch (error) {
      console.error('Two-factor toggle failed:', error);
    } finally {
      setTwoFactorLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Verification */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Mail className={`h-6 w-6 ${
              emailVerified ? 'text-green-600' : 'text-yellow-600'
            }`} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Email Verification
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {emailVerified 
                  ? 'Your email address has been verified.'
                  : 'Please verify your email address to secure your account.'}
              </p>
              
              {!emailVerified && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSendVerificationEmail}
                  className="mt-3"
                  loading={loading}
                >
                  Send Verification Email
                </Button>
              )}
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            emailVerified 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {emailVerified ? 'Verified' : 'Not Verified'}
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Shield className={`h-6 w-6 ${
              twoFactorEnabled ? 'text-green-600' : 'text-gray-400'
            }`} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Two-Factor Authentication
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Add an extra layer of security to your account.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              twoFactorEnabled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </div>
            
            <Button
              variant={twoFactorEnabled ? "outline" : "primary"}
              size="sm"
              onClick={handleTwoFactorToggle}
              loading={twoFactorLoading}
            >
              {twoFactorEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-3">
            <Lock className="h-6 w-6 text-gray-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Change Password
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Update your password regularly to keep your account secure.
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsChangingPassword(!isChangingPassword)}
          >
            {isChangingPassword ? 'Cancel' : 'Change Password'}
          </Button>
        </div>

        {isChangingPassword && (
          <form onSubmit={handleSubmit(handlePasswordSubmit)} className="space-y-4">
            <Input
              type="password"
              label="Current Password"
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />
            
            <Input
              type="password"
              label="New Password"
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            
            <Input
              type="password"
              label="Confirm New Password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-900">
                    Password Requirements
                  </p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• At least 8 characters long</li>
                    <li>• Contains uppercase and lowercase letters</li>
                    <li>• Contains at least one number</li>
                    <li>• Contains at least one special character</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <Button type="submit" loading={loading}>
                Update Password
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};