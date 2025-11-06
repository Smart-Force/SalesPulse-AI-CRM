import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { PlusCircle, Save, Trash2, Edit, ArrowRight, Mail, Bell, Clock, Power, PowerOff, X, ArrowDown, Wand2 } from 'lucide-react';
import type { ProspectStatus, Template, Playbook, PlaybookAction } from '../types';

interface PlaybooksProps {
    playbooks: Playbook[];
    setPlaybooks: React.Dispatch<React.SetStateAction<Playbook[]>>;
    templates: Template[];
}

const prospectStatuses: ProspectStatus[] = ['New', 'Contacted', 'Engaged', 'Meeting', 'Closed'];

export const Playbooks: React.FC<PlaybooksProps> = ({ playbooks, setPlaybooks, templates }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentPlaybook, setCurrentPlaybook] = useState<Partial<Playbook> | null>(null);

    const startEditing = (playbook: Playbook) => {
        setCurrentPlaybook(JSON.parse(JSON.stringify(playbook))); // Deep copy
        setIsEditing(true);
    };
    
    const startCreating = () => {
        setCurrentPlaybook({
            name: '',
            isActive: false,
            trigger: { type: 'prospect_status_change', value: 'New' },
            actions: [],
        });
        setIsEditing(true);
    };

    const handleSave = () => {
        if (!currentPlaybook?.name) {
            alert('Please provide a name for the playbook.');
            return;
        }

        if ((currentPlaybook as Playbook).id) {
            setPlaybooks(playbooks.map(w => w.id === (currentPlaybook as Playbook).id ? currentPlaybook as Playbook : w));
        } else {
            const newPlaybook: Playbook = {
                id: `playbook${Date.now()}`,
                ...currentPlaybook,
            } as Playbook;
            setPlaybooks([...playbooks, newPlaybook]);
        }
        
        setIsEditing(false);
        setCurrentPlaybook(null);
    };
    
    const cancelEditing = () => {
        setIsEditing(false);
        setCurrentPlaybook(null);
    };
    
    const handleDeletePlaybook = (playbookId: string) => {
        if (window.confirm('Are you sure you want to delete this playbook?')) {
            setPlaybooks(playbooks.filter(w => w.id !== playbookId));
        }
    };
    
    const togglePlaybookActive = (playbookId: string) => {
        setPlaybooks(playbooks.map(w => w.id === playbookId ? { ...w, isActive: !w.isActive } : w));
    };

    const updateAction = (actionId: string, newValues: Partial<PlaybookAction>) => {
        if (!currentPlaybook || !currentPlaybook.actions) return;
        
        const updatedActions = currentPlaybook.actions.map(action => 
            action.id === actionId ? { ...action, ...newValues } : action
        );
        setCurrentPlaybook({ ...currentPlaybook, actions: updatedActions });
    };
    
    const addAction = (type: PlaybookAction['type']) => {
        if (!currentPlaybook) return;
        const newAction: PlaybookAction = {
            id: `action${Date.now()}`,
            type: type,
            templateId: type === 'send_email_template' ? templates[0]?.id : undefined,
            days: type === 'wait' ? 1 : undefined,
            goal: type === 'generate_and_send_ai_email' ? 'Follow up on our last conversation.' : undefined,
            tone: type === 'generate_and_send_ai_email' ? 'Professional' : undefined,
            keyPoints: type === 'generate_and_send_ai_email' ? '' : undefined,
        };
        const actions = currentPlaybook.actions ? [...currentPlaybook.actions, newAction] : [newAction];
        setCurrentPlaybook({ ...currentPlaybook, actions });
    };

    const removeAction = (actionId: string) => {
        if (!currentPlaybook || !currentPlaybook.actions) return;
        setCurrentPlaybook({
            ...currentPlaybook,
            actions: currentPlaybook.actions.filter(a => a.id !== actionId)
        });
    };

    const renderPlaybookEditor = () => {
        if (!currentPlaybook) return null;

        return (
            <Card className="mb-8 border-blue-500 border-2">
                <CardHeader>
                    <CardTitle>{(currentPlaybook as Playbook).id ? 'Edit Playbook' : 'Create New Playbook'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Playbook Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g., Follow up after demo"
                            value={currentPlaybook.name || ''}
                            onChange={(e) => setCurrentPlaybook({ ...currentPlaybook, name: e.target.value })}
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
                                value={currentPlaybook.trigger?.value || ''}
                                onChange={(e) => setCurrentPlaybook({ ...currentPlaybook, trigger: { type: 'prospect_status_change', value: e.target.value as ProspectStatus }})}
                                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"
                            >
                                {prospectStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                            </select>
                        </div>
                    </div>
                    {/* Actions */}
                     <div className="space-y-2">
                        <h3 className="text-md font-semibold text-gray-800 dark:text-slate-200">Sequence</h3>
                        {currentPlaybook.actions?.map((action, index) => (
                           <React.Fragment key={action.id}>
                            <div className="flex justify-center"><ArrowDown className="h-5 w-5 text-gray-400"/></div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-start gap-4">
                               <div className="flex-shrink-0 text-sm font-bold text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-full h-8 w-8 flex items-center justify-center mt-1">{index + 1}</div>
                               <div className="flex-grow space-y-3">
                                   {action.type === 'generate_and_send_ai_email' && (
                                       <div className="space-y-2">
                                           <div className="flex items-center gap-2 font-semibold text-gray-800 dark:text-slate-200"><Wand2 className="h-5 w-5 text-purple-500"/>Generate & Send AI Email</div>
                                           <input type="text" value={action.goal} onChange={(e) => updateAction(action.id, {goal: e.target.value})} placeholder="Goal / Purpose of the email" className="w-full text-sm p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                                           <textarea value={action.keyPoints} onChange={(e) => updateAction(action.id, {keyPoints: e.target.value})} placeholder="Key points to include (optional)" rows={2} className="w-full text-sm p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                                           <select value={action.tone} onChange={(e) => updateAction(action.id, {tone: e.target.value})} className="w-full text-sm p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600">
                                                <option>Professional</option><option>Friendly</option><option>Casual</option><option>Formal</option><option>Urgent</option>
                                           </select>
                                       </div>
                                   )}
                                   {action.type === 'send_email_template' && (
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
                               </div>
                               <button onClick={() => removeAction(action.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="h-5 w-5"/></button>
                            </div>
                           </React.Fragment>
                        ))}
                        <div className="flex justify-center pt-2"><ArrowDown className="h-5 w-5 text-gray-400"/></div>
                        <div className="flex items-center gap-2 justify-center pt-2 border-t border-dashed dark:border-slate-700">
                            <button onClick={() => addAction('generate_and_send_ai_email')} className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-200 dark:border-purple-600 rounded-md hover:bg-purple-200 flex items-center font-semibold"><Wand2 className="h-4 w-4 mr-2"/>Add AI Email</button>
                            <button onClick={() => addAction('send_email_template')} className="px-3 py-1.5 text-sm bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center"><Mail className="h-4 w-4 mr-2"/>Add Template Email</button>
                            <button onClick={() => addAction('wait')} className="px-3 py-1.5 text-sm bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center"><Clock className="h-4 w-4 mr-2"/>Add Delay</button>
                        </div>
                    </div>
                    {/* Save/Cancel */}
                     <div className="flex justify-end gap-2 pt-4">
                        <button onClick={cancelEditing} className="px-4 py-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 border border-gray-300 dark:border-slate-600 rounded-md text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-600">Cancel</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 flex items-center"><Save className="h-4 w-4 mr-2"/>Save Playbook</button>
                    </div>
                </CardContent>
            </Card>
        )
    };

    const renderPlaybookCard = (playbook: Playbook) => {
        const template = (templateId: string) => templates.find(t => t.id === templateId)?.name || 'Unknown Template';
        
        return (
            <Card key={playbook.id} className={`${playbook.isActive ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-base pr-2">{playbook.name}</CardTitle>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                            <button onClick={() => togglePlaybookActive(playbook.id)} className={`p-1.5 rounded-full ${playbook.isActive ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'}`} title={playbook.isActive ? 'Deactivate' : 'Activate'}>
                                {playbook.isActive ? <Power className="h-4 w-4"/> : <PowerOff className="h-4 w-4"/>}
                            </button>
                            <button onClick={() => startEditing(playbook)} className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"><Edit className="h-4 w-4"/></button>
                            <button onClick={() => handleDeletePlaybook(playbook.id)} className="p-1.5 text-gray-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500"><Trash2 className="h-4 w-4"/></button>
                        </div>
                    </div>
                     <p className={`text-sm font-semibold flex items-center ${playbook.isActive ? 'text-green-600' : 'text-gray-500 dark:text-slate-400'}`}>
                        {playbook.isActive ? 'Active' : 'Paused'}
                    </p>
                </CardHeader>
                <CardContent className="space-y-3">
                     <div className="flex items-center gap-3 p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                        <Bell className="h-5 w-5 text-gray-600 dark:text-slate-300 flex-shrink-0"/>
                        <p className="text-sm text-gray-800 dark:text-slate-200">
                           <b>Trigger:</b> Status changes to <span className="font-semibold text-blue-600 dark:text-blue-400">"{playbook.trigger.value}"</span>
                        </p>
                    </div>
                     <div className="text-sm text-gray-800 dark:text-slate-200 space-y-1">
                        <b>Sequence:</b>
                        <div className="pl-4 text-xs text-gray-600 dark:text-slate-400 flex flex-wrap items-center gap-y-1">
                           {playbook.actions.map((action, index) => (
                                <React.Fragment key={action.id}>
                                    <span className={`flex items-center p-1 rounded ${action.type === 'generate_and_send_ai_email' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' : 'bg-slate-200 dark:bg-slate-600'}`}>
                                        {action.type === 'generate_and_send_ai_email' && <><Wand2 className="h-3 w-3 mr-1.5"/>AI Email</>}
                                        {action.type === 'send_email_template' && <><Mail className="h-3 w-3 mr-1.5"/>{`"${template(action.templateId!)}"`}</>}
                                        {action.type === 'wait' && <><Clock className="h-3 w-3 mr-1.5"/>{`${action.days} days`}</>}
                                    </span>
                                    {index < playbook.actions.length - 1 && <ArrowRight className="h-3 w-3 mx-1 text-gray-400 flex-shrink-0"/>}
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Playbooks</h1>
                    <p className="mt-1 text-gray-600 dark:text-slate-400">Build intelligent, automated sequences to engage prospects at the right time.</p>
                </div>
                {!isEditing && (
                    <button onClick={startCreating} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm">
                        <PlusCircle className="h-5 w-5 mr-2" />
                        New Playbook
                    </button>
                )}
            </div>

            {isEditing ? renderPlaybookEditor() : (
                 <div className="mt-8">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200 mb-4">Active Playbooks ({playbooks.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {playbooks.map(renderPlaybookCard)}
                    </div>
                </div>
            )}
        </div>
    );
};
