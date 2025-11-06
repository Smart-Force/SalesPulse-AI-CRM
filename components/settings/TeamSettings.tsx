import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Users, PlusCircle, Mail, Trash2 } from 'lucide-react';
import type { User, UserRole } from '../../types';

interface TeamSettingsProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const roles: UserRole[] = ['Admin', 'Member'];

export const TeamSettings: React.FC<TeamSettingsProps> = ({ users, setUsers }) => {

    const handleInvite = () => {
        // This would typically open a modal
        const email = prompt("Enter email to invite:");
        if (email) {
            alert(`Invitation sent to ${email} (mock)!`);
        }
    };

    const handleRoleChange = (userId: string, newRole: UserRole) => {
        setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
    };

    const handleRemoveMember = (userId: string) => {
        if (window.confirm("Are you sure you want to remove this member from the workspace?")) {
            setUsers(users.filter(user => user.id !== userId));
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <CardTitle>Team Management</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Manage your workspace members and their roles.</p>
                </div>
                <button
                    onClick={handleInvite}
                    className="mt-4 sm:mt-0 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm"
                >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Invite Member
                </button>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Member</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {user.avatarUrl ? (
                                                    <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt="" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: user.avatarColor }}>
                                                        {user.initials}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-slate-100">{user.name}</div>
                                                <div className="text-sm text-gray-500 dark:text-slate-400">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                            className="px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 text-sm"
                                        >
                                            {roles.map(role => <option key={role} value={role}>{role}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleRemoveMember(user.id)}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10"
                                            title="Remove member"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};