import type { Workflow } from '../types';

export const initialWorkflows: Workflow[] = [
  {
    id: 'wf1',
    name: 'New Lead Engagement Sequence',
    trigger: { type: 'statusChange', status: 'New' },
    steps: [
      { id: 'wfs1', action: { 
          type: 'sendAIEmail', 
          tone: 'Friendly',
          purpose: 'Introduce our AI-powered CRM and ask for a 15-minute discovery call to explore their needs.',
          keyPoints: 'Mention real-time insights and automated outreach as key benefits.'
      } },
      { id: 'wfs2', action: { type: 'wait', days: 2 } },
      { id: 'wfs3', action: { type: 'createTask', taskDescription: 'Connect with {{first_name}} on LinkedIn' } },
      { id: 'wfs4', action: { type: 'wait', days: 1 } },
      { id: 'wfs5', action: { type: 'sendTemplate', templateId: 't2' } },
    ],
  },
  {
    id: 'wf2',
    name: 'Post-Meeting Follow-up',
    trigger: { type: 'statusChange', status: 'Meeting' },
    steps: [
      { id: 'wfs6', action: { type: 'sendTemplate', templateId: 't3' } },
      { id: 'wfs7', action: { type: 'wait', days: 5 } },
      { id: 'wfs8', action: { type: 'createTask', taskDescription: 'Call {{first_name}} to discuss proposal' } },
    ],
  },
  {
    id: 'wf3',
    name: 'Initial Contact Automation',
    trigger: { type: 'statusChange', status: 'Contacted' },
    steps: [
      { id: 'wfs9', action: { type: 'sendTemplate', templateId: 't1' } }
    ],
  },
];