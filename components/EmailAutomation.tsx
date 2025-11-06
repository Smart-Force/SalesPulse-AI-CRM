import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { PlusCircle, Save, Trash2, Edit, ArrowRight, Mail, Bell, Clock, Power, PowerOff, X, ArrowDown } from 'lucide-react';
import type { ProspectStatus, Template } from '../types';
import { templates as initialTemplates } from '../data/templates';

// Define more complex automation structures
interface AutomationAction {
    id: string;
    type: 'send_email' | 'wait';
    // For 'send_email'
    templateId?: string;
    // For 'wait'
    days?: number;
}

interface AutomationWorkflow {
    id:string;
    name: string;
    isActive: boolean;
    trigger: {
        type: 'status_change';
        value: ProspectStatus;
    };
    actions: AutomationAction[];
}

const prospectStatuses: ProspectStatus[] = ['New', 'Contacted', 'Engaged', 'Meeting', 'Closed'];

const initialWorkflows: AutomationWorkflow[] = [
    {
        id: 'flow1',
        name: 'Onboard New Leads',
        isActive: true,
        trigger: { type: 'status_change', value: 'New' },
        actions: [
            { id: 'a1', type: 'send_email', templateId: 't1' },
            { id: 'a2', type: 'wait', days: 3 },
            { id: 'a3', type: 'send_email', templateId: 't2' },
        ]
    },
    {
        id: 'flow2',
        name: 'Confirm Booked Meetings',
        isActive: false,
        trigger: { type: 'status_change', value: 'Meeting' },
        actions: [
            { id: 'a4', type: 'send_email', templateId: 't3' }
        ]
    }
];


