import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Zap, ExternalLink, Search, CheckCircle, Link } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'Communication' | 'CRM & Data' | 'Automation';
  isConnected: boolean;
}

const allIntegrations: Integration[] = [
  { id: 'slack', name: 'Slack', description: 'Send notifications and updates directly to your Slack channels.', icon: 'https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg', category: 'Communication', isConnected: true },
  { id: 'gcal', name: 'Google Calendar', description: 'Sync your meetings and events with your Google Calendar.', icon: 'https://cdn.worldvectorlogo.com/logos/google-calendar.svg', category: 'Communication', isConnected: true },
  { id: 'm365', name: 'Microsoft 365', description: 'Integrate with Outlook Calendar, Contacts, and Email.', icon: 'https://cdn.worldvectorlogo.com/logos/microsoft-365.svg', category: 'Communication', isConnected: false },
  { id: 'salesforce', name: 'Salesforce', description: 'Sync your leads, contacts, and accounts with Salesforce.', icon: 'https://cdn.worldvectorlogo.com/logos/salesforce-2.svg', category: 'CRM & Data', isConnected: false },
  { id: 'hubspot', name: 'HubSpot', description: 'Automatically sync contacts and deals with HubSpot CRM.', icon: 'https://cdn.worldvectorlogo.com/logos/hubspot.svg', category: 'CRM & Data', isConnected: false },
  { id: 'pipedrive', name: 'Pipedrive', description: 'Keep your Pipedrive deals and contacts up to date.', icon: 'https://cdn.worldvectorlogo.com/logos/pipedrive.svg', category: 'CRM & Data', isConnected: true },
  { id: 'zapier', name: 'Zapier', description: 'Connect to thousands of other apps with Zapier automation.', icon: 'https://cdn.worldvectorlogo.com/logos/zapier.svg', category: 'Automation', isConnected: false },
];

const IntegrationCard: React.FC<{ integration: Integration; onToggleConnect: (id: string) => void; }> = ({ integration, onToggleConnect }) => (
    <Card className="flex flex-col">
        <CardContent className="p-6 flex-grow">
            <div className="flex items-center space-x-4">
                <img src={integration.icon} alt={`${integration.name} logo`} className="h-12 w-12" />
                <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-slate-100">{integration.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{integration.description}</p>
                </div>
            </div>
        </CardContent>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex items-center justify-between">
            {integration.isConnected ? (
                <div className="flex items-center text-sm font-medium text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    Connected
                </div>
            ) : (
                <div className="flex items-center text-sm font-medium text-gray-500 dark:text-slate-400">
                    <Link className="h-4 w-4 mr-1.5" />
                    Not Connected
                </div>
            )}
            <button
                onClick={() => onToggleConnect(integration.id)}
                className={`flex-shrink-0 border rounded-md shadow-sm py-1.5 px-3 text-sm font-medium transition-colors ${
                    integration.isConnected
                        ? 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600'
                        : 'bg-blue-600 text-white border-transparent hover:bg-blue-700'
                }`}
            >
                {integration.isConnected ? 'Manage' : 'Connect'}
            </button>
        </div>
    </Card>
);


export const Integrations: React.FC = () => {
    const [integrations, setIntegrations] = useState<Integration[]>(allIntegrations);
    const [searchTerm, setSearchTerm] = useState('');

    const handleToggleConnect = (id: string) => {
        setIntegrations(prev =>
            prev.map(int =>
                int.id === id ? { ...int, isConnected: !int.isConnected } : int
            )
        );
    };

    const filteredIntegrations = integrations.filter(int =>
        int.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        int.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const categories = [...new Set(filteredIntegrations.map(i => i.category))].sort();


    return (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Integrations & API</h1>
                <p className="mt-1 text-gray-600 dark:text-slate-400 flex items-center">
                    Connect SalesPulse AI with your favorite tools to supercharge your workflow.
                    <a href="#" className="ml-2 text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                        Explore API Docs <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                </p>
            </div>
            
            <div className="mb-6 relative max-w-sm">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                 <input
                    type="text"
                    placeholder="Search integrations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {categories.map(category => (
                <div key={category} className="mb-10">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-200 mb-4">{category}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredIntegrations.filter(i => i.category === category).map(integration => (
                            <IntegrationCard
                                key={integration.id}
                                integration={integration}
                                onToggleConnect={handleToggleConnect}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};