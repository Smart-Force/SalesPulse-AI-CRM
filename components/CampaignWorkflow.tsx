import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { UserPlus, Zap, Bot, Wand2, Rocket, MessageSquareReply } from 'lucide-react';

const workflowSteps = [
  {
    icon: UserPlus,
    title: '1. Prospect Import',
    description: 'Add prospects via integrations, CSV, or manually.',
  },
  {
    icon: Zap,
    title: '2. Auto-Enrichment',
    description: 'System automatically researches and enriches profiles.',
  },
  {
    icon: Bot,
    title: '3. AI Analysis',
    description: 'AI determines communication style & key pain points.',
  },
  {
    icon: Wand2,
    title: '4. Content Generation',
    description: 'AI personalizes templates using research insights.',
  },
  {
    icon: Rocket,
    title: '5. Automated Execution',
    description: 'System sends personalized outreach on your schedule.',
  },
  {
    icon: MessageSquareReply,
    title: '6. Response Handling',
    description: 'AI suggests replies and updates lead scores.',
  },
];

const WorkflowStep = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="flex flex-col items-center text-center p-2 relative z-10">
        <div className="flex-shrink-0 h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center border-4 border-slate-50 dark:border-slate-900">
            <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h4 className="mt-3 text-sm font-semibold text-gray-900 dark:text-slate-100">{title}</h4>
        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400 h-12">{description}</p>
    </div>
);

export const CampaignWorkflow: React.FC = () => {
  return (
    <Card className="mb-8 bg-slate-50 dark:bg-slate-900">
      <CardHeader>
        <CardTitle>The AI Personalization Workflow</CardTitle>
        <p className="text-sm text-gray-500 dark:text-slate-400">From raw lead to personalized outreach, fully automated.</p>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="relative">
            {/* Connecting line for desktop view */}
            <div className="hidden md:block absolute top-8 left-0 right-0 h-1 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
            {/* Vertical connecting line for mobile view */}
            <div className="md:hidden absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
            
            <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 md:gap-0">
              {workflowSteps.map((step) => (
                  <div key={step.title} className="flex-1">
                     <WorkflowStep icon={step.icon} title={step.title} description={step.description} />
                  </div>
              ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
};