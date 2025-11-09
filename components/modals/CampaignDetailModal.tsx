import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, Mail, Linkedin, Phone, Users, BarChart as BarChartIcon, Settings, ArrowRight, Clock, Trash2, Wand2, Loader2, Copy, ExternalLink, MessageSquare, Briefcase, GripVertical, Target, MousePointerClick, MessageSquareReply, Trophy, ChevronUp, ChevronDown } from 'lucide-react';
import type { Campaign, CampaignStep, Prospect, Template, ProspectList } from '../../types';
import { generatePersonalizedEmail } from '../../services/aiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CampaignDetailModalProps {
  onClose: () => void;
  onSave: (campaign: Campaign) => void;
  campaign: Campaign;
  prospects: Prospect[];
  templates: Template[];
  prospectLists: ProspectList[];
  connectedIntegrations: Set<string>;
}

const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
};

// Helper component for the drop zone between draggable items
const DropZone = ({ onDrop }: { onDrop: (e: React.DragEvent) => void }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    return (
        <div
            onDragEnter={(e) => {
                e.preventDefault();
                setIsDragOver(true);
            }}
            onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                onDrop(e);
                setIsDragOver(false);
            }}
            className={`w-full rounded-lg transition-all duration-200 ${
                isDragOver
                ? 'h-16 py-3 bg-blue-100 dark:bg-blue-900/50 border-2 border-dashed border-blue-400'
                : 'h-4 bg-transparent my-1'
            }`}
        >
            {isDragOver && (
                <div className="flex items-center justify-center h-full pointer-events-none">
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-300">Move step here</p>
                </div>
            )}
        </div>
    )
}

const MetricCard = ({ title, value, icon: Icon }: { title: string, value: string, icon: React.ElementType }) => (
    <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
        <div className="flex items-center">
            <div className="p-2 bg-white dark:bg-slate-600 rounded-md mr-4">
                <Icon className="h-6 w-6 text-blue-500" />
            </div>
            <div>
                <p className="text-sm text-gray-600 dark:text-slate-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{value}</p>
            </div>
        </div>
    </div>
);


