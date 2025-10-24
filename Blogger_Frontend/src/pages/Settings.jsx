import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { usersAPI } from '../utils/api';
import Layout from '../components/layout/Layout';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
  });

  const [avatarUrl, setAvatarUrl] = useState('');

  const [preferences, setPreferences] = useState({
    theme: user?.preferences?.theme || 'light',
    notifications: {
      email: user?.preferences?.notifications?.email ?? true,
      likes: user?.preferences?.notifications?.likes ?? true,
      comments: user?.preferences?.notifications?.comments ?? true,
      follows: user?.preferences?.notifications?.follows ?? true,
    },
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    setSuccess('');
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess('');

    try {
      const response = await usersAPI.updateProfile(profileData);
      updateUser(response.data.data.user);
      setSuccess('Profile updated successfully!');
    } catch (error) {
      setErrors({ 
        general: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSubmit = async (e) => {
    e.preventDefault();
    if (!avatarUrl.trim()) return;

    setLoading(true);
    setErrors({});
    setSuccess('');

    try {
      const response = await usersAPI.updateAvatar({ avatar: avatarUrl });
      updateUser(response.data.data.user);
      setSuccess('Avatar updated successfully!');
      setAvatarUrl('');
    } catch (error) {
      setErrors({ 
        avatar: error.response?.data?.message || 'Failed to update avatar' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess('');

    try {
      const response = await usersAPI.updatePreferences({ preferences });
      updateUser(response.data.data.user);
      setTheme(preferences.theme);
      setSuccess('Preferences updated successfully!');
    } catch (error) {
      setErrors({ 
        general: error.response?.data?.message || 'Failed to update preferences' 
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile' },
    { id: 'avatar', name: 'Avatar' },
    { id: 'preferences', name: 'Preferences' },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Settings
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card padding="sm">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSuccess('');
                      setErrors({});
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            {success && (
              <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 animate-slide-down">
                <p className="text-sm text-green-600 dark:text-green-400">
                  {success}
                </p>
              </div>
            )}

            {errors.general && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-slide-down">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.general}
                </p>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                  Profile Information
                </h2>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <Input
                    label="Full Name"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleProfileChange}
                    placeholder="John Doe"
                    required
                  />

                  <Textarea
                    label="Bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    helperText="Maximum 500 characters"
                  />

                  <Input
                    label="Location"
                    name="location"
                    value={profileData.location}
                    onChange={handleProfileChange}
                    placeholder="San Francisco, CA"
                  />

                  <Input
                    label="Website"
                    name="website"
                    value={profileData.website}
                    onChange={handleProfileChange}
                    placeholder="https://yourwebsite.com"
                    type="url"
                  />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      loading={loading}
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Avatar Tab */}
            {activeTab === 'avatar' && (
              <Card>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                  Profile Avatar
                </h2>

                <div className="flex flex-col items-center mb-6">
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName)}&size=200`}
                    alt={user?.fullName}
                    className="w-32 h-32 rounded-full object-cover border-4 border-neutral-200 dark:border-neutral-700 mb-4"
                  />
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Current avatar
                  </p>
                </div>

                <form onSubmit={handleAvatarSubmit} className="space-y-6">
                  <Input
                    label="Avatar URL"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    error={errors.avatar}
                    helperText="Enter a URL to an image for your avatar"
                  />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      loading={loading}
                      disabled={!avatarUrl.trim()}
                    >
                      Update Avatar
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <Card>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                  Preferences
                </h2>
                <form onSubmit={handlePreferencesSubmit} className="space-y-6">
                  {/* Theme */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                      Theme
                    </label>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setPreferences(prev => ({ ...prev, theme: 'light' }))}
                        className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                          preferences.theme === 'light'
                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-neutral-300 dark:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <span className="font-medium">Light</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreferences(prev => ({ ...prev, theme: 'dark' }))}
                        className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                          preferences.theme === 'dark'
                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-neutral-300 dark:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                          <span className="font-medium">Dark</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                      Notification Preferences
                    </label>
                    <div className="space-y-3">
                      {Object.keys(preferences.notifications).map((key) => (
                        <label key={key} className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                          <span className="text-neutral-900 dark:text-neutral-100 capitalize">
                            {key === 'email' ? 'Email notifications' : `${key} notifications`}
                          </span>
                          <input
                            type="checkbox"
                            checked={preferences.notifications[key]}
                            onChange={(e) => {
                              setPreferences(prev => ({
                                ...prev,
                                notifications: {
                                  ...prev.notifications,
                                  [key]: e.target.checked,
                                },
                              }));
                            }}
                            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      loading={loading}
                    >
                      Save Preferences
                    </Button>
                  </div>
                </form>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;

