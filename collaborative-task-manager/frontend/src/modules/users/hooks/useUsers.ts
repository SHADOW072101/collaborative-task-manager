import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { useAuth } from '../../auth/hooks/useAuth';
import { type UserProfile, type UpdateProfileData, type UpdatePreferencesData, type UpdatePasswordData } from '../types';
import { apiClient } from '../../../shared/services/apiClient';


interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  jobTitle?: string;
  department?: string;
}

interface UseUsersOptions {
  search?: string;
  limit?: number;
  enabled?: boolean;
}

export const useProfile = (userId: string) => {
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => userService.getProfile(userId),
    enabled: !!userId,
  });

  const updateProfile = useMutation({
    mutationFn: (data: UpdateProfileData) => 
      userService.updateProfile(userId, data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profile', userId], updatedProfile);
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });

  const updatePreferences = useMutation({
    mutationFn: (data: UpdatePreferencesData) => 
      userService.updatePreferences(userId, data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profile', userId], updatedProfile);
    },
  });

  const changePassword = useMutation({
    mutationFn: (data: UpdatePasswordData) => 
      userService.changePassword(userId, data),
  });

  const uploadAvatar = useMutation({
    mutationFn: (file: File) => userService.uploadAvatar(userId, file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });

  const toggleTwoFactor = useMutation({
    mutationFn: (enabled: boolean) => 
      userService.toggleTwoFactor(userId, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });

  const deleteAccount = useMutation({
    mutationFn: (password: string) => 
      userService.deleteAccount(userId, password),
  });

  const sendVerificationEmail = useMutation({
    mutationFn: () => userService.sendVerificationEmail(userId),
  });

  const getActivityLogs = useQuery({
    queryKey: ['activity', userId],
    queryFn: () => userService.getActivityLogs(userId),
    enabled: !!userId,
  });

  return {
    profile,
    isLoading,
    error,
    refetch,
    updateProfile: updateProfile.mutateAsync,
    updatePreferences: updatePreferences.mutateAsync,
    changePassword: changePassword.mutateAsync,
    uploadAvatar: uploadAvatar.mutateAsync,
    toggleTwoFactor: toggleTwoFactor.mutateAsync,
    deleteAccount: deleteAccount.mutateAsync,
    sendVerificationEmail: sendVerificationEmail.mutateAsync,
    activityLogs: getActivityLogs.data,
    isUpdatingProfile: updateProfile.isPending,
    isUpdatingPassword: changePassword.isPending,
    isUploadingAvatar: uploadAvatar.isPending,
    isTogglingTwoFactor: toggleTwoFactor.isPending,
  };
};

// Hook for current user's profile
export const useCurrentProfile = () => {
  const { user } = useAuth();
  return useProfile(user?.id || '');
};

export const useUsers = (options: UseUsersOptions = {}) => {
  const { search = '', limit = 10, enabled = true } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users', search, limit],
    queryFn: async () => {
      const response = await apiClient.get('/users', {
        params: { search, limit }
      });
      return response.data;
    },
    enabled,
  });

  return {
    users: data || [],
    isLoading,
    error,
    refetch,
  };
};
