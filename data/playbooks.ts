import type { Playbook, ProspectStatus } from '../types';

export const initialPlaybooks: Playbook[] = [
    {
        id: 'playbook1',
        name: 'Welcome Sequence for New Leads',
        isActive: true,
        trigger: { type: 'prospect_status_change', value: 'New' },
        actions: [
            { 
                id: 'action1', 
                type: 'generate_and_send_ai_email', 
                goal: 'Send a warm welcome email. Introduce our company, reference their industry, and suggest a brief introductory call.',
                tone: 'Friendly and Professional',
                keyPoints: 'Mention our key value proposition of saving time on data analysis.'
            },
            { id: 'action2', type: 'wait', days: 3 },
            { id: 'action3', type: 'send_email_template', templateId: 't2' },
        ]
    },
    {
        id: 'playbook2',
        name: 'Meeting Follow-Up',
        isActive: false,
        trigger: { type: 'prospect_status_change', value: 'Meeting' },
        actions: [
            { id: 'action4', type: 'send_email_template', templateId: 't3' }
        ]
    }
];
