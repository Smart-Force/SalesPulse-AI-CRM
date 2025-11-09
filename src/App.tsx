import React, { useState, useEffect, useMemo } from 'react';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { EmailInbox } from './components/EmailInbox';
import { Prospects } from './components/Prospects';
import { Campaigns } from './components/Campaigns';
import { Workflows } from './components/Workflows';
import { LeadGeneration } from './components/LeadGeneration';
import { Products } from './components/Products';
import { Analytics } from './components/Analytics';
import { LiveCall } from './components/LiveCall';
import { Integrations } from './components/Integrations';
import { Settings } from './components/Settings';
import { initialUsers } from './data/users';
import { initialProspects } from './data/prospects';
import { initialLists } from './data/lists';
import { initialDeals } from './data/deals';
import { initialProducts } from './data/products';
import { initialWorkflows } from './data/workflows';
import { initialRolePermissions } from './data/permissions';
import type { View, User, AIProvider, Prospect, ProspectList, Deal, Product, UserRole, Workflow, RolePermissions, ApiKeys } from './types';
import { useToasts } from './contexts/ToastContext';
import { PermissionContext } from './contexts/PermissionContext';
import { Playbooks } from './components/Playbooks';
import { AIGenerator } from './components/AIGenerator';


const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [activeView, setActiveView] = useState<View>('Dashboard');
    const { addToast } = useToasts();
    
    // Global data state
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [prospects, setProspects] = useState<Prospect[]>(initialProspects);
    const [prospectLists, setProspectLists] = useState<ProspectList[]>(initialLists);
    const [deals, setDeals] = useState<Deal[]>(initialDeals);
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
    
    const [connectedIntegrations, setConnectedIntegrations] = useState<Set<string>>(new Set(['salesforce']));
    const [aiProvider, setAiProvider] = useState<AIProvider>('gemini');
    const [apiKeys, setApiKeys] = useState<ApiKeys>({});
    const [rolePermissions, setRolePermissions] = useState<RolePermissions>(initialRolePermissions);

    const availableViews = useMemo(() => {
        if (!currentUser) return [];
        const userPermissions = rolePermissions[currentUser.role] || {};
        return Object.entries(userPermissions)
            .filter(([view, perms]) => perms?.view && !view.startsWith('Settings - '))
            .map(([view]) => view as View);
    }, [currentUser, rolePermissions]);

    useEffect(() => {
        const savedProvider = localStorage.getItem('aiProvider') as AIProvider;
        if (savedProvider) {
            setAiProvider(savedProvider);
        }
        try {
            const savedApiKeys = localStorage.getItem('apiKeys');
            if (savedApiKeys) {
                setApiKeys(JSON.parse(savedApiKeys));
            }
            const savedPermissions = localStorage.getItem('rolePermissions');
            if (savedPermissions) {
                setRolePermissions(JSON.parse(savedPermissions));
            }
        } catch (error) {
            console.error('Failed to parse from localStorage:', error);
        }
    }, []);

    const handleSetRolePermissions = (permissions: RolePermissions) => {
        setRolePermissions(permissions);
        localStorage.setItem('rolePermissions', JSON.stringify(permissions));
    };

    const handleSetAiProvider = (provider: AIProvider) => {
        localStorage.setItem('aiProvider', provider);
        setAiProvider(provider);
        addToast(`AI Provider switched to ${provider}`, 'info');
    };

    const handleSetApiKeys = (keys: ApiKeys) => {
        setApiKeys(keys);
        localStorage.setItem('apiKeys', JSON.stringify(keys));
        addToast('API Keys saved successfully!', 'success');
    };
    
    const handleLogin = (user: User) => {
        setCurrentUser(user);
        const userPermissions = rolePermissions[user.role] || {};
        if (!userPermissions[activeView]?.view) {
            setActiveView('Dashboard');
        }
    };

    const handleLogout = () => {
        setCurrentUser(null);
    };

    const handleToggleIntegration = (name: string, isConnected: boolean) => {
        setConnectedIntegrations(prev => {
            const newSet = new Set(prev);
            const lowercasedName = name.toLowerCase();
            if (isConnected) {
                newSet.add(lowercasedName);
            } else {
                newSet.delete(lowercasedName);
            }
            return newSet;
        });
        addToast(`${name} ${isConnected ? 'connected' : 'disconnected'}.`, 'success');
    };

    const handleAddProspects = (newProspects: Prospect[]) => {
        setProspects(prev => [...newProspects, ...prev]);
        setActiveView('Prospects');
        addToast(`${newProspects.length} new prospect(s) added!`, 'success');
    };

    const handleInviteUser = (name: string, email: string, role: UserRole): { success: boolean; message: string; } => {
        const newUser: User = {
            id: `user${Date.now()}`,
            name,
            email,
            role,
            avatarColor: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
            initials: name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
        };
        setUsers(prev => [...prev, newUser]);
        return { success: true, message: 'User invited successfully!' };
    };

    const renderView = () => {
        if (currentUser && !rolePermissions[currentUser.role]?.[activeView]?.view) {
             return <div className="p-8 text-center text-red-500">Access denied. You do not have permission to view the '{activeView}' page.</div>;
        }
        switch (activeView) {
            case 'Dashboard': return <Dashboard prospects={prospects} deals={deals} />;
            case 'Email Inbox': return <EmailInbox />;
            case 'Prospects': return <Prospects prospects={prospects} setProspects={setProspects} prospectLists={prospectLists} setProspectLists={setProspectLists} deals={deals} setDeals={setDeals} products={products} />;
            case 'Campaigns': return <Campaigns prospects={prospects} connectedIntegrations={connectedIntegrations} prospectLists={prospectLists} />;
            case 'Workflows': return <Workflows workflows={workflows} setWorkflows={setWorkflows} prospects={prospects} />;
            case 'Lead Generation': return <LeadGeneration onAddProspects={handleAddProspects} prospects={prospects} />;
            case 'Products': return <Products products={products} setProducts={setProducts} />;
            case 'Analytics': return <Analytics prospects={prospects} deals={deals} />;
            case 'Live Call': return <LiveCall prospects={prospects} setProspects={setProspects} />;
            case 'Integrations': return <Integrations connectedIntegrations={connectedIntegrations} onToggleIntegration={handleToggleIntegration} />;
            case 'Settings': return <Settings users={users} setUsers={setUsers} aiProvider={aiProvider} setAiProvider={handleSetAiProvider} currentUser={currentUser!} onInviteUser={handleInviteUser} apiKeys={apiKeys} setApiKeys={handleSetApiKeys} rolePermissions={rolePermissions} setRolePermissions={handleSetRolePermissions} onLogout={handleLogout} />;
            case 'Playbooks': return <Playbooks />;
            case 'AI Generator': return <AIGenerator />;
            default: return <Dashboard prospects={prospects} deals={deals} />;
        }
    };

    if (!currentUser) {
        return <Login users={users} onLogin={handleLogin} />;
    }

    return (
        <PermissionContext.Provider value={{ user: currentUser, permissions: rolePermissions }}>
            <Layout 
                activeView={activeView} 
                setActiveView={setActiveView} 
                currentUser={currentUser} 
                onLogout={handleLogout}
                availableViews={availableViews}
            >
                {renderView()}
            </Layout>
        </PermissionContext.Provider>
    );
};

export default App;