const CampaignDetailModal: React.FC<CampaignDetailModalProps> = ({ onClose, onSave, campaign, prospects, templates, prospectLists, connectedIntegrations }) => {
    const [activeTab, setActiveTab] = useState<'steps' | 'prospects' | 'analytics' | 'settings'>('steps');
    const [editedCampaign, setEditedCampaign] = useState<Campaign>(campaign);
    
    // AI Personalization State
    const [personalizationState, setPersonalizationState] = useState<{ [stepId: string]: { prospectId?: string; isGenerating?: boolean; content?: string; sources?: any[] } }>({});

    const handleAddStep = (type: CampaignStep['type']) => {
        const newStep: CampaignStep = {
            id: `s${Date.now()}`,
            type,
            delayDays: 3,
            templateId: type === 'Email' && templates.length > 0 ? templates[0].id : undefined,
            message: type !== 'Email' ? `Your message for the ${type} step...` : undefined,
        };
        setEditedCampaign(prev => ({ ...prev, steps: [...prev.steps, newStep] }));
    };

    const handleUpdateStep = (stepId: string, updatedField: Partial<CampaignStep>) => {
        setEditedCampaign(prev => ({
            ...prev,
            steps: prev.steps.map(step => {
                if (step.id !== stepId) return step;
                
                const newStep = { ...step, ...updatedField };
                
                // When type changes, reset type-specific fields
                if (updatedField.type) {
                    if (updatedField.type === 'Email') {
                        newStep.message = undefined;
                        newStep.templateId = templates.length > 0 ? templates[0].id : undefined;
                    } else {
                        newStep.templateId = undefined;
                        newStep.message = `Your message for the ${updatedField.type} step...`;
                    }
                }
                return newStep;
            }),
        }));
    };
    
    const handleRemoveStep = (stepId: string) => {
        setEditedCampaign(prev => ({ ...prev, steps: prev.steps.filter(step => step.id !== stepId) }));
        setPersonalizationState(prev => {
            const newState = {...prev};
            delete newState[stepId];
            return newState;
        });
    };
    
    const handleSave = () => {
        onSave(editedCampaign);
    };
    
    const handleMoveStep = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= editedCampaign.steps.length) return;

        setEditedCampaign(prev => {
            const steps = [...prev.steps];
            const [movedItem] = steps.splice(index, 1);
            steps.splice(newIndex, 0, movedItem);
            return { ...prev, steps };
        });
    };

    // Drag and Drop Handlers
    const handleDragStart = (e: React.DragEvent, stepId: string) => {
        e.dataTransfer.setData('text/plain', stepId);
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        const draggedId = e.dataTransfer.getData('text/plain');
        if (!draggedId) return;

        setEditedCampaign(prev => {
            const steps = [...prev.steps];
            const draggedIndex = steps.findIndex(s => s.id === draggedId);
            if (draggedIndex === -1) return prev;
            
            const [removedItem] = steps.splice(draggedIndex, 1);
            
            let targetIndex = dropIndex;
            if (draggedIndex < dropIndex) {
                targetIndex = dropIndex - 1;
            }
            
            steps.splice(targetIndex, 0, removedItem);
    
            return { ...prev, steps };
        });
    };


    const handleGeneratePersonalization = async (stepId: string, templateId: string, prospectId: string, tone: string) => {
        const prospect = prospects.find(p => p.id === prospectId);
        const template = templates.find(t => t.id === templateId);

        if (!prospect || !template) return;

        setPersonalizationState(prev => ({ ...prev, [stepId]: { ...prev[stepId], isGenerating: true, content: undefined, sources: [] } }));

        try {
            const { body, sources } = await generatePersonalizedEmail(template, prospect, tone);
            setPersonalizationState(prev => ({ ...prev, [stepId]: { ...prev[stepId], isGenerating: false, content: body, sources: sources }}));
        } catch (error) {
            console.error(error);
            setPersonalizationState(prev => ({ ...prev, [stepId]: { ...prev[stepId], isGenerating: false, content: 'Error generating content.' }}));
        }
    };
    
    const isProspectInCampaign = (prospectId: string) => editedCampaign.prospectIds.includes(prospectId);

    const handleToggleProspect = (prospectId: string) => {
        setEditedCampaign(prev => {
            const newProspectIds = isProspectInCampaign(prospectId)
                ? prev.prospectIds.filter(id => id !== prospectId)
                : [...prev.prospectIds, prospectId];
            return { ...prev, prospectIds: newProspectIds };
        })
    };

    const isProspectListInCampaign = (listId: string) => editedCampaign.prospectListIds.includes(listId);

    const handleToggleProspectList = (listId: string) => {
        setEditedCampaign(prev => {
            const newListIds = isProspectListInCampaign(listId)
                ? prev.prospectListIds.filter(id => id !== listId)
                : [...prev.prospectListIds, listId];
            return { ...prev, prospectListIds: newListIds };
        });
    };

    const { totalProspects, campaignProspects, conversions } = useMemo(() => {
        const prospectIdsFromLists = editedCampaign.prospectListIds.flatMap(listId => {
            return prospectLists.find(l => l.id === listId)?.prospectIds || [];
        });
        const allIds = new Set([...editedCampaign.prospectIds, ...prospectIdsFromLists]);
        const campaignProspectsResult = prospects.filter(p => allIds.has(p.id));
        const conversionsResult = campaignProspectsResult.filter(p => p.status === 'Closed').length;
        
        return { 
            totalProspects: allIds.size, 
            campaignProspects: campaignProspectsResult,
            conversions: conversionsResult
        };
    }, [editedCampaign.prospectIds, editedCampaign.prospectListIds, prospectLists, prospects]);
    
    const analyticsData = {
        openRate: campaign.sent > 0 ? ((campaign.opens / campaign.sent) * 100).toFixed(1) : '0.0',
        clickRate: campaign.sent > 0 ? ((campaign.clicks / campaign.sent) * 100).toFixed(1) : '0.0',
        replyRate: campaign.sent > 0 ? ((campaign.replies / campaign.sent) * 100).toFixed(1) : '0.0',
        conversionRate: campaign.sent > 0 ? ((conversions / campaign.sent) * 100).toFixed(1) : '0.0',
        chartData: [
            { name: 'Sent', value: campaign.sent },
            { name: 'Opens', value: campaign.opens },
            { name: 'Clicks', value: campaign.clicks },
            { name: 'Replies', value: campaign.replies },
            { name: 'Conversions', value: conversions },
        ]
    };


    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const stepIcons: { [key in CampaignStep['type']]: React.ElementType } = { Email: Mail, LinkedIn: Linkedin, Call: Phone, Task: Briefcase, WhatsApp: MessageSquare };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col transform transition-all duration-300 ease-out" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between flex-shrink-0">
                    <input type="text" value={editedCampaign.name} onChange={(e) => setEditedCampaign(p => ({...p, name: e.target.value}))} className="text-lg font-semibold text-gray-900 dark:text-slate-100 bg-transparent border-none focus:ring-2 focus:ring-blue-500 rounded-md -ml-2 p-1"/>
                    <div className="flex items-center space-x-2">
                         <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm flex items-center"><Save className="h-4 w-4 mr-2" /> Save & Close</button>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="h-5 w-5" /></button>
                    </div>
                </div>
                <div className="flex-grow flex min-h-0">
                    <nav className="w-48 p-4 border-r border-gray-200 dark:border-slate-700 flex-shrink-0">
                        <ul className="space-y-1">
                            {[{ id: 'steps', name: 'Steps', icon: ArrowRight }, { id: 'prospects', name: 'Prospects', icon: Users }, { id: 'analytics', name: 'Analytics', icon: BarChartIcon }, { id: 'settings', name: 'Settings', icon: Settings }].map(item => (
                                <li key={item.id}><button onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === item.id ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}><item.icon className="h-5 w-5 mr-3" /> {item.name}</button></li>
                            ))}
                        </ul>
                    </nav>
                    <div className="flex-1 overflow-y-auto p-6">
                        {activeTab === 'steps' && (
                            <div>
                                {editedCampaign.steps.length > 0 && <DropZone onDrop={(e) => handleDrop(e, 0)} />}
                                {editedCampaign.steps.map((step, index) => {
                                    const StepIcon = stepIcons[step.type] || Mail;
                                    const currentPersonalization = personalizationState[step.id] || {};
                                    const assignedProspects = prospects.filter(p => editedCampaign.prospectIds.includes(p.id));

                                    return (
                                    <div key={step.id}>
                                        <div
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, step.id)}
                                            className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border dark:border-slate-700 flex items-start gap-4">
                                            <div className="flex flex-col items-center pt-1 cursor-grab active:cursor-grabbing">
                                                <GripVertical className="h-5 w-5 text-gray-400 dark:text-slate-500"/>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center border dark:border-slate-600"><StepIcon className="h-5 w-5 text-gray-600 dark:text-slate-300" /></div>
                                                <div className="text-xs mt-2 text-gray-500 dark:text-slate-400">Step {index + 1}</div>
                                            </div>
                                            <div className="flex-grow space-y-3">
                                                <div className="flex items-center gap-4 flex-wrap">
                                                    <select value={step.type} onChange={(e) => handleUpdateStep(step.id, { type: e.target.value as any})} className="py-1 pl-2 pr-8 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-blue-500 focus:border-blue-500">
                                                        <option>Email</option><option>LinkedIn</option><option>WhatsApp</option><option>Call</option><option>Task</option>
                                                    </select>
                                                    <div className="flex items-center">
                                                        <Clock className="h-4 w-4 mr-2 text-gray-500"/><span className="text-sm mr-1">Wait</span>
                                                        <input type="number" value={step.delayDays} onChange={(e) => handleUpdateStep(step.id, {delayDays: parseInt(e.target.value)})} min="0" className="w-16 p-1 text-center border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-blue-500 focus:border-blue-500"/>
                                                        <span className="text-sm ml-1">days</span>
                                                    </div>
                                                </div>
                                                {step.type === 'Email' && (
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Template:</label>
                                                            <select value={step.templateId} onChange={(e) => handleUpdateStep(step.id, { templateId: e.target.value })} className="mt-1 w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-blue-500 focus:border-blue-500">
                                                                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md space-y-2">
                                                            <h4 className="text-sm font-semibold flex items-center text-gray-800 dark:text-slate-200"><Wand2 className="h-4 w-4 mr-2 text-purple-500"/>AI Personalization</h4>
                                                            {assignedProspects.length > 0 ? (
                                                                <div className="flex items-center gap-2">
                                                                    <select value={currentPersonalization.prospectId || ''} onChange={(e) => setPersonalizationState(p => ({...p, [step.id]: {...p[step.id], prospectId: e.target.value}}))} className="flex-grow p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-blue-500 focus:border-blue-500">
                                                                        <option value="">Select prospect to preview...</option>
                                                                        {assignedProspects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                                    </select>
                                                                    <button onClick={() => handleGeneratePersonalization(step.id, step.templateId!, currentPersonalization.prospectId!, 'Professional')} disabled={!currentPersonalization.prospectId || currentPersonalization.isGenerating} className="px-3 py-2 bg-purple-600 text-white rounded-md text-sm font-semibold hover:bg-purple-700 transition-colors shadow-sm flex items-center disabled:opacity-50">
                                                                        {currentPersonalization.isGenerating ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Generate'}
                                                                    </button>
                                                                </div>
                                                            ) : <p className="text-xs text-gray-500 dark:text-slate-400">Add prospects to the campaign to enable personalization.</p>}
                                                            {currentPersonalization.isGenerating ? (<div className="text-center p-4 text-sm text-gray-500">Generating with Gemini...</div>) : currentPersonalization.content && (
                                                                <div className="prose prose-sm dark:prose-invert max-w-none p-3 bg-white dark:bg-slate-800 rounded-md border dark:border-slate-600" dangerouslySetInnerHTML={{ __html: currentPersonalization.content }}/>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                {(step.type === 'LinkedIn' || step.type === 'WhatsApp' || step.type === 'Call' || step.type === 'Task') && (
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">{step.type} Details:</label>
                                                        <textarea value={step.message} onChange={(e) => handleUpdateStep(step.id, { message: e.target.value })} rows={3} className="mt-1 w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
                                                        {step.type === 'LinkedIn' && (
                                                            <div className="mt-2">
                                                                {connectedIntegrations.has('linkedin') ? (
                                                                    <button onClick={() => {
                                                                        copyToClipboard(step.message || '');
                                                                        const prospect = prospects.find(p => p.id === assignedProspects[0]?.id); // Open first prospect's profile as example
                                                                        if (prospect?.linkedInUrl) window.open(prospect.linkedInUrl, '_blank');
                                                                        else alert('Message copied! No LinkedIn URL for first prospect.');
                                                                    }} className="inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-md text-blue-600 bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900">
                                                                        <Copy className="h-4 w-4 mr-2" /> Copy Message & Open Profile
                                                                    </button>
                                                                ) : (
                                                                    <button disabled title="Connect LinkedIn in Integrations to enable" className="inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-md text-gray-500 bg-gray-100 dark:bg-slate-700 cursor-not-allowed">
                                                                        <Copy className="h-4 w-4 mr-2" /> Copy Message & Open Profile
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-center space-y-1">
                                                <button
                                                    onClick={() => handleMoveStep(index, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1.5 rounded-md text-gray-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                                                    title="Move up"
                                                >
                                                    <ChevronUp className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleMoveStep(index, 'down')}
                                                    disabled={index === editedCampaign.steps.length - 1}
                                                    className="p-1.5 rounded-md text-gray-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                                                    title="Move down"
                                                >
                                                    <ChevronDown className="h-4 w-4" />
                                                </button>
                                                <div className="w-full h-px bg-slate-200 dark:bg-slate-600 my-1"></div>
                                                <button onClick={() => handleRemoveStep(step.id)} className="p-1.5 text-gray-500 hover:text-red-500 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/50" title="Remove step">
                                                    <Trash2 className="h-4 w-4"/>
                                                </button>
                                            </div>
                                        </div>
                                        <DropZone onDrop={(e) => handleDrop(e, index + 1)} />
                                    </div>
                                )})}
                                <div className="flex items-center justify-center gap-2 pt-4 border-t border-dashed dark:border-slate-700 flex-wrap">
                                    <button onClick={() => handleAddStep('Email')} className="px-3 py-1.5 text-sm bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center"><Mail className="h-4 w-4 mr-2"/>Add Email</button>
                                    <button onClick={() => handleAddStep('LinkedIn')} className="px-3 py-1.5 text-sm bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center"><Linkedin className="h-4 w-4 mr-2"/>Add LinkedIn</button>
                                    <button onClick={() => handleAddStep('WhatsApp')} className="px-3 py-1.5 text-sm bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center"><MessageSquare className="h-4 w-4 mr-2"/>Add WhatsApp</button>
                                    <button onClick={() => handleAddStep('Call')} className="px-3 py-1.5 text-sm bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center"><Phone className="h-4 w-4 mr-2"/>Add Call</button>
                                    <button onClick={() => handleAddStep('Task')} className="px-3 py-1.5 text-sm bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center"><Briefcase className="h-4 w-4 mr-2"/>Add Task</button>
                                </div>
                            </div>
                        )}
                        {activeTab === 'prospects' && (
                             <div>
                                <h3 className="text-lg font-semibold mb-2">Manage Prospects ({totalProspects})</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-medium mb-2 text-gray-800 dark:text-slate-200">Prospect Lists ({editedCampaign.prospectListIds.length} selected)</h4>
                                        <div className="max-h-[50vh] overflow-y-auto border dark:border-slate-700 rounded-lg p-2 space-y-1 bg-slate-50 dark:bg-slate-800/50">
                                            {prospectLists.map(list => (
                                                <div key={list.id} className="flex items-center p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50">
                                                    <input 
                                                        type="checkbox"
                                                        id={`list-${list.id}`}
                                                        checked={isProspectListInCampaign(list.id)}
                                                        onChange={() => handleToggleProspectList(list.id)}
                                                        className="h-4 w-4 mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <label htmlFor={`list-${list.id}`} className="flex-grow cursor-pointer">
                                                        <p className="font-medium text-sm text-gray-800 dark:text-slate-200">{list.name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-slate-400">{list.prospectIds.length} prospects</p>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2 text-gray-800 dark:text-slate-200">Individual Prospects ({editedCampaign.prospectIds.length} selected)</h4>
                                        <div className="max-h-[50vh] overflow-y-auto border dark:border-slate-700 rounded-lg">
                                            <table className="min-w-full divide-y dark:divide-slate-700">
                                                <thead className="bg-gray-50 dark:bg-slate-800/50 sticky top-0">
                                                  <tr>
                                                    <th className="p-2 w-10"></th>
                                                    <th className="p-2 text-left text-sm font-medium text-gray-600 dark:text-slate-300">Name</th>
                                                    <th className="p-2 text-left text-sm font-medium text-gray-600 dark:text-slate-300">Company</th>
                                                  </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-slate-800">
                                                    {prospects.map(p => (
                                                        <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                                          <td className="p-2">
                                                            <input type="checkbox" checked={isProspectInCampaign(p.id)} onChange={() => handleToggleProspect(p.id)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                                                          </td>
                                                          <td className="p-2 text-sm text-gray-800 dark:text-slate-200">{p.name}</td>
                                                          <td className="p-2 text-sm text-gray-600 dark:text-slate-400">{p.company}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        )}
                         {activeTab === 'analytics' && (
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Campaign Performance</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    <MetricCard title="Open Rate" value={`${analyticsData.openRate}%`} icon={Mail} />
                                    <MetricCard title="Click Rate" value={`${analyticsData.clickRate}%`} icon={MousePointerClick} />
                                    <MetricCard title="Reply Rate" value={`${analyticsData.replyRate}%`} icon={MessageSquareReply} />
                                    <MetricCard title="Conversion Rate" value={`${analyticsData.conversionRate}%`} icon={Trophy} />
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border dark:border-slate-700">
                                    <h4 className="font-semibold mb-4 text-gray-800 dark:text-slate-200">Funnel Overview</h4>
                                    {campaign.sent > 0 ? (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={analyticsData.chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(128, 128, 128, 0.2)" />
                                                <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                                <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '0.5rem'
                                                    }}
                                                    cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }}
                                                />
                                                <Bar dataKey="value" fill="#3b82f6" name="Count" barSize={30} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="text-center py-12 text-gray-500 dark:text-slate-400">
                                            <p>No emails sent yet for this campaign.</p>
                                            <p className="text-sm">Analytics will appear here once the campaign is active.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                         )}
                         {activeTab === 'settings' && <div className="text-center text-gray-500 p-8">Settings coming soon.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignDetailModal;
