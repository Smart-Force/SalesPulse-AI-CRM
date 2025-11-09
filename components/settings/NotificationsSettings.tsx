import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

export const NotificationsSettings: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <p className="text-sm text-gray-500 dark:text-slate-400">Manage how you receive notifications.</p>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-slate-400">Notification settings are coming soon.</p>
      </CardContent>
    </Card>
  );
};
