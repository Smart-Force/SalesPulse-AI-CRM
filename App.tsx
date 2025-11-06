import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AIGenerator } from './components/AIGenerator';
import { EmailInbox } from './components/EmailInbox';
import { Prospects } from './components/Prospects';
import { Campaigns } from './components/Campaigns';
import { Analytics } from './components/Analytics';
import { Integrations } from './components/Integrations';
import { Settings } from './components/Settings';
import { LeadGeneration } from './components/LeadGeneration';
import { EmailAutomation } from './components/EmailAutomation';
import type { View, Prospect } from './types';
import { initialProspects } from './data/prospects';

function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [prospects, setProspects] = useState<Prospect[]>(initialProspects);
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
        return <Prospects prospects={prospects} setProspects={setProspects} />;
      case 'campaigns':
        return <Campaigns prospects={prospects} connectedIntegrations={connectedIntegrations} />;
      case 'email-inbox':
        return <EmailInbox />;
      case 'email-automation':
        return <EmailAutomation />;
      case 'ai-generator':
        return <AIGenerator />;
      case 'analytics':
        return <Analytics />;
      case 'integrations':
        return <Integrations connectedIntegrations={connectedIntegrations} onToggleIntegration={toggleIntegration} />;
      case 'settings':
        return <Settings />;
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