export const EmailAutomation: React.FC = () => {
    const [workflows, setWorkflows] = useState<AutomationWorkflow[]>(initialWorkflows);
    const [templates] = useState<Template[]>(initialTemplates);
    const [isEditing, setIsEditing] = useState(false);
    const [currentWorkflow, setCurrentWorkflow] = useState<Partial<AutomationWorkflow> | null>(null);

    const startEditing = (workflow: AutomationWorkflow) => {
        setCurrentWorkflow(JSON.parse(JSON.stringify(workflow))); // Deep copy to avoid mutation
        setIsEditing(true);
    };
    
    const startCreating = () => {
        setCurrentWorkflow({
            name: '',
            isActive: false,
            trigger: { type: 'status_change', value: 'New' },
            actions: [],
        });
        setIsEditing(true);
    };

    const handleSave = () => {
        if (!currentWorkflow?.name) {
            alert('Please provide a name for the workflow.');
            return;
        }

        if ((currentWorkflow as AutomationWorkflow).id) {
            setWorkflows(workflows.map(w => w.id === (currentWorkflow as AutomationWorkflow).id ? currentWorkflow as AutomationWorkflow : w));
        } else {
            const newWorkflow: AutomationWorkflow = {
                id: `flow${Date.now()}`,
                ...currentWorkflow,
            } as AutomationWorkflow;
            setWorkflows([...workflows, newWorkflow]);
        }
        
        setIsEditing(false);
        setCurrentWorkflow(null);
    };
    
    const cancelEditing = () => {
        setIsEditing(false);
        setCurrentWorkflow(null);
    };
    
    const handleDeleteWorkflow = (workflowId: string) => {
        if (window.confirm('Are you sure you want to delete this workflow?')) {
            setWorkflows(workflows.filter(w => w.id !== workflowId));
        }
    };
    
    const toggleWorkflowActive = (workflowId: string) => {
        setWorkflows(workflows.map(w => w.id === workflowId ? { ...w, isActive: !w.isActive } : w));
    };

    const updateAction = (actionId: string, newValues: Partial<AutomationAction>) => {
        if (!currentWorkflow || !currentWorkflow.actions) return;
        
        const updatedActions = currentWorkflow.actions.map(action => 
            action.id === actionId ? { ...action, ...newValues } : action
        );
        setCurrentWorkflow({ ...currentWorkflow, actions: updatedActions });
    };
    
    const addAction = (type: 'send_email' | 'wait') => {
        if (!currentWorkflow) return;
        const newAction: AutomationAction = {
            id: `a${Date.now()}`,
            type: type,
            templateId: type === 'send_email' ? templates[0]?.id : undefined,
            days: type === 'wait' ? 1 : undefined,
        };
        const actions = currentWorkflow.actions ? [...currentWorkflow.actions, newAction] : [newAction];
        setCurrentWorkflow({ ...currentWorkflow, actions });
    };

    const removeAction = (actionId: string) => {
        if (!currentWorkflow || !currentWorkflow.actions) return;
        setCurrentWorkflow({
            ...currentWorkflow,
            actions: currentWorkflow.actions.filter(a => a.id !== actionId)
        });
    };

    const renderWorkflowEditor = () => {
        if (!currentWorkflow) return null;

        return (
            <Card className="mb-8 border-blue-500 border-2">
                <CardHeader>
                    <CardTitle>{(currentWorkflow as AutomationWorkflow).id ? 'Edit Workflow' : 'Create New Workflow'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Workflow Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g., Follow up after demo"
                            value={currentWorkflow.name || ''}
                            onChange={(e) => setCurrentWorkflow({ ...currentWorkflow, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"
                        />
                    </div>
                    {/* Trigger */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <h3 className="text-md font-semibold text-gray-800 dark:text-slate-200 mb-2">Trigger</h3>
                        <div className="flex items-center gap-2">
                            <span className="p-2 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-md"><Bell className="h-5 w-5 text-gray-500"/></span>
                            <span className="text-sm">When a prospect's status changes to</span>
                             <select
                                value={currentWorkflow.trigger?.value || ''}
                                onChange={(e) => setCurrentWorkflow({ ...currentWorkflow, trigger: { type: 'status_change', value: e.target.value as ProspectStatus }})}
                                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"
                            >
                                {prospectStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                            </select>
                        </div>
                    </div>
                    {/* Actions */}
                     <div className="space-y-2">
                        <h3 className="text-md font-semibold text-gray-800 dark:text-slate-200">Sequence</h3>
                        {currentWorkflow.actions?.map((action, index) => (
                           <React.Fragment key={action.id}>
                            <div className="flex justify-center"><ArrowDown className="h-5 w-5 text-gray-400"/></div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center gap-4">
                               <div className="flex-shrink-0 text-sm font-bold text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-full h-8 w-8 flex items-center justify-center">{index + 1}</div>
                               {action.type === 'send_email' && (
                                   <div className="flex items-center gap-2 flex-grow">
                                       <Mail className="h-5 w-5 text-gray-500"/>
                                       <span className="text-sm">Send email template:</span>
                                       <select value={action.templateId} onChange={(e) => updateAction(action.id, {templateId: e.target.value})} className="flex-grow px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200">
                                            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                       </select>
                                   </div>
                               )}
                               {action.type === 'wait' && (
                                   <div className="flex items-center gap-2 flex-grow">
                                       <Clock className="h-5 w-5 text-gray-500"/>
                                       <span className="text-sm">Wait for</span>
                                       <input type="number" value={action.days} onChange={(e) => updateAction(action.id, {days: parseInt(e.target.value)})} min="1" className="w-20 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"/>
                                       <span className="text-sm">days</span>
                                   </div>
                               )}
                               <button onClick={() => removeAction(action.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="h-5 w-5"/></button>
                            </div>
                           </React.Fragment>
                        ))}
                        <div className="flex justify-center pt-2"><ArrowDown className="h-5 w-5 text-gray-400"/></div>
                        <div className="flex items-center gap-2 justify-center pt-2 border-t border-dashed dark:border-slate-700">
                            <button onClick={() => addAction('send_email')} className="px-3 py-1.5 text-sm bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center"><Mail className="h-4 w-4 mr-2"/>Add Email</button>
                            <button onClick={() => addAction('wait')} className="px-3 py-1.5 text-sm bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center"><Clock className="h-4 w-4 mr-2"/>Add Delay</button>
                        </div>
                    </div>
                    {/* Save/Cancel */}
                     <div className="flex justify-end gap-2 pt-4">
                        <button onClick={cancelEditing} className="px-4 py-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 border border-gray-300 dark:border-slate-600 rounded-md text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-600">Cancel</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 flex items-center"><Save className="h-4 w-4 mr-2"/>Save Workflow</button>
                    </div>
                </CardContent>
            </Card>
        )
    };

    const renderWorkflowCard = (workflow: AutomationWorkflow) => {
        const template = (templateId: string) => templates.find(t => t.id === templateId)?.name || 'Unknown Template';
        
        return (
            <Card key={workflow.id} className={`${workflow.isActive ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-base pr-2">{workflow.name}</CardTitle>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                            <button onClick={() => toggleWorkflowActive(workflow.id)} className={`p-1.5 rounded-full ${workflow.isActive ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'}`} title={workflow.isActive ? 'Deactivate' : 'Activate'}>
                                {workflow.isActive ? <Power className="h-4 w-4"/> : <PowerOff className="h-4 w-4"/>}
                            </button>
                            <button onClick={() => startEditing(workflow)} className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"><Edit className="h-4 w-4"/></button>
                            <button onClick={() => handleDeleteWorkflow(workflow.id)} className="p-1.5 text-gray-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500"><Trash2 className="h-4 w-4"/></button>
                        </div>
                    </div>
                     <p className={`text-sm font-semibold flex items-center ${workflow.isActive ? 'text-green-600' : 'text-gray-500 dark:text-slate-400'}`}>
                        {workflow.isActive ? 'Active' : 'Paused'}
                    </p>
                </CardHeader>
                <CardContent className="space-y-3">
                     <div className="flex items-center gap-3 p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                        <Bell className="h-5 w-5 text-gray-600 dark:text-slate-300 flex-shrink-0"/>
                        <p className="text-sm text-gray-800 dark:text-slate-200">
                           <b>Trigger:</b> Status changes to <span className="font-semibold text-blue-600 dark:text-blue-400">"{workflow.trigger.value}"</span>
                        </p>
                    </div>
                     <div className="text-sm text-gray-800 dark:text-slate-200 space-y-1">
                        <b>Sequence:</b>
                        <div className="pl-4 text-xs text-gray-600 dark:text-slate-400 flex flex-wrap items-center gap-y-1">
                           {workflow.actions.map((action, index) => (
                                <React.Fragment key={action.id}>
                                    <span className="flex items-center p-1 bg-slate-200 dark:bg-slate-600 rounded">
                                        {action.type === 'send_email' && <><Mail className="h-3 w-3 mr-1.5"/>{`Send "${template(action.templateId!)}"`}</>}
                                        {action.type === 'wait' && <><Clock className="h-3 w-3 mr-1.5"/>{`Wait for ${action.days} days`}</>}
                                    </span>
                                    {index < workflow.actions.length - 1 && <ArrowRight className="h-3 w-3 mx-1 text-gray-400 flex-shrink-0"/>}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Email Automation</h1>
                    <p className="mt-1 text-gray-600 dark:text-slate-400">Build automated sequences to engage prospects at the right time.</p>
                </div>
                {!isEditing && (
                    <button onClick={startCreating} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm">
                        <PlusCircle className="h-5 w-5 mr-2" />
                        New Workflow
                    </button>
                )}
            </div>

            {isEditing ? renderWorkflowEditor() : (
                 <div className="mt-8">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200 mb-4">Active Workflows ({workflows.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {workflows.map(renderWorkflowCard)}
                    </div>
                </div>
            )}
        </div>
    );
};
