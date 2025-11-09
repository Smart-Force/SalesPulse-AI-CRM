import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, Mail, ShieldCheck } from 'lucide-react';
import type { User, UserRole } from '../../types';

interface InviteMemberModalProps {
  onClose: () => void;
  onInvite: (name: string, email: string, role: UserRole) => { success: boolean, message: string };
  existingUsers: User[];
  // FIX: Add currentUser prop to allow for role-based logic.
  currentUser: User;
}

const roleHierarchy: Record<UserRole, number> = {
    'Super Admin': 3,
    'Admin': 2,
    'Manager': 1,
    'Member': 0
};

// Get roles that a user is allowed to assign when inviting.
const getAvailableRolesForInvite = (currentUserRole: UserRole): UserRole[] => {
    const roles: UserRole[] = ['Admin', 'Manager', 'Member']; // Cannot invite Super Admins
    return roles.filter(role => roleHierarchy[currentUserRole] > roleHierarchy[role]);
};

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ onClose, onInvite, existingUsers, currentUser }) => {
    const availableRoles = getAvailableRolesForInvite(currentUser.role);
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        // Default to the lowest possible role the user can assign
        role: availableRoles.length > 0 ? availableRoles[availableRoles.length - 1] : ('Member' as UserRole) 
    });
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (existingUsers.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
            setError('A user with this email already exists.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address.');
            return;
        }

        const result = onInvite(formData.name, formData.email, formData.role);
        if (result.success) {
            onClose();
        } else {
            setError(result.message);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
    }

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-md transform transition-all duration-300 ease-out"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Invite New Member</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-500/30">{error}</p>}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Full Name</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required autoFocus className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Role</label>
                             <div className="relative">
                                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <select 
                                    id="role" 
                                    name="role" 
                                    value={formData.role} 
                                    onChange={handleChange} 
                                    disabled={availableRoles.length === 0}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {availableRoles.length > 0 ? (
                                        availableRoles.map(role => <option key={role} value={role}>{role}</option>)
                                    ) : (
                                        <option disabled>You don't have permission to assign roles.</option>
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex justify-end items-center space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 border border-gray-300 dark:border-slate-600 rounded-md text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 shadow-sm">Send Invitation</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InviteMemberModal;
