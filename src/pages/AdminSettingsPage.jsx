import React, { useState } from 'react';
import { Icon } from '../components/Icon';

export function AdminSettings() {
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    allowNewRegistrations: true,
    maxUploadSize: 10,
    sessionTimeout: 30,
    emailNotifications: true,
  });

  const handleSettingChange = (key) => {
    setSystemSettings({ ...systemSettings, [key]: !systemSettings[key] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure platform behavior and parameters</p>
      </div>

      <div className="grid gap-4 max-w-2xl">
        {/* General Settings */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">General Settings</h3>
          <div className="space-y-4">
            {[
              { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Temporarily disable platform access' },
              { key: 'allowNewRegistrations', label: 'Allow New Registrations', desc: 'Enable/disable new user signups' },
              { key: 'emailNotifications', label: 'Email Notifications', desc: 'Send system alerts via email' },
            ].map((setting) => (
              <div key={setting.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{setting.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{setting.desc}</p>
                </div>
                <button
                  onClick={() => handleSettingChange(setting.key)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${systemSettings[setting.key] ? 'bg-primary-600' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${systemSettings[setting.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Limits */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Resource Limits</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Max Upload Size (MB)</label>
              <input type="number" value={systemSettings.maxUploadSize} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Session Timeout (Minutes)</label>
              <input type="number" value={systemSettings.sessionTimeout} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button className="btn-primary flex items-center gap-2"><Icon name="Save" size={14} />Save Settings</button>
          <button className="btn-secondary">Reset to Defaults</button>
        </div>
      </div>
    </div>
  );
}
