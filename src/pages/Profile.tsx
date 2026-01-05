import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { User, Mail, Phone, Calendar, Shield, Bell, Accessibility, Palette, Save } from 'lucide-react';
import { toast } from '../components/ui/sonner';

export function Profile() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
  });

  if (!user) return null;

  const handleSave = () => {
    updateUser(formData);
    toast.success('Profile updated successfully');
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 dark:text-white mb-2">Profile & Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{user.firstName} {user.lastName}</h2>
                  <p className="text-gray-600 dark:text-gray-400 capitalize">{user.role}</p>
                  <button className="mt-2 text-sm text-blue-600 hover:text-blue-700">
                    Change Photo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Email Notifications', key: 'email', description: 'Receive updates via email' },
                    { label: 'Push Notifications', key: 'push', description: 'Get browser notifications' },
                    { label: 'SMS Notifications', key: 'sms', description: 'Receive text messages' },
                  ].map((pref) => (
                    <label key={pref.key} className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <input
                        type="checkbox"
                        checked={(user.preferences.notifications as any)[pref.key]}
                        onChange={(e) => {
                          updateUser({
                            preferences: {
                              ...user.preferences,
                              notifications: {
                                ...user.preferences.notifications,
                                [pref.key]: e.target.checked,
                              },
                            },
                          });
                        }}
                        className="mt-1 w-4 h-4 text-blue-600 rounded"
                      />
                      <div>
                        <div className="font-medium">{pref.label}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{pref.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'accessibility' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">Display Preferences</h3>
                
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <label className="block font-medium mb-3">Theme</label>
                    <div className="flex gap-3">
                      {(['light', 'dark', 'auto'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={`
                            flex-1 px-4 py-3 border-2 rounded-lg capitalize transition-colors
                            ${theme === t
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                            }
                          `}
                        >
                          <Palette className="w-5 h-5 mx-auto mb-1" />
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {[
                    { label: 'High Contrast', key: 'highContrast' },
                    { label: 'Large Text', key: 'largeText' },
                    { label: 'Reduced Motion', key: 'reducedMotion' },
                  ].map((pref) => (
                    <label key={pref.key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <span className="font-medium">{pref.label}</span>
                      <input
                        type="checkbox"
                        checked={(user.preferences.accessibility as any)[pref.key]}
                        onChange={(e) => {
                          updateUser({
                            preferences: {
                              ...user.preferences,
                              accessibility: {
                                ...user.preferences.accessibility,
                                [pref.key]: e.target.checked,
                              },
                            },
                          });
                        }}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <Shield className="w-8 h-8 text-blue-600 mb-2" />
                <h3 className="font-medium text-blue-900 dark:text-blue-200">Your Data is Secure</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                  All your health information is encrypted and stored securely in compliance with HIPAA and GDPR regulations.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-4">Security Settings</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="font-medium">Change Password</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Update your password</div>
                  </button>
                  <button className="w-full text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="font-medium">Enable Two-Factor Authentication</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security</div>
                  </button>
                  <button className="w-full text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="font-medium">Download My Data</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Export all your health information</div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
