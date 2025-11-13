import React, { useState } from 'react';
import { User as UserIcon, Lock, Settings as SettingsIcon, Palette, CreditCard, Bell, Users, Bot, Shield, Award } from 'lucide-react';
import { SettingsProfile } from './settings/SettingsProfile';
import { SettingsSecurity } from './settings/SettingsSecurity';
import { SettingsTeam } from './settings/SettingsTeam';
import { SettingsWorkspace } from './settings/WorkspaceSettings';
import { SettingsCertificates } from './settings/SettingsCertificates';
import type { SettingsTab, User, AIProvider, UserRole, ApiKeys, RolePermissions, View, CertificateSettings } from '../types';
import { useHasPermission } from '../contexts/PermissionContext';

interface SettingsProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    aiProvider: AIProvider;
    setAiProvider: (provider: AIProvider) => void;
    currentUser: User;
    onInviteUser: (name: string, email: string, role: UserRole) => { success: boolean, message: string; };
    apiKeys: ApiKeys;
    setApiKeys: (keys: ApiKeys) => void;
    rolePermissions: RolePermissions;
    setRolePermissions: (permissions: RolePermissions) => void;
    certificateSettings: CertificateSettings;
    setCertificateSettings: (settings: CertificateSettings) => void;
    onLogout: () => void;
}

const userSettingsTabs: { id: SettingsTab; name: string; icon: React.ElementType }[] = [
  { id: 'profile', name: 'Profile & Appearance', icon: UserIcon },
  { id: 'security', name: 'Security', icon: Lock },
];

const workspaceSettingsTabs: { id: SettingsTab; name: string; icon: React.ElementType, requiredPermission: View }[] = [
  { id: 'team', name: 'Team & Roles', icon: Users, requiredPermission: 'Settings - Team' },
  { id: 'billing', name: 'Billing', icon: CreditCard, requiredPermission: 'Settings - Billing' },
  { id: 'ai-provider', name: 'AI Provider', icon: Bot, requiredPermission: 'Settings - AI Provider' },
  { id: 'certificates', name: 'Certificates', icon: Award, requiredPermission: 'Settings - Certificates' },
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

export const Settings: React.FC<SettingsProps> = (props) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <SettingsProfile />;
      case 'security':
        return <SettingsSecurity />;
      case 'team':
        return <SettingsTeam {...props} />;
      case 'billing':
      case 'ai-provider':
        return <SettingsWorkspace 
            currentProvider={props.aiProvider}
            onProviderChange={props.setAiProvider}
            currentUser={props.currentUser}
            apiKeys={props.apiKeys}
            setApiKeys={props.setApiKeys}
            onLogout={props.onLogout}
        />;
      case 'certificates':
        return <SettingsCertificates settings={props.certificateSettings} onSave={props.setCertificateSettings} />;
      default:
        return <SettingsProfile />;
    }
  };
  
  const FilteredWorkspaceNav = () => {
    const hasTeamAccess = useHasPermission('Settings - Team');
    const hasBillingAccess = useHasPermission('Settings - Billing');
    const hasAIAccess = useHasPermission('Settings - AI Provider');
    const hasCertificatesAccess = useHasPermission('Settings - Certificates');
    
    const visibleTabs = workspaceSettingsTabs.filter(tab => {
        if (tab.id === 'team') return hasTeamAccess;
        if (tab.id === 'billing') return hasBillingAccess;
        if (tab.id === 'ai-provider') return hasAIAccess;
        if (tab.id === 'certificates') return hasCertificatesAccess;
        return true;
    });

    if (visibleTabs.length === 0) return null;

    return (
        <div>
            <h2 className="px-3 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider mb-2">Workspace Settings</h2>
            <div className="space-y-1">
            {visibleTabs.map((tab) => (
                <NavButton key={tab.id} tab={tab} isActive={activeTab === tab.id} onClick={setActiveTab} />
            ))}
            </div>
        </div>
    );
  }


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
             <FilteredWorkspaceNav />
          </nav>
        </aside>
        <main className="md:w-3/4 lg:w-4/5">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};