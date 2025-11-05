import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/Card';

const ToggleSwitch = ({ id, label, checked, onChange }: { id: string, label: string, checked: boolean, onChange: (checked: boolean) => void }) => (
  <div className="flex items-center justify-between py-4">
    <label htmlFor={id} className="font-medium text-gray-700 dark:text-slate-300">{label}</label>
    <button
      id={id}
      type="button"
      className={`${
        checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:ring-offset-slate-800`}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span
        aria-hidden="true"
        className={`${
          checked ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  </div>
);

export const NotificationsSettings: React.FC = () => {
  const [notifications, setNotifications] = useState({
    newLeads: true,
    weeklySummary: true,
    productUpdates: false,
    taskReminders: true,
    mentions: true,
  });

  const handleToggle = (id: keyof typeof notifications, checked: boolean) => {
    setNotifications(prev => ({ ...prev, [id]: checked }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <p className="text-sm text-gray-500 dark:text-slate-400">Manage how you receive notifications.</p>
      </CardHeader>
      <CardContent>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">Email Notifications</h3>
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            <ToggleSwitch id="newLeads" label="New Lead Alerts" checked={notifications.newLeads} onChange={(c) => handleToggle('newLeads', c)} />
            <ToggleSwitch id="weeklySummary" label="Weekly Summary" checked={notifications.weeklySummary} onChange={(c) => handleToggle('weeklySummary', c)} />
            <ToggleSwitch id="productUpdates" label="Product Updates" checked={notifications.productUpdates} onChange={(c) => handleToggle('productUpdates', c)} />
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">In-App Notifications</h3>
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            <ToggleSwitch id="taskReminders" label="Task Reminders" checked={notifications.taskReminders} onChange={(c) => handleToggle('taskReminders', c)} />
            <ToggleSwitch id="mentions" label="@mentions" checked={notifications.mentions} onChange={(c) => handleToggle('mentions', c)} />
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t dark:border-slate-700 pt-6 flex justify-end">
        <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
          Save Settings
        </button>
      </CardFooter>
    </Card>
  );
};