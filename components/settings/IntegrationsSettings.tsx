import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { ExternalLink } from 'lucide-react';

const IntegrationCard = ({ name, description, icon }: { name: string, description: string, icon: string }) => (
    <div className="flex items-center space-x-4 rounded-lg border dark:border-slate-700 p-4">
        <img src={icon} alt={`${name} logo`} className="h-10 w-10" />
        <div className="flex-grow">
            <h4 className="font-semibold text-gray-900 dark:text-slate-100">{name}</h4>
            <p className="text-sm text-gray-500 dark:text-slate-400">{description}</p>
        </div>
        <button className="flex-shrink-0 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-1.5 px-3 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600">
            Connect
        </button>
    </div>
);

export const IntegrationsSettings: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
        <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center">
            Connect SalesPulse AI with your favorite tools. 
            <a href="#" className="ml-2 text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                Explore API Docs <ExternalLink className="h-3 w-3 ml-1" />
            </a>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <IntegrationCard 
            name="Slack"
            description="Send notifications and updates directly to your Slack channels."
            icon="https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg"
        />
        <IntegrationCard 
            name="Google Calendar"
            description="Sync your meetings and events with your Google Calendar."
            icon="https://cdn.worldvectorlogo.com/logos/google-calendar.svg"
        />
         <IntegrationCard 
            name="Zapier"
            description="Connect to thousands of other apps with Zapier automation."
            icon="https://cdn.worldvectorlogo.com/logos/zapier.svg"
        />
         <IntegrationCard 
            name="Salesforce"
            description="Sync your leads, contacts, and accounts with Salesforce."
            icon="https://cdn.worldvectorlogo.com/logos/salesforce-2.svg"
        />
      </CardContent>
    </Card>
  );
};