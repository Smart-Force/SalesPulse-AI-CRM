import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { ExternalLink } from 'lucide-react';

const integrationsList = [
  { 
    name: "Salesforce",
    category: "CRM",
    description: "Sync contacts, leads, and accounts. Keep your CRM up-to-date with the latest prospect interactions and statuses from SalesPulse AI.",
    icon: "https://cdn.worldvectorlogo.com/logos/salesforce-2.svg",
  },
  { 
    name: "Slack",
    category: "Communication",
    description: "Receive real-time notifications for new leads, campaign replies, and important system alerts directly in your Slack channels.",
    icon: "https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg",
  },
  { 
    name: "Google Calendar",
    category: "Productivity",
    description: "Automatically sync meetings scheduled through SalesPulse AI with your Google Calendar to avoid double-booking.",
    icon: "https://cdn.worldvectorlogo.com/logos/google-calendar.svg",
  },
  {
    name: "LinkedIn",
    category: "Social Selling",
    description: "Streamline your outreach by connecting your LinkedIn account to copy messages and open profiles directly from campaigns.",
    icon: "https://cdn.worldvectorlogo.com/logos/linkedin-icon-2.svg"
  },
  { 
    name: "Zapier",
    category: "Automation",
    description: "Connect SalesPulse AI to thousands of other apps. Automate workflows and create custom integrations with no code.",
    icon: "https://cdn.worldvectorlogo.com/logos/zapier.svg",
  },
   { 
    name: "HubSpot",
    category: "CRM",
    description: "Seamlessly sync your HubSpot contacts and companies. Log activities and manage your pipeline across both platforms.",
    icon: "https://cdn.worldvectorlogo.com/logos/hubspot.svg",
  },
   { 
    name: "Outlook",
    category: "Email",
    description: "Integrate with your Outlook calendar and email for a unified view of your sales activities and communications.",
    icon: "https://cdn.worldvectorlogo.com/logos/microsoft-outlook-2013-2019.svg",
  },
];

interface IntegrationCardProps {
    name: string;
    category: string;
    description: string;
    icon: string;
    isConnected: boolean;
    onToggle: (name: string, shouldConnect: boolean) => void;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({ name, category, description, icon, isConnected, onToggle }) => (
    <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center space-x-4">
                <img src={icon} alt={`${name} logo`} className="h-10 w-10" />
                <div>
                    <CardTitle className="text-lg">{name}</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{category}</p>
                </div>
            </div>
             <button
                onClick={() => onToggle(name, !isConnected)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                    isConnected
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/10 dark:hover:text-red-400'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
             >
                {isConnected ? 'Disconnect' : 'Connect'}
            </button>
        </CardHeader>
        <CardContent className="flex-grow">
            <p className="text-sm text-gray-600 dark:text-slate-300">{description}</p>
        </CardContent>
    </Card>
);

interface IntegrationsProps {
    connectedIntegrations: Set<string>;
    onToggleIntegration: (name: string, isConnected: boolean) => void;
}

export const Integrations: React.FC<IntegrationsProps> = ({ connectedIntegrations, onToggleIntegration }) => {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Integrations</h1>
        <p className="mt-1 text-gray-600 dark:text-slate-400 flex items-center">
            Supercharge your workflow by connecting SalesPulse AI with your favorite tools.
            <a href="#" className="ml-3 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                Explore API Docs <ExternalLink className="h-4 w-4 ml-1" />
            </a>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrationsList.map(integration => (
            <IntegrationCard
                key={integration.name}
                {...integration}
                isConnected={connectedIntegrations.has(integration.name.toLowerCase())}
                onToggle={onToggleIntegration}
            />
        ))}
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-200">Can't find your integration?</h2>
        <p className="mt-2 text-gray-600 dark:text-slate-400">We're always adding new connections. Let us know what you'd like to see next!</p>
        <button className="mt-4 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-4 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600">
            Request an Integration
        </button>
      </div>
    </div>
  );
};