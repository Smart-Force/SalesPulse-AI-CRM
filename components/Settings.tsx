import React, { useState } from 'react';
import { User as UserIcon, Lock, Settings as SettingsIcon, Palette, CreditCard, Bell, Users } from 'lucide-react';
import { ProfileSettings } from './settings/ProfileSettings';
import { AccountSettings } from './settings/AccountSettings';
import { SecuritySettings } from './settings/SecuritySettings';
import { AppearanceSettings } from './settings/AppearanceSettings';
import { BillingSettings } from './settings/BillingSettings';
import { NotificationsSettings } from './settings/NotificationsSettings';
import { TeamSettings } from './settings/TeamSettings';
import type { SettingsTab, User } from '../types';

interface SettingsProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const userSettingsTabs: { id: SettingsTab; name: string; icon: React.ElementType }[] = [
  { id: 'profile', name: 'Profile', icon: UserIcon },
  { id: 'security', name: 'Security', icon: Lock },
  { id: 'account', name: 'Account', icon: SettingsIcon },
];

const workspaceSettingsTabs: { id: SettingsTab; name: string; icon: React.ElementType }[] = [
  { id: 'team', name: 'Team', icon: Users },
  { id: 'appearance', name: 'Appearance', icon: Palette },
  { id: 'billing', name: 'Billing', icon: CreditCard },
  { id: 'notifications', name: 'Notifications', icon: Bell },
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

export const Settings: React.FC<SettingsProps> = ({ users, setUsers }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileSettings />;
      case 'security': return <SecuritySettings />;
      case 'account': return <AccountSettings />;
      case 'team': return <TeamSettings users={users} setUsers={setUsers} />;
      case 'appearance': return <AppearanceSettings />;
      case 'billing': return <BillingSettings />;
      case 'notifications': return <NotificationsSettings />;
      default: return <ProfileSettings />;
    }
  };
  
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
                {workspaceSettingsTabs.map((tab) => (
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