import { apiClient } from '../../../shared/services/apiClient';
import { type UserProfile, type UpdateProfileData, type UpdatePreferencesData, type UpdatePasswordData } from '../types';




export const userService = {
  // Get user profile
  async getProfile(userId: string): Promise<UserProfile> {
    const response = await apiClient.get(`/users/${userId}/profile`);
    return response.data.data || response.data;
  },

  // Update profile
  async updateProfile(userId: string, data: UpdateProfileData): Promise<UserProfile> {
    const response = await apiClient.put(`/users/${userId}/profile`, data);
    return response.data.data || response.data;
  },

  // Update preferences
  async updatePreferences(userId: string, data: UpdatePreferencesData): Promise<UserProfile> {
    const response = await apiClient.patch(`/users/${userId}/preferences`, data);
    return response.data.data || response.data;
  },

  // Change password
  async changePassword(userId: string, data: UpdatePasswordData): Promise<void> {
    await apiClient.post(`/users/${userId}/change-password`, data);
  },

  // Upload avatar
  async uploadAvatar(userId: string, file: File): Promise<{ avatar: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await apiClient.post(`/users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.data || response.data;
  },

  // Verify email
  async sendVerificationEmail(userId: string): Promise<void> {
    await apiClient.post(`/users/${userId}/send-verification-email`);
  },

  // Enable/disable two-factor authentication
  async toggleTwoFactor(userId: string, enabled: boolean): Promise<void> {
    await apiClient.post(`/users/${userId}/two-factor`, { enabled });
  },

  // Delete account
  async deleteAccount(userId: string, password: string): Promise<void> {
    await apiClient.delete(`/users/${userId}/account`, {
      data: { password }
    });
  },

  // Get activity logs
  async getActivityLogs(userId: string, page = 1, limit = 10) {
    const response = await apiClient.get(`/users/${userId}/activity`, {
      params: { page, limit }
    });
    return response.data.data || response.data;
  },
};

