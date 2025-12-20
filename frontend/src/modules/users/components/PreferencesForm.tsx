import { useState } from 'react';
import { Button } from '../../../shared/components/Button';
// import { Select } from '../../../shared/components/Select';
import { Switch } from '../../../shared/components/Switch';
import { Bell, Mail, Moon, Globe, CheckCircle} from 'lucide-react';
import { type UpdatePreferencesData } from '../types';

interface PreferencesFormProps {
  initialData?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
  };
  onSubmit: (data: UpdatePreferencesData) => Promise<void>;
  loading?: boolean;
}

// const languages = [
//   { value: 'en', label: 'English' },
//   { value: 'es', label: 'Spanish' },
//   { value: 'fr', label: 'French' },
//   { value: 'de', label: 'German' },
//   { value: 'zh', label: 'Chinese' },
//   { value: 'ja', label: 'Japanese' },
// ];

// const timezones = [
  // { value: 'UTC', label: 'UTC' },
//   { value: 'America/New_York', label: 'Eastern Time (ET)' },
//   { value: 'America/Chicago', label: 'Central Time (CT)' },
//   { value: 'America/Denver', label: 'Mountain Time (MT)' },
//   { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
//   { value: 'Europe/London', label: 'London (GMT)' },
//   { value: 'Europe/Paris', label: 'Paris (CET)' },
//   { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
//   { value: 'Asia/Dubai', label: 'Dubai (GST)' },
//   { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
// ];

export const PreferencesForm = ({ 
  initialData, 
  onSubmit, 
  loading = false 
}: PreferencesFormProps) => {
  const [preferences, setPreferences] = useState({
    emailNotifications: initialData?.emailNotifications ?? true,
    pushNotifications: initialData?.pushNotifications ?? true,
    theme: initialData?.theme || 'auto',
    language: initialData?.language || 'en',
    timezone: initialData?.timezone || 'UTC',
  });

  const handleSubmit = async () => {
    await onSubmit(preferences);
  };

  const handleSwitchChange = (key: keyof typeof preferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleSelectChange = (key: keyof typeof preferences, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive updates via email</p>
              </div>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => 
                handleSwitchChange('emailNotifications', checked)
              }
            />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500">Receive browser notifications</p>
              </div>
            </div>
            <Switch
              checked={preferences.pushNotifications}
              onCheckedChange={(checked) => 
                handleSwitchChange('pushNotifications', checked)
              }
            />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Moon className="h-5 w-5" />
          Appearance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['light', 'dark', 'auto'] as const).map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => handleSelectChange('theme', theme)}
              className={`p-4 border rounded-lg text-left transition-all ${
                preferences.theme === theme
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium capitalize">{theme} Theme</span>
                {preferences.theme === theme && (
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <p className="text-sm text-gray-500">
                {theme === 'auto' 
                  ? 'Follow system settings'
                  : theme === 'light'
                  ? 'Light background'
                  : 'Dark background'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Language & Region */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Language & Region
        </h3>
        
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> */}
          {/* <Select
            label="Language"
            options={languages}
            value={preferences.language}
            onChange={(value) => handleSelectChange('language', value)}
          /> */}
          
          {/* <Select
            label="Timezone"
            options={timezones}
            value={preferences.timezone}
            onChange={(value) => handleSelectChange('timezone', value)}
          /> */}
        {/* </div> */}
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSubmit} loading={loading} size="lg">
          Save Preferences
        </Button>
      </div>
    </div>
  );
};