import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/Card';

export const SettingsSecurity: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
           <p className="text-sm text-gray-500 dark:text-slate-400">Update your password. Ensure it is at least 8 characters long.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Current Password</label>
            <input type="password" name="current-password" id="current-password" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" />
          </div>
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-slate-300">New Password</label>
            <input type="password" name="new-password" id="new-password" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Confirm New Password</label>
            <input type="password" name="confirm-password" id="confirm-password" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" />
          </div>
        </CardContent>
        <CardFooter className="border-t dark:border-slate-700 pt-6 flex justify-end">
          <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Update Password
          </button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <p className="text-sm text-gray-500 dark:text-slate-400">Add an extra layer of security to your account.</p>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
            <h3 className="font-semibold text-gray-800 dark:text-slate-200">Status: Disabled</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">Protect your account from unauthorized access.</p>
          </div>
          <button className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex-shrink-0">
            Enable 2FA
          </button>
        </CardContent>
      </Card>
    </div>
  );
};
