import { useState } from 'react';
import {  User,   Settings,  Shield,  Activity} from 'lucide-react';
// import { Button } from '../../../shared/components/Button';
// import { AvatarUpload } from '../components/AvatarUpload';
// import { ProfileForm } from '../components/ProfileForm';
// import { PreferencesForm } from '../components/PreferencesForm';
// import { SecuritySettings } from '../components/SecuritySettings';
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
    // profile, 
    isLoading, 
    // updateProfile, 
    // updatePreferences,
    // changePassword,
    // uploadAvatar,
    // toggleTwoFactor,
    // sendVerificationEmail,
    activityLogs,
    // isUpdatingProfile,
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
  );
};