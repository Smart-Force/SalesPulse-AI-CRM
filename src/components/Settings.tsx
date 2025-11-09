import React, { useState } from 'react';
import { User as UserIcon, Lock, Settings as SettingsIcon, Palette, CreditCard, Bell, Users, Bot, Shield } from 'lucide-react';
// FIX: Replace old/problematic imports with new consolidated settings components
import { SettingsProfile } from './settings/SettingsProfile';
import { SettingsSecurity } from './settings/SettingsSecurity';
import { SettingsTeam } from './settings/SettingsTeam';
import { SettingsWorkspace } from './settings/WorkspaceSettings';
import { NotificationsSettings } from './settings/NotificationsSettings';
import type { SettingsTab, User, AIProvider, UserRole, ApiKeys, RolePermissions } from '../types';

interface SettingsProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    aiProvider: AIProvider;
    setAiProvider: (provider: AIProvider) => void;
    currentUser: User;
    onInviteUser: (name: string, email: string, role: UserRole) => { success: boolean; message: string; };
    apiKeys: ApiKeys;
    setApiKeys: (keys: ApiKeys) => void;
    rolePermissions: RolePermissions;
    setRolePermissions: (permissions: RolePermissions) => void;
    onLogout: () => void;
}

const userSettingsTabs: { id: SettingsTab; name: string; icon: React.ElementType }[] = [
  { id: 'profile', name: 'Profile', icon: UserIcon },
  { id: 'security', name: 'Security', icon: Lock },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'appearance', name: 'Appearance', icon: Palette },
];

const workspaceSettingsTabs: { id: SettingsTab; name: string; icon: React.ElementType, adminOnly?: boolean }[] = [
  { id: 'account', name: 'Account', icon: SettingsIcon },
  { id: 'team', name: 'Team', icon: Users },
  { id: 'billing', name: 'Billing', icon: CreditCard },
  { id: 'ai-provider', name: 'AI Provider', icon: Bot },
  { id: 'roles', name: 'Roles & Permissions', icon: Shield, adminOnly: true },
];

type NavButtonProps = {
  tab: { id: SettingsTab; name: string; icon: React.ElementType };
  isActive: boolean;
  onClick: (id: SettingsTab) => void;
};

const NavButton: React.FC<NavButtonProps> = ({ tab, isActive, onClick }) => (
  <button
    onClick={() => onClick(tab.id)}
    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-left w-full ${
      isActive
        ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-slate-200'
    }`}
  >
    <tab.icon className="h-5 w-5 mr-3" />
    <span>{tab.name}</span>
  </button>
);

export const Settings: React.FC<SettingsProps> = ({ users, setUsers, aiProvider, setAiProvider, currentUser, onInviteUser, apiKeys, setApiKeys, rolePermissions, setRolePermissions, onLogout }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('team');

  // FIX: Update renderContent to use new consolidated components and pass correct props
  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
      case 'appearance':
        return <SettingsProfile />;
      case 'security':
        return <SettingsSecurity />;
      case 'team':
      case 'roles':
        return <SettingsTeam users={users} setUsers={setUsers} currentUser={currentUser} onInviteUser={onInviteUser} rolePermissions={rolePermissions} setRolePermissions={setRolePermissions} />;
      case 'account':
      case 'billing':
      case 'ai-provider':
        return <SettingsWorkspace currentProvider={aiProvider} onProviderChange={setAiProvider} currentUser={currentUser} apiKeys={apiKeys} setApiKeys={setApiKeys} onLogout={onLogout} />;
      case 'notifications':
        return <NotificationsSettings />;
      default:
        return <SettingsProfile />;
    }
  };
  
  const filteredWorkspaceTabs = workspaceSettingsTabs.filter(tab => 
      !tab.adminOnly || (currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Super Admin'))
  );

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Settings</h1>
        <p className="mt-1 text-gray-600 dark:text-slate-400">Manage your account and workspace preferences.</p>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-1/4 lg:w-1/5">
          <nav className="flex flex-col space-y-4">
            <div>
              <h2 className="px-3 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider mb-2">User Settings</h2>
              <div className="space-y-1">
                {userSettingsTabs.map((tab) => (
                  <NavButton key={tab.id} tab={tab} isActive={activeTab === tab.id} onClick={setActiveTab} />
                ))}
              </div>
            </div>
             <div>
              <h2 className="px-3 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider mb-2">Workspace Settings</h2>
              <div className="space-y-1">
                {filteredWorkspaceTabs.map((tab) => (
                  <NavButton key={tab.id} tab={tab} isActive={activeTab === tab.id} onClick={setActiveTab} />
                ))}
              </div>
            </div>
          </nav>
        </aside>
        <main className="md:w-3/4 lg:w-4/5">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};
