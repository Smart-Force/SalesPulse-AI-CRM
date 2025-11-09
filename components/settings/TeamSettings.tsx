import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { PlusCircle, Trash2 } from 'lucide-react';
import type { User, UserRole } from '../../types';
import InviteMemberModal from '../modals/InviteMemberModal';
import ConfirmDeleteModal from '../modals/ConfirmDeleteModal';
import { useToasts } from '../../contexts/ToastContext';

interface TeamSettingsProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    currentUser: User;
    onInviteUser: (name: string, email: string, role: UserRole) => { success: boolean, message: string };
}

const roleHierarchy: Record<UserRole, number> = {
    'Super Admin': 3,
    'Admin': 2,
    'Manager': 1,
    'Member': 0
};

const canManage = (currentUserRole: UserRole, targetUserRole: UserRole): boolean => {
    // A user cannot manage someone with an equal or higher role.
    return roleHierarchy[currentUserRole] > roleHierarchy[targetUserRole];
};

const getAssignableRoles = (currentUserRole: UserRole): UserRole[] => {
    const allRoles: UserRole[] = ['Admin', 'Manager', 'Member'];
    // Filter to roles that are lower in hierarchy than the current user.
    return allRoles.filter(role => roleHierarchy[currentUserRole] > roleHierarchy[role]);
};

export const TeamSettings: React.FC<TeamSettingsProps> = ({ users, setUsers, currentUser, onInviteUser }) => {
    const { addToast } = useToasts();
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [userToRemove, setUserToRemove] = useState<User | null>(null);

    const assignableRolesForEditing = getAssignableRoles(currentUser.role);
    const canInvite = currentUser.role !== 'Member';

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

    return (
        <>
            {isInviteModalOpen && <InviteMemberModal onClose={() => setInviteModalOpen(false)} onInvite={onInviteUser} existingUsers={users} currentUser={currentUser} />}
            {userToRemove && <ConfirmDeleteModal isOpen={!!userToRemove} onClose={() => setUserToRemove(null)} onConfirm={confirmRemoveMember} title={`Remove ${userToRemove.name}`} description="Are you sure you want to remove this member? This action cannot be undone." />}
            
            <Card>
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <CardTitle>Team Management</CardTitle>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Manage your workspace members and their roles.</p>
                    </div>
                    {canInvite && <button onClick={() => setInviteModalOpen(true)} className="mt-4 sm:mt-0 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center shadow-sm"><PlusCircle className="h-5 w-5 mr-2" /> Invite Member</button>}
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">MEMBER</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">ROLE</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                {users.map(user => {
                                    const isCurrentUser = user.id === currentUser.id;
                                    const canManageUser = canManage(currentUser.role, user.role);
                                    return (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: user.avatarColor }}>{user.initials}</div><div className="ml-4"><div className="text-sm font-medium text-gray-900 dark:text-slate-100">{user.name} {isCurrentUser && <span className="text-xs text-blue-500">(You)</span>}</div><div className="text-sm text-gray-500 dark:text-slate-400">{user.email}</div></div></div></td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select 
                                                value={user.role} 
                                                onChange={e => handleRoleChange(user.id, e.target.value as UserRole)} 
                                                disabled={!canManageUser}
                                                className="px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-blue-500 disabled:bg-slate-100 dark:disabled:bg-slate-700/50 disabled:cursor-not-allowed disabled:text-gray-500"
                                            >
                                                <option value={user.role}>{user.role}</option>
                                                {assignableRolesForEditing.filter(r => r !== user.role).map(role => (<option key={role} value={role}>{role}</option>))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button onClick={() => setUserToRemove(user)} disabled={isCurrentUser || !canManageUser} title={isCurrentUser ? "You cannot remove yourself." : !canManageUser ? "Permission denied." : "Remove member"} className="text-gray-400 hover:text-red-600 p-2 rounded-full disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-400"><Trash2 className="h-5 w-5" /></button></td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};
