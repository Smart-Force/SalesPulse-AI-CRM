import React from 'react';
import { User, UserRole } from '../types';
import { Rocket, ShieldCheck, User as UserIcon, Briefcase } from 'lucide-react';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

// FIX: Add 'Super Admin' to the roleStyles object to resolve type error.
const roleStyles: Record<UserRole, { icon: React.ElementType, color: string }> = {
    'Super Admin': { icon: ShieldCheck, color: 'text-red-500' },
    Admin: { icon: ShieldCheck, color: 'text-green-500' },
    Manager: { icon: Briefcase, color: 'text-blue-500' },
    Member: { icon: UserIcon, color: 'text-gray-500' },
}

export const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="flex items-center mb-8">
        <Rocket className="text-blue-600 h-10 w-10" />
        <span className="text-4xl font-bold text-gray-900 dark:text-slate-100 ml-3">SalesPulse AI</span>
      </div>
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-slate-200 mb-6">Select a profile to log in</h2>
        <div className="space-y-4">
          {users.map(user => {
              const {icon: RoleIcon, color} = roleStyles[user.role];
              return (
                  <button
                    key={user.id}
                    onClick={() => onLogin(user)}
                    className="w-full flex items-center p-4 rounded-lg border dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-blue-500 dark:hover:border-blue-500 transition-all"
                  >
                      <div className="h-12 w-12 rounded-full flex items-center justify-center text-white font-medium text-xl" style={{ backgroundColor: user.avatarColor }}>
                          {user.initials}
                      </div>
                      <div className="ml-4 text-left">
                          <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">{user.name}</p>
                          <div className={`flex items-center text-sm font-medium ${color}`}>
                             <RoleIcon className="h-4 w-4 mr-1.5" />
                             {user.role}
                          </div>
                      </div>
                  </button>
              )
          })}
        </div>
      </div>
       <p className="text-center text-xs text-gray-500 dark:text-slate-400 mt-8">
        This is a simulated login screen for demonstration purposes.
      </p>
    </div>
  );
};