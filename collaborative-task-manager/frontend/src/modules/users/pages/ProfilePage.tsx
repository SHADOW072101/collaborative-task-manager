import { useState } from 'react';
import {  User,   Settings,  Shield,  Bell,  Calendar,  Activity,  Mail,  Phone,  MapPin,  Globe,  ExternalLink} from 'lucide-react';
// import { Button } from '../../../shared/components/Button';
// import { AvatarUpload } from '../components/AvatarUpload';
import { ProfileForm } from '../components/ProfileForm';
// import { PreferencesForm } from '../components/PreferencesForm';
import { SecuritySettings } from '../components/SecuritySettings';
import { useCurrentProfile } from '../hooks/useUsers';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'preferences', label: 'Preferences', icon: Settings },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'activity', label: 'Activity', icon: Activity },
];

export const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { 
    profile, 
    isLoading, 
    updateProfile, 
    // updatePreferences,
    changePassword,
    // uploadAvatar,
    toggleTwoFactor,
    sendVerificationEmail,
    activityLogs,
    isUpdatingProfile,
    // isUploadingAvatar,
  } = useCurrentProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const ActiveTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-8">
            {/* <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Profile Picture
              </h3>
              <AvatarUpload
                currentAvatar={profile?.avatar}
                onUpload={uploadAvatar}
                isUploading={isUploadingAvatar}
              />
            </div> */}

            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Personal Information
              </h3>
              <ProfileForm
                initialData={profile}
                onSubmit={updateProfile}
                loading={isUpdatingProfile}
              />
            </div>
          </div>
        );

      // case 'preferences':
      //   return (
      //     <div className="bg-white border rounded-lg p-6">
      //       <PreferencesForm
      //         initialData={profile?.preferences}
      //         onSubmit={updatePreferences}
      //         loading={isUpdatingProfile}
      //       />
      //     </div>
      //   );

      case 'security':
        return (
          <SecuritySettings
            emailVerified={profile?.settings?.emailVerified}
            twoFactorEnabled={profile?.settings?.twoFactorEnabled}
            onChangePassword={changePassword}
            onToggleTwoFactor={toggleTwoFactor}
            onSendVerificationEmail={sendVerificationEmail}
            loading={isUpdatingProfile}
          />
        );

      case 'activity':
        return (
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Recent Activity
            </h3>
            {activityLogs?.length ? (
              <div className="space-y-4">
                {activityLogs.map((log: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{log.action}</p>
                        <p className="text-sm text-gray-500">{log.details}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-300 mx-auto" />
                <p className="mt-4 text-gray-500">No activity recorded yet</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            {/* Profile Header */}
            <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600">
              <div className="flex flex-col items-center text-center text-white">
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="text-3xl font-bold">
                      {profile?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-bold">{profile?.name}</h2>
                <p className="text-blue-100 text-sm mt-1">{profile?.email}</p>
                
                {profile?.jobTitle && (
                  <p className="text-blue-100 text-sm mt-2">
                    {profile.jobTitle}
                    {profile.company && ` at ${profile.company}`}
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 p-6 border-b">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-sm text-gray-500">Projects</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">156</p>
                <p className="text-sm text-gray-500">Tasks</p>
              </div>
            </div>

            {/* Info */}
            <div className="p-6 space-y-4">
              {profile?.location && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{profile.location}</span>
                </div>
              )}
              
              {profile?.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{profile.phone}</span>
                </div>
              )}
              
              {profile?.website && (
                <div className="flex items-center gap-3 text-sm">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <a 
                    href={profile.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg border shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex flex-wrap -mb-px">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        inline-flex items-center px-6 py-4 border-b-2 text-sm font-medium transition-colors
                        ${isActive
                          ? 'border-blue-500 text-blue-600 bg-blue-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <ActiveTabContent />
        </div>
      </div>
    </div>
  );
};