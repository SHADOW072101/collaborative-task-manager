export interface UserProfile {
  id: string;
  email: string;
  name: string;
  bio?: string;
  avatar?: string;
  phone?: string;
  location?: string;
  jobTitle?: string;
  department?: string;
  company?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
  };
  preferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
  };
  settings?: {
    twoFactorEnabled: boolean;
    emailVerified: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  avatar?: string;
  phone?: string;
  location?: string;
  jobTitle?: string;
  department?: string;
  company?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
  };
}

export interface UpdatePreferencesData {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  timezone?: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}