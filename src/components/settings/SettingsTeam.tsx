import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
import type { User, UserRole, RolePermissions, View } from '../../types';
import InviteMemberModal from '../modals/InviteMemberModal';
import ConfirmDeleteModal from '../modals/ConfirmDeleteModal';
import { useToasts } from '../../contexts/ToastContext';
import { usePermissions } from '../../contexts/PermissionContext';

interface TeamSettingsProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    currentUser: User;
    onInviteUser: (name: string, email: string, role: UserRole) => { success: boolean, message: string };
    rolePermissions: RolePermissions;
    setRolePermissions: (permissions: RolePermissions) => void;
}

const roleHierarchy: Record<UserRole, number> = {
    'Super Admin': 4,
    'Admin': 3,
    'Manager': 2,
    'Member': 1
};

const canManage = (currentUserRole: UserRole, targetUserRole: UserRole): boolean => {
    return roleHierarchy[currentUserRole] > roleHierarchy[targetUserRole];
};

const getAssignableRoles = (currentUserRole: UserRole): UserRole[] => {
    const roles: UserRole[] = ['Admin', 'Manager', 'Member'];
    return roles.filter(role => roleHierarchy[currentUserRole] > roleHierarchy[role]);
};

export const SettingsTeam: React.FC<TeamSettingsProps> = ({ users, setUsers, currentUser, onInviteUser, rolePermissions, setRolePermissions }) => {
    const { addToast } = useToasts();
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [userToRemove, setUserToRemove] = useState<User | null>(null);
    const [editedPermissions, setEditedPermissions] = useState(rolePermissions);
    const [isSavingPermissions, setIsSavingPermissions] = useState(false);
    
    const { view: canViewTeam, create: canCreateTeam, edit: canEditTeam, delete: canDeleteTeam } = usePermissions('Settings - Team');
    const { view: canViewRoles, edit: canEditRoles } = usePermissions('Settings - Roles');

    const assignableRolesForEditing = getAssignableRoles(currentUser.role);
    const canInvite = canCreateTeam;

    const handleRoleChange = (userId: string, newRole: UserRole) => {
        setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
        addToast(`Role updated successfully.`, 'success');
    };

    const confirmRemoveMember = () => {
        if (userToRemove) {
            setUsers(users.filter(user => user.id !== userToRemove.id));
            addToast(`${userToRemove.name} has been removed.`, 'success');
        }
        setUserToRemove(null);
    };

    const handlePermissionChange = (role: UserRole, view: View, isChecked: boolean) => {
        setEditedPermissions(prev => {
            const newPermissions = JSON.parse(JSON.stringify(prev));
            
            if (!newPermissions[role]) newPermissions[role] = {};
            if (!newPermissions[role][view]) newPermissions[role][view] = {};
    
            newPermissions[role][view].view = isChecked;
    
            if (!isChecked) {
                newPermissions[role][view].create = false;
                newPermissions[role][view].edit = false;
                newPermissions[role][view].delete = false;
            } else {
                newPermissions[role][view].create = true;
                newPermissions[role][view].edit = true;
                newPermissions[role][view].delete = true;
            }
    
            return newPermissions;
        });
    };

    const handleSaveChanges = () => {
        setIsSavingPermissions(true);
        setTimeout(() => {
            setRolePermissions(editedPermissions);
            setIsSavingPermissions(false);
            addToast('Permissions updated successfully!', 'success');
        }, 1000);
    };

    const hasPermissionChanges = JSON.stringify(rolePermissions) !== JSON.stringify(editedPermissions);
    const rolesToManage = getAssignableRoles(currentUser.role);
    
    const { pageViews, settingsViews } = useMemo(() => {
        const pageViewsResult: View[] = [
            'Dashboard', 'Email Inbox', 'Prospects', 'Campaigns', 'Workflows',
            'Lead Generation', 'Playbooks', 'AI Generator', 'Products', 'Analytics', 
            'Live Call', 'Integrations'
        ];
        const settingsViewsResult: View[] = [
            'Settings - Billing', 
            'Settings - AI Provider', 
            'Settings - Roles'
        ];
        return { pageViews: pageViewsResult, settingsViews: settingsViewsResult };
    }, []);

    const settingsLabels: { [key in View]?: string } = {
        'Settings - Billing': 'Billing',
        'Settings - AI Provider': 'AI Provider',
        'Settings - Roles': 'Roles & Permissions',
    };


    return (
        <div className="space-y-8">
            {isInviteModalOpen && <InviteMemberModal onClose={() => setInviteModalOpen(false)} onInvite={onInviteUser} existingUsers={users} currentUser={currentUser} />}
            {userToRemove && <ConfirmDeleteModal isOpen={!!userToRemove} onClose={() => setUserToRemove(null)} onConfirm={confirmRemoveMember} title={`Remove ${userToRemove.name}`} description="Are you sure you want to remove this member? This action cannot be undone." />}
            
            {canViewTeam && (
                <Card>
                    <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <CardTitle>Team Members</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Manage who can access this workspace.</p>
                        </div>
                        {canInvite && <button onClick={() => setInviteModalOpen(true)} className="mt-4 sm:mt-0 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center shadow-sm"><PlusCircle className="h-5 w-5 mr-2" /> Invite Member</button>}
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                                <thead className="bg-gray-50 dark:bg-slate-700/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Member</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Role</th>
                                        <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                    {users.map(user => {
                                        const isCurrentUser = user.id === currentUser.id;
                                        const canManageUser = canManage(currentUser.role, user.role);
                                        const isProtectedRole = user.role === 'Super Admin';

                                        return (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: user.avatarColor }}>{user.initials}</div><div className="ml-4"><div className="text-sm font-medium text-gray-900 dark:text-slate-100">{user.name} {isCurrentUser && <span className="text-xs text-blue-500">(You)</span>}</div><div className="text-sm text-gray-500 dark:text-slate-400">{user.email}</div></div></div></td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select 
                                                    value={user.role} 
                                                    onChange={e => handleRoleChange(user.id, e.target.value as UserRole)} 
                                                    disabled={!canEditTeam || !canManageUser || isProtectedRole}
                                                    className="px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-blue-500 disabled:bg-slate-100 dark:disabled:bg-slate-700/50 disabled:cursor-not-allowed disabled:text-gray-500"
                                                >
                                                    <option value={user.role}>{user.role}</option>
                                                    {assignableRolesForEditing.filter(r => r !== user.role).map(role => (<option key={role} value={role}>{role}</option>))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {canDeleteTeam && <button onClick={() => setUserToRemove(user)} disabled={isCurrentUser || !canManageUser || isProtectedRole} title={isCurrentUser ? "You cannot remove yourself." : isProtectedRole ? "Super Admins cannot be removed." : !canManageUser ? "Permission denied." : "Remove member"} className="text-gray-400 hover:text-red-600 p-2 rounded-full disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-400"><Trash2 className="h-5 w-5" /></button>}
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {(canViewRoles) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Roles & Permissions</CardTitle>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Define which pages and settings are accessible for each role.</p>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {rolesToManage.map(role => (
                            <div key={role}>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 border-b dark:border-slate-700 pb-2 mb-4">{role} Permissions</h3>
                                <div className="space-y-6">
                                     <div>
                                        <h4 className="text-md font-medium text-gray-700 dark:text-slate-300 mb-3">Page Access</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {pageViews.map(view => {
                                                const isChecked = editedPermissions[role]?.[view]?.view || false;
                                                const isDisabled = view === 'Dashboard';
                                                return (
                                                <label key={view} className={`flex items-center space-x-3 p-2 rounded-md ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}>
                                                    <input type="checkbox" checked={isChecked} disabled={isDisabled || !canEditRoles} onChange={e => handlePermissionChange(role, view, e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50" />
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
                                                const label = settingsLabels[view] || view;
                                                return (
                                                <label key={view} className="flex items-center space-x-3 p-2 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50">
                                                    <input type="checkbox" checked={isChecked} disabled={!canEditRoles} onChange={e => handlePermissionChange(role, view, e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{label}</span>
                                                </label>
                                            )})}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    {canEditRoles && (
                        <CardFooter className="border-t dark:border-slate-700 pt-6 flex justify-end">
                            <button onClick={handleSaveChanges} disabled={!hasPermissionChanges || isSavingPermissions} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-70">
                                {isSavingPermissions && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                                {isSavingPermissions ? 'Saving...' : 'Save Permissions'}
                            </button>
                        </CardFooter>
                    )}
                </Card>
            )}
        </div>
    );
};