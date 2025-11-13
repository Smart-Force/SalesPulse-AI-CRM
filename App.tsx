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
import { Playbooks } from './components/Playbooks';
import { TrainingCenter } from './components/TrainingCenter';
import { AIGenerator } from './components/AIGenerator';
import { initialUsers } from './data/users';
import { initialProspects } from './data/prospects';
import { initialLists } from './data/lists';
import { initialDeals } from './data/deals';
import { initialProducts } from './data/products';
import { initialWorkflows } from './data/workflows';
import { initialRolePermissions } from './data/permissions';
import { initialTrainingModules } from './data/training';
import { initialDiscussionThreads, initialStudyGroups } from './data/social';
import type { View, User, AIProvider, Prospect, ProspectList, Deal, Product, UserRole, Workflow, RolePermissions, ApiKeys, TrainingModule, CertificateSettings, DiscussionThread, StudyGroup } from './types';
import { useToasts } from './contexts/ToastContext';
import { PermissionContext } from './contexts/PermissionContext';

const initialCertificateSettings: CertificateSettings = {
    proctorName: 'Training Director',
    organizationName: 'SalesPulse AI Academy',
    issueDate: new Date().toISOString().split('T')[0],
    certificateId: `CERT-${new Date().getFullYear()}-001`,
    customMessage: "For demonstrating excellence in professional sales development.",
    includeSignature: true,
    logoUrl: null,
    logoPosition: 'top-right',
    logoSize: 'medium',
};

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
    const [trainingModules, setTrainingModules] = useState<TrainingModule[]>(initialTrainingModules);
    const [discussionThreads, setDiscussionThreads] = useState<DiscussionThread[]>(initialDiscussionThreads);
    const [studyGroups, setStudyGroups] = useState<StudyGroup[]>(initialStudyGroups);
    
    const [connectedIntegrations, setConnectedIntegrations] = useState<Set<string>>(new Set(['salesforce']));
    const [aiProvider, setAiProvider] = useState<AIProvider>('gemini');
    const [apiKeys, setApiKeys] = useState<ApiKeys>({});
    const [rolePermissions, setRolePermissions] = useState<RolePermissions>(initialRolePermissions);
    const [preselectedPlaybookId, setPreselectedPlaybookId] = useState<string | null>(null);
    const [certificateSettings, setCertificateSettings] = useState<CertificateSettings>(initialCertificateSettings);

    const availableViews = useMemo(() => {
        if (!currentUser) return [];
        const userPermissions = rolePermissions[currentUser.role] || {};
        // FIX: Use Object.keys and filter to correctly type the available views and avoid errors with Object.entries type inference.
        return (Object.keys(userPermissions) as View[])
            .filter(view => userPermissions[view]?.view);
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
            const savedCertSettings = localStorage.getItem('certificateSettings');
            if (savedCertSettings) {
                setCertificateSettings(JSON.parse(savedCertSettings));
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

    const handleSetCertificateSettings = (settings: CertificateSettings) => {
        setCertificateSettings(settings);
        localStorage.setItem('certificateSettings', JSON.stringify(settings));
    };
    
    const handleLogin = (user: User) => {
        setCurrentUser(user);
        const userPermissions = rolePermissions[user.role] || {};
        // FIX: Check for view permission on the permissions object directly, instead of using .includes on an object.
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

    const handleSelectPlaybook = (playbookId: string) => {
        setPreselectedPlaybookId(playbookId);
        setActiveView('Playbooks');
    };
    
    const handleUpdateUserTrainingProgress = (userId: string, resourceId: string) => {
        const updateUser = (user: User) => ({
            ...user,
            trainingProgress: {
                ...user.trainingProgress,
                [resourceId]: 'completed' as const
            }
        });

        setUsers(prevUsers => prevUsers.map(u => u.id === userId ? updateUser(u) : u));
        
        if (currentUser && currentUser.id === userId) {
            setCurrentUser(prevUser => prevUser ? updateUser(prevUser) : null);
        }
    };

    const renderView = () => {
        if (currentUser && !availableViews.includes(activeView)) {
             return <div className="p-8 text-center text-red-500">Access denied. You do not have permission to view the '{activeView}' page.</div>;
        }
        switch (activeView) {
            case 'Dashboard': return <Dashboard />;
            case 'Email Inbox': return <EmailInbox />;
            case 'Prospects': return <Prospects prospects={prospects} setProspects={setProspects} prospectLists={prospectLists} setProspectLists={setProspectLists} deals={deals} setDeals={setDeals} products={products} />;
            case 'Campaigns': return <Campaigns prospects={prospects} connectedIntegrations={connectedIntegrations} prospectLists={prospectLists} />;
            case 'Workflows': return <Workflows workflows={workflows} setWorkflows={setWorkflows} prospects={prospects} />;
            case 'Lead Generation': return <LeadGeneration onAddProspects={handleAddProspects} prospects={prospects} />;
            case 'Products': return <Products products={products} setProducts={setProducts} />;
            case 'Analytics': return <Analytics />;
            case 'Live Call': return <LiveCall prospects={prospects} setProspects={setProspects} />;
            case 'Integrations': return <Integrations connectedIntegrations={connectedIntegrations} onToggleIntegration={handleToggleIntegration} />;
            case 'Settings': return <Settings users={users} setUsers={setUsers} aiProvider={aiProvider} setAiProvider={handleSetAiProvider} currentUser={currentUser!} onInviteUser={handleInviteUser} apiKeys={apiKeys} setApiKeys={handleSetApiKeys} rolePermissions={rolePermissions} setRolePermissions={handleSetRolePermissions} onLogout={handleLogout} certificateSettings={certificateSettings} setCertificateSettings={handleSetCertificateSettings} />;
            case 'Playbooks': return <Playbooks />;
            case 'Training Center': return <TrainingCenter 
                onSelectPlaybook={handleSelectPlaybook} 
                currentUser={currentUser!} 
                trainingModules={trainingModules} 
                setTrainingModules={setTrainingModules} 
                onUpdateTrainingProgress={handleUpdateUserTrainingProgress} 
                users={users}
                setUsers={setUsers}
                discussionThreads={discussionThreads}
                setDiscussionThreads={setDiscussionThreads}
                studyGroups={studyGroups}
                setStudyGroups={setStudyGroups}
                certificateSettings={certificateSettings}
            />;
            case 'AI Generator': return <AIGenerator />;
            default: return <Dashboard />;
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
