import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AIGenerator } from './components/AIGenerator';
import { EmailInbox } from './components/EmailInbox';
import { Prospects } from './components/Prospects';
import { Campaigns } from './components/Campaigns';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { View, Prospect } from './types';
import { LeadGeneration } from './components/LeadGeneration';
import { initialProspects } from './data/prospects';
import { Integrations } from './components/Integrations';

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [prospects, setProspects] = useState<Prospect[]>(initialProspects);

  const handleAddProspects = (newProspects: Prospect[]) => {
      const existingEmails = new Set(prospects.map(p => p.email.toLowerCase()));
      const uniqueNewProspects = newProspects.filter(p => !existingEmails.has(p.email.toLowerCase()));
      
      if (uniqueNewProspects.length > 0) {
        setProspects(prev => [...uniqueNewProspects, ...prev]);
      }
      
      // Optionally, give feedback to the user about duplicates
      const duplicateCount = newProspects.length - uniqueNewProspects.length;
      if (duplicateCount > 0) {
        alert(`${duplicateCount} prospect(s) were skipped as they already exist.`);
      }

      setActiveView('prospects');
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
        return <Campaigns prospects={prospects} />;
      case 'ai-generator':
        return <AIGenerator />;
      case 'email-inbox':
        return <EmailInbox />;
      case 'analytics':
        return <Analytics />;
      case 'integrations':
        return <Integrations />;
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