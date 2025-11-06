import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { EmailInbox } from './components/EmailInbox';
import { Prospects } from './components/Prospects';
import { Campaigns } from './components/Campaigns';
import { Analytics } from './components/Analytics';
import { Integrations } from './components/Integrations';
import { Settings } from './components/Settings';
import { LeadGeneration } from './components/LeadGeneration';
import { Playbooks } from './components/Playbooks';
import { Products } from './components/Products';
import type { View, Prospect, ProspectList, User, Playbook, Template, Product, Deal } from './types';
import { initialProspects } from './data/prospects';
import { initialLists } from './data/lists';
import { initialUsers } from './data/users';
import { initialPlaybooks } from './data/playbooks';
import { templates as initialTemplates } from './data/templates';
import { initialProducts } from './data/products';
import { initialDeals } from './data/deals';

function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [prospects, setProspects] = useState<Prospect[]>(initialProspects);
  const [prospectLists, setProspectLists] = useState<ProspectList[]>(initialLists);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [playbooks, setPlaybooks] = useState<Playbook[]>(initialPlaybooks);
  const [templates] = useState<Template[]>(initialTemplates);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [connectedIntegrations, setConnectedIntegrations] = useState<Set<string>>(new Set(['salesforce', 'slack']));

  const handleAddProspects = (newProspects: Prospect[]) => {
    setProspects(prev => [...newProspects, ...prev]);
    setActiveView('prospects'); // Switch to prospects view after adding
  };

  const toggleIntegration = (integrationName: string, isConnected: boolean) => {
    setConnectedIntegrations(prev => {
        const newSet = new Set(prev);
        if (isConnected) {
            newSet.add(integrationName.toLowerCase());
        } else {
            newSet.delete(integrationName.toLowerCase());
        }
        return newSet;
    });
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'lead-generation':
        return <LeadGeneration onAddProspects={handleAddProspects} />;
      case 'prospects':
        return <Prospects 
                 prospects={prospects} 
                 setProspects={setProspects} 
                 prospectLists={prospectLists} 
                 setProspectLists={setProspectLists}
                 deals={deals}
                 setDeals={setDeals}
                 products={products}
                />;
      case 'campaigns':
        return <Campaigns prospects={prospects} connectedIntegrations={connectedIntegrations} prospectLists={prospectLists} />;
      case 'products':
        return <Products products={products} setProducts={setProducts} />;
      case 'email-inbox':
        return <EmailInbox />;
      case 'playbooks':
        return <Playbooks playbooks={playbooks} setPlaybooks={setPlaybooks} templates={templates} />;
      case 'analytics':
        return <Analytics />;
      case 'integrations':
        return <Integrations connectedIntegrations={connectedIntegrations} onToggleIntegration={toggleIntegration} />;
      case 'settings':
        return <Settings users={users} setUsers={setUsers} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeView={activeView} setActiveView={setActiveView}>
      {renderView()}
    </Layout>
  );
}

export default App;