import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import type { RolePermissions, UserRole, View, User } from '../../types';
import { allViews } from '../../data/permissions';
import { useToasts } from '../../contexts/ToastContext';
import { Loader2 } from 'lucide-react';

interface RolesSettingsProps {
    rolePermissions: RolePermissions;
    setRolePermissions: (permissions: RolePermissions) => void;
    currentUser: User;
}

const getRolesToManage = (currentUserRole: UserRole): Exclude<UserRole, 'Super Admin'>[] => {
    const roleHierarchy: Record<UserRole, number> = {
        'Super Admin': 3,
        'Admin': 2,
        'Manager': 1,
        'Member': 0
    };
    const roles: UserRole[] = ['Admin', 'Manager', 'Member'];
    return roles.filter(role => roleHierarchy[currentUserRole] > roleHierarchy[role]) as Exclude<UserRole, 'Super Admin'>[];
};

const RolesSettings: React.FC<RolesSettingsProps> = ({ rolePermissions, setRolePermissions, currentUser }) => {
    const [editedPermissions, setEditedPermissions] = useState(rolePermissions);
    const [isSaving, setIsSaving] = useState(false);
    const { addToast } = useToasts();
    
    const rolesToManage = getRolesToManage(currentUser.role);

    const handlePermissionChange = (role: UserRole, view: View, isChecked: boolean) => {
        setEditedPermissions(prev => {
            const newPermissions = JSON.parse(JSON.stringify(prev)); // Deep copy to avoid state mutation issues
            
            if (!newPermissions[role]) newPermissions[role] = {};
            if (!newPermissions[role][view]) newPermissions[role][view] = { view: false, create: false, edit: false, delete: false };
    
            newPermissions[role][view].view = isChecked;
    
            // For this simplified UI, checking view also grants/removes other permissions.
            const otherPerms = isChecked;
            newPermissions[role][view].create = otherPerms;
            newPermissions[role][view].edit = otherPerms;
            newPermissions[role][view].delete = otherPerms;
    
            return newPermissions;
        });
    };

    const handleSaveChanges = () => {
        setIsSaving(true);
        setTimeout(() => {
            setRolePermissions(editedPermissions);
            setIsSaving(false);
            addToast('Permissions updated successfully!', 'success');
        }, 1000);
    };

    const handleCancel = () => {
        setEditedPermissions(rolePermissions);
        addToast('Changes discarded.', 'info');
    };
    
    const hasChanges = JSON.stringify(rolePermissions) !== JSON.stringify(editedPermissions);

    const { pageViews, settingsViews } = useMemo(() => {
        const settingsViewNames = ['Settings - Team', 'Settings - AI Provider', 'Settings - Roles', 'Settings - Billing'];
        const pages = allViews.filter(v => !settingsViewNames.includes(v) && v !== 'Settings');
        const settings = allViews.filter(v => settingsViewNames.includes(v));
        return { pageViews: pages, settingsViews: settings };
    }, []);

    if (currentUser.role !== 'Admin' && currentUser.role !== 'Super Admin') {
        return null; 
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Roles & Permissions</CardTitle>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                    Define which pages and settings are accessible for each role.
                </p>
            </CardHeader>
            <CardContent className="space-y-8">
                {rolesToManage.map(role => (
                    <div key={role}>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 border-b dark:border-slate-700 pb-2 mb-4">
                            {role} Permissions
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-md font-medium text-gray-700 dark:text-slate-300 mb-3">Page Access</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {pageViews.map(view => {
                                        const isChecked = editedPermissions[role]?.[view]?.view || false;
                                        const isDisabled = view === 'Dashboard';
                                        
                                        return (
                                        <label
                                            key={view}
                                            className={`flex items-center space-x-3 p-2 rounded-md ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                disabled={isDisabled}
                                                onChange={(e) => handlePermissionChange(role, view, e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                                            />
                                            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{view}</span>
                                        </label>
                                    )})}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-md font-medium text-gray-700 dark:text-slate-300 mb-3">Settings Access</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {settingsViews.map(view => {
                                        const isChecked = editedPermissions[role]?.[view]?.view || false;
                                        const label = view.replace('Settings - ', '');
                                        return (
                                        <label
                                            key={view}
                                            className="flex items-center space-x-3 p-2 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={(e) => handlePermissionChange(role, view, e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{label}</span>
                                        </label>
                                    )})}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
            <CardFooter className="border-t dark:border-slate-700 pt-6 flex justify-end items-center gap-x-3">
                <button 
                  onClick={handleCancel}
                  disabled={!hasChanges || isSaving}
                  className="px-4 py-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 border border-gray-300 dark:border-slate-600 rounded-md text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveChanges}
                  disabled={!hasChanges || isSaving}
                  className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSaving && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </CardFooter>
        </Card>
    );
};

export default RolesSettings;
