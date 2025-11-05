import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

export const AccountSettings: React.FC = () => {

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action is permanent and cannot be undone.')) {
        alert('Account deleted (mock)! In a real app, this would trigger an irreversible backend process.');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-red-500 dark:border-red-500/50">
        <CardHeader>
          <CardTitle className="text-red-700 dark:text-red-500">Danger Zone</CardTitle>
           <p className="text-sm text-gray-500 dark:text-slate-400">These actions are permanent and cannot be undone.</p>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-slate-200">Delete your account</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">Permanently remove your Personal Account and all of its contents.</p>
          </div>
          <button onClick={handleDeleteAccount} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex-shrink-0">
            Delete Account
          </button>
        </CardContent>
      </Card>
    </div>
  );
};