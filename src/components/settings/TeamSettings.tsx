import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import { PlusCircle, Trash2, Loader2, Users, Shield, LayoutGrid, Cog } from 'lucide-react';
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

type PermissionSubTab = 'pages' | 'settings';

export const SettingsTeam: React.FC<TeamSettingsProps> = ({ users, setUsers, currentUser, onInviteUser, rolePermissions, setRolePermissions }) => {
    const [activeTab, setActiveTab] = useState<'members' | 'roles'>('members');
    const { addToast } = useToasts();
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [userToRemove, setUserToRemove] = useState<User | null>(null);
    const [editedPermissions, setEditedPermissions] = useState(rolePermissions);
    const [isSavingPermissions, setIsSavingPermissions] = useState(false);
    
    const { view: canViewTeam, create: canCreateTeam, edit: canEditTeam, delete: canDeleteTeam } = usePermissions('Settings - Team');
    const { view: canViewRoles, edit: canEditRoles } = usePermissions('Settings - Roles');

    const assignableRolesForEditing = getAssignableRoles(currentUser.role);
    const rolesToManage = getAssignableRoles(currentUser.role);
    const [activeRoleTab, setActiveRoleTab] = useState<UserRole | null>(rolesToManage.length > 0 ? rolesToManage[0] : null);
    const [activePermissionSubTab, setActivePermissionSubTab] = useState<PermissionSubTab>('pages');

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
            // Simple logic: viewing implies all other actions for now
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

    const handleCancelChanges = () => {
        setEditedPermissions(rolePermissions);
        addToast('Changes discarded.', 'info');
    };

    const hasPermissionChanges = JSON.stringify(rolePermissions) !== JSON.stringify(editedPermissions);
    
    const { pageViews, settingsViews } = useMemo(() => {
        const pageViewsResult: View[] = [
            'Dashboard', 'Email Inbox', 'Prospects', 'Campaigns', 'Workflows',
            'Lead Generation', 'Playbooks', 'AI Generator', 'Products', 'Analytics', 
            'Live Call', 'Integrations'
        ];
        const settingsViewsResult: View[] = [
            'Settings - Team', 
            'Settings - Billing', 
            'Settings - AI Provider', 
            'Settings - Roles'
        ];
        return { pageViews: pageViewsResult, settingsViews: settingsViewsResult };
    }, []);

    const settingsLabels: { [key in View]?: string } = {
        'Settings - Team': 'Team',
        'Settings - Billing': 'Billing',
        'Settings - AI Provider': 'AI Provider',
        'Settings - Roles': 'Roles & Permissions',
    };

    return (
        <div className="space-y-8">
            {isInviteModalOpen && <InviteMemberModal onClose={() => setInviteModalOpen(false)} onInvite={onInviteUser} existingUsers={users} currentUser={currentUser} />}
            {userToRemove && <ConfirmDeleteModal isOpen={!!userToRemove} onClose={() => setUserToRemove(null)} onConfirm={confirmRemoveMember} title={`Remove ${userToRemove.name}`} description="Are you sure you want to remove this member? This action cannot be undone." />}
            
            <Card>
                <CardHeader className="border-b dark:border-slate-700 p-0">
                    <div className="flex items-center px-6">
                        <button onClick={() => setActiveTab('members')} className={`flex items-center gap-2 py-3 border-b-2 text-sm font-medium ${activeTab === 'members' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            <Users className="h-5 w-5" /> Members
                        </button>
                        {canViewRoles && <button onClick={() => setActiveTab('roles')} className={`flex items-center gap-2 py-3 ml-6 border-b-2 text-sm font-medium ${activeTab === 'roles' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            <Shield className="h-5 w-5" /> Roles & Permissions
                        </button>}
                    </div>
                </CardHeader>
                
                {activeTab === 'members' && (
                    <>
                        <CardContent className="pt-6">
                            {canViewTeam ? (
                                <>
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold">Team Members</h3>
                                            <p className="text-sm text-gray-500 dark:text-slate-400">Manage who can access this workspace.</p>
                                        </div>
                                        {canInvite && <button onClick={() => setInviteModalOpen(true)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center shadow-sm"><PlusCircle className="h-5 w-5 mr-2" /> Invite Member</button>}
                                    </div>
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
                                                            <select value={user.role} onChange={e => handleRoleChange(user.id, e.target.value as UserRole)} disabled={!canEditTeam || !canManageUser || isProtectedRole} className="px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-blue-500 disabled:bg-slate-100 dark:disabled:bg-slate-700/50 disabled:cursor-not-allowed disabled:text-gray-500">
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
                                </>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-slate-400">You do not have permission to view team members.</p>
                            )}
                        </CardContent>
                    </>
                )}

                {activeTab === 'roles' && (
                    <>
                        <CardContent className="pt-6">
                            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">Define which pages and settings are accessible for each role.</p>
                             <div className="flex">
                                <div className="w-1/4 pr-4 border-r dark:border-slate-600">
                                    <nav className="flex flex-col space-y-1">
                                    {rolesToManage.map(role => (
                                        <button key={role} onClick={() => setActiveRoleTab(role)} className={`px-3 py-2 rounded-md text-sm font-medium text-left ${activeRoleTab === role ? 'bg-slate-100 dark:bg-slate-700 text-gray-900 dark:text-slate-100' : 'text-gray-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                                            {role}
                                        </button>
                                    ))}
                                    </nav>
                                </div>
                                <div className="w-3/4 pl-6">
                                    {activeRoleTab ? (
                                        <div>
                                            <div className="border-b border-gray-200 dark:border-slate-600 mb-4">
                                                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                                    <button onClick={() => setActivePermissionSubTab('pages')} className={`flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activePermissionSubTab === 'pages' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700'}`}><LayoutGrid className="h-4 w-4" /> Page Access</button>
                                                    <button onClick={() => setActivePermissionSubTab('settings')} className={`flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activePermissionSubTab === 'settings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700'}`}><Cog className="h-4 w-4" /> Settings Access</button>
                                                </nav>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                {(activePermissionSubTab === 'pages' ? pageViews : settingsViews).map(view => {
                                                    const isChecked = editedPermissions[activeRoleTab]?.[view]?.view || false;
                                                    const isDisabled = view === 'Dashboard' || view === 'Settings';
                                                    const label = activePermissionSubTab === 'settings' ? (settingsLabels[view] || view) : view;
                                                    return (
                                                        <label key={view} className={`flex items-center space-x-3 p-2 rounded-md ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}>
                                                            <input type="checkbox" checked={isChecked} disabled={isDisabled || !canEditRoles} onChange={e => handlePermissionChange(activeRoleTab, view, e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50" />
                                                            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{label}</span>
                                                        </label>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-center text-gray-500 dark:text-slate-400">Select a role to manage its permissions.</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                        {canEditRoles && activeRoleTab && (
                            <CardFooter className="pt-6 flex justify-end items-center gap-3">
                                <button onClick={handleCancelChanges} disabled={!hasPermissionChanges || isSavingPermissions} className="px-4 py-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 border border-gray-300 dark:border-slate-600 rounded-md text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50">
                                    Cancel
                                </button>
                                <button onClick={handleSaveChanges} disabled={!hasPermissionChanges || isSavingPermissions} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-70">
                                    {isSavingPermissions && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                                    {isSavingPermissions ? 'Saving...' : 'Save Permissions'}
                                </button>
                            </CardFooter>
                        )}
                    </>
                )}
            </Card>
        </div>
    );
};