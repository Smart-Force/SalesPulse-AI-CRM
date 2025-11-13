import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useToasts } from '../../contexts/ToastContext';

// FIX: Add props for the onLogout function.
interface AccountSettingsProps {
    onLogout: () => void;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({ onLogout }) => {
    const { addToast } = useToasts();
    
    const handleDeleteAccount = () => {
        if (window.confirm('Are you absolutely sure? This action is permanent and cannot be undone.')) {
            addToast('Workspace deleted (simulation).', 'error');
            // FIX: Call onLogout after deleting the workspace.
            onLogout();
        }
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Manage general account settings.</p>
                </CardHeader>
                <CardContent>
                    <p>General account settings will be here.</p>
                </CardContent>
            </Card>
            <Card className="border-red-500 dark:border-red-500/50">
                <CardHeader>
                    <CardTitle className="text-red-700 dark:text-red-500">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-slate-200">Delete Workspace</h3>
                        <p className="text-sm text-gray-600 dark:text-slate-400">Permanently delete this workspace and all its contents.</p>
                    </div>
                    <button onClick={handleDeleteAccount} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700">Delete Workspace</button>
                </CardContent>
            </Card>
        </div>
    );
};
