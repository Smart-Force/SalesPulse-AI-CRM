import React, { useState, useMemo, useEffect } from 'react';
import { X, Users, List, Sparkles, Mail, Linkedin, MessageCircle, Plus, ChevronDown, Wand2, Loader2, Bot, Clock, Trash2, GripVertical, Search, PlusCircle, MinusCircle, Link as LinkIcon } from 'lucide-react';
import type { Campaign, Prospect, Template, CampaignStep } from '../../types';
import { generatePersonalizedEmail } from '../../services/geminiService';

interface CampaignDetailModalProps {
  onClose: () => void;
  onUpdateCampaign: (campaign: Campaign) => void;
  campaign: Campaign;
  allProspects: Prospect[];
  allTemplates: Template[];
}

type ModalTab = 'sequence' | 'prospects';

const TabButton = ({ label, icon: Icon, isActive, onClick }: { label: string; icon: React.ElementType, isActive: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors w-full ${isActive ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
        <Icon className="h-5 w-5" />
        <span>{label}</span>
    </button>
);

const stepIcons: { [key in CampaignStep['type']]: React.ElementType } = {
    Email: Mail,
    LinkedIn: Linkedin,
    WhatsApp: MessageCircle,
};

const StepCard: React.FC<{
    step: CampaignStep;
    stepNumber: number;
    allTemplates: Template[];
    onUpdateStep: (updatedStep: CampaignStep) => void;
    onDeleteStep: (stepId: string) => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
    campaignProspects: Prospect[];
}> = ({ step, stepNumber, allTemplates, onUpdateStep, onDeleteStep, isExpanded, onToggleExpand, campaignProspects }) => {
    
    const [tone, setTone] = useState('Professional & Respectful');
    const [previewProspectId, setPreviewProspectId] = useState<string | null>(campaignProspects[0]?.id || null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState('');
    const [generatedContentSources, setGeneratedContentSources] = useState<any[]>([]);
    
    const template = allTemplates.find(t => t.id === step.templateId);

    const handleGenerate = async () => {
        if (!template || !previewProspectId) return;
        const prospect = campaignProspects.find(p => p.id === previewProspectId);
        if (!prospect) return;

        setIsGenerating(true);
        setGeneratedContent('');
        setGeneratedContentSources([]);
        try {
            const { body, sources } = await generatePersonalizedEmail(template, prospect, tone);
            setGeneratedContent(body);
            setGeneratedContentSources(sources);
        } catch (error) {
            console.error(error);
            setGeneratedContent('<p class="text-red-500">An error occurred while generating content.</p>');
        } finally {
            setIsGenerating(false);
        }
    };

    const StepIcon = stepIcons[step.type];

    return (
        <div className="border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                    <StepIcon className="h-5 w-5 text-blue-500" />
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-slate-100">Step {stepNumber}: {step.type}</h4>
                        {step.type === 'Email' && (
                            <p className="text-sm text-gray-500 dark:text-slate-400">Template: "{template?.name || 'No template selected'}"</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={() => onDeleteStep(step.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
                        <Trash2 className="h-4 w-4" />
                    </button>
                    {step.type === 'Email' && (
                         <button onClick={onToggleExpand} className="px-3 py-1.5 text-sm font-medium rounded-md text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600">
                           {isExpanded ? 'Collapse' : 'Personalize'}
                        </button>
                    )}
                </div>
            </div>
            {step.type === 'Email' && (
                <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                     <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Select Email Template</label>
                     <select 
                        value={step.templateId} 
                        onChange={(e) => onUpdateStep({...step, templateId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"
                    >
                        <option value="">-- Choose a template --</option>
                        {allTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                     </select>
                </div>
            )}
            {isExpanded && step.type === 'Email' && template && (
                <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* AI Engine */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center text-gray-900 dark:text-slate-100"><Sparkles className="h-5 w-5 mr-2 text-purple-500"/>AI Personalization Engine</h3>
                            <div>
                                <label htmlFor={`preview-prospect-${step.id}`} className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Preview for Prospect</label>
                                <select id={`preview-prospect-${step.id}`} value={previewProspectId || ''} onChange={(e) => setPreviewProspectId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200">
                                    {campaignProspects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor={`tone-${step.id}`} className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Tone of Voice</label>
                                <select id={`tone-${step.id}`} value={tone} onChange={(e) => setTone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200">
                                    <option>Strategic & Formal</option>
                                    <option>Collaborative & Informal</option>
                                    <option>Direct & ROI-Focused</option>
                                    <option>Friendly & Inquisitive</option>
                                </select>
                            </div>
                            <button onClick={handleGenerate} disabled={isGenerating || !previewProspectId} className="w-full inline-flex justify-center items-center bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                                {isGenerating ? 'Generating...' : 'Generate Personalized Content'}
                            </button>
                        </div>

                        {/* Preview Area */}
                        <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg min-h-[250px]">
                            <h4 className="text-md font-medium text-gray-900 dark:text-slate-100 mb-2">AI-Generated Preview</h4>
                            <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-white dark:bg-slate-800 rounded-md h-full overflow-y-auto">
                                {isGenerating ? (
                                    <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-slate-400">
                                        <Bot className="mx-auto h-8 w-8 animate-bounce text-purple-500" />
                                        <p className="mt-2">AI is crafting the perfect message...</p>
                                    </div>
                                ) : (
                                    generatedContent ? <div dangerouslySetInnerHTML={{ __html: generatedContent }} /> : <p className="text-gray-400 dark:text-slate-500">Your personalized content will appear here.</p>
                                )}
                            </div>
                            {generatedContentSources.length > 0 && (
                                <div className="mt-2">
                                    <h5 className="text-xs font-semibold text-gray-600 dark:text-slate-400 flex items-center"><LinkIcon className="h-3 w-3 mr-1" />Sources:</h5>
                                    <ul className="list-disc list-inside text-xs space-y-0.5 mt-1">
                                        {generatedContentSources.map((source, i) => source.web && (
                                            <li key={i} className="truncate">
                                                <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{source.web.title}</a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DelayIndicator: React.FC<{ days: number; onUpdateDelay: (days: number) => void }> = ({ days, onUpdateDelay }) => (
    <div className="flex justify-center items-center relative h-16">
        {/* Vertical line */}
        <div className="w-px h-full bg-gray-300 dark:bg-slate-600 absolute"></div>
        
        {/* Editable delay badge */}
        <div className="relative z-10 flex items-center space-x-2 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-full border border-gray-300 dark:border-slate-600 shadow-sm">
            <Clock className="h-4 w-4 text-gray-500 dark:text-slate-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Wait</span>
            <input 
                type="number" 
                value={days} 
                onChange={(e) => onUpdateDelay(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-12 text-center bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-500 rounded-md py-0.5 text-sm font-semibold text-blue-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">days</span>
        </div>
    </div>
);


const CampaignDetailModal: React.FC<CampaignDetailModalProps> = ({ onClose, campaign: initialCampaign, allProspects, allTemplates, onUpdateCampaign }) => {
    const [campaign, setCampaign] = useState<Campaign>(initialCampaign);
    const [activeTab, setActiveTab] = useState<ModalTab>('sequence');
    const [showAddStepMenu, setShowAddStepMenu] = useState(false);
    const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
    const [inCampaignSearch, setInCampaignSearch] = useState('');
    const [availableSearch, setAvailableSearch] = useState('');
    
    useEffect(() => {
        setCampaign(initialCampaign);
    }, [initialCampaign]);

    const campaignProspects = useMemo(() => {
        return allProspects.filter(p => campaign.prospectIds.includes(p.id));
    }, [campaign.prospectIds, allProspects]);

    const availableProspects = useMemo(() => {
        const campaignProspectIds = new Set(campaign.prospectIds);
        return allProspects.filter(p => !campaignProspectIds.has(p.id));
    }, [campaign.prospectIds, allProspects]);

    const filteredCampaignProspects = useMemo(() => {
        if (!inCampaignSearch) return campaignProspects;
        const lowercasedFilter = inCampaignSearch.toLowerCase();
        return campaignProspects.filter(p => p.name.toLowerCase().includes(lowercasedFilter) || p.company.toLowerCase().includes(lowercasedFilter));
    }, [campaignProspects, inCampaignSearch]);

    const filteredAvailableProspects = useMemo(() => {
        if (!availableSearch) return availableProspects;
        const lowercasedFilter = availableSearch.toLowerCase();
        return availableProspects.filter(p => p.name.toLowerCase().includes(lowercasedFilter) || p.company.toLowerCase().includes(lowercasedFilter));
    }, [availableProspects, availableSearch]);

    const handleAddProspect = (prospectId: string) => {
        if (!campaign.prospectIds.includes(prospectId)) {
            setCampaign(prev => ({...prev, prospectIds: [...prev.prospectIds, prospectId]}));
        }
    };

    const handleRemoveProspect = (prospectId: string) => {
        setCampaign(prev => ({...prev, prospectIds: prev.prospectIds.filter(id => id !== prospectId)}));
    };

    const handleAddStep = (type: CampaignStep['type']) => {
        const newStep: CampaignStep = {
            id: crypto.randomUUID(),
            type,
            templateId: '',
            delayDays: 3,
        };
        setCampaign(prev => ({...prev, steps: [...prev.steps, newStep]}));
        setShowAddStepMenu(false);
    };

    const handleUpdateStep = (updatedStep: CampaignStep) => {
        setCampaign(prev => ({...prev, steps: prev.steps.map(s => s.id === updatedStep.id ? updatedStep : s)}));
    };

    const handleDeleteStep = (stepId: string) => {
        if (window.confirm('Are you sure you want to delete this step?')) {
            setCampaign(prev => ({...prev, steps: prev.steps.filter(s => s.id !== stepId)}));
        }
    };

    const handleSave = () => {
        onUpdateCampaign(campaign);
        onClose();
    };

    const ProspectList: React.FC<{
        title: string;
        prospects: Prospect[];
        searchTerm: string;
        onSearchChange: (value: string) => void;
        onAction: (prospectId: string) => void;
        actionIcon: React.ElementType;
        actionColor: string;
    }> = ({ title, prospects, searchTerm, onSearchChange, onAction, actionIcon: ActionIcon, actionColor }) => (
        <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-900/50 rounded-lg p-4">
            <h3 className="text-md font-semibold text-gray-800 dark:text-slate-200 mb-3">{title} ({prospects.length})</h3>
            <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search prospects..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm bg-white dark:bg-slate-700 text-sm text-gray-900 dark:text-slate-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-slate-700 overflow-y-auto flex-grow -mx-4 px-4">
                {prospects.length > 0 ? prospects.map(prospect => (
                    <li key={prospect.id} className="py-2 flex items-center justify-between">
                        <div className="flex items-center min-w-0">
                            <div className="h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center text-white font-semibold text-xs" style={{ backgroundColor: prospect.avatarColor }}>
                                {prospect.initials}
                            </div>
                            <div className="ml-3 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{prospect.name}</p>
                                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{prospect.company}</p>
                            </div>
                        </div>
                        <button onClick={() => onAction(prospect.id)} className={`p-1.5 rounded-full ${actionColor} transition-colors flex-shrink-0 ml-2`}>
                            <ActionIcon className="h-4 w-4 text-white" />
                        </button>
                    </li>
                )) : (
                    <div className="text-center py-8 text-sm text-gray-500 dark:text-slate-400">No prospects found.</div>
                )}
            </ul>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col transform transition-all duration-300 ease-out"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{campaign.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Campaign Editor</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex flex-grow min-h-0">
                    {/* Sidebar */}
                    <div className="w-64 p-4 border-r border-gray-200 dark:border-slate-700 flex-shrink-0 bg-slate-50 dark:bg-slate-800/50">
                        <div className="space-y-2">
                           <TabButton label="Sequence" icon={List} isActive={activeTab === 'sequence'} onClick={() => setActiveTab('sequence')} />
                           <TabButton label="Prospects" icon={Users} isActive={activeTab === 'prospects'} onClick={() => setActiveTab('prospects')} />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-grow p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
                        {activeTab === 'sequence' && (
                            <div className="max-w-3xl mx-auto">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200 mb-6">Campaign Sequence</h2>
                                
                                <div>
                                    {campaign.steps.map((step, index) => (
                                        <React.Fragment key={step.id}>
                                            {index > 0 && <DelayIndicator days={step.delayDays} onUpdateDelay={(days) => handleUpdateStep({...step, delayDays: days})} />}
                                            <StepCard 
                                                step={step} 
                                                stepNumber={index + 1}
                                                allTemplates={allTemplates}
                                                onUpdateStep={handleUpdateStep}
                                                onDeleteStep={handleDeleteStep}
                                                isExpanded={expandedStepId === step.id}
                                                onToggleExpand={() => setExpandedStepId(prev => prev === step.id ? null : step.id)}
                                                campaignProspects={campaignProspects}
                                            />
                                        </React.Fragment>
                                    ))}
                                </div>
                                
                                <div className="relative mt-6 flex justify-center">
                                    <button onClick={() => setShowAddStepMenu(true)} className="bg-white dark:bg-slate-700 border-2 border-dashed border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-400 font-semibold py-2 px-4 rounded-lg hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center shadow-sm text-sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Step
                                    </button>
                                    {showAddStepMenu && (
                                        <div 
                                            onMouseLeave={() => setShowAddStepMenu(false)}
                                            className="absolute bottom-full mb-2 w-48 bg-white dark:bg-slate-700 rounded-md shadow-lg border dark:border-slate-600 z-10 py-1"
                                        >
                                            <button onClick={() => handleAddStep('Email')} className="w-full text-left flex items-center px-3 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600"><Mail className="h-4 w-4 mr-2 text-blue-500"/>Email</button>
                                            <button onClick={() => handleAddStep('LinkedIn')} className="w-full text-left flex items-center px-3 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600"><Linkedin className="h-4 w-4 mr-2 text-sky-600"/>LinkedIn Message</button>
                                            <button onClick={() => handleAddStep('WhatsApp')} className="w-full text-left flex items-center px-3 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600"><MessageCircle className="h-4 w-4 mr-2 text-green-500"/>WhatsApp</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {activeTab === 'prospects' && (
                             <div className="h-full flex flex-col">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200 mb-4 flex-shrink-0">Manage Campaign Prospects</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow min-h-0">
                                    <ProspectList
                                        title="Prospects in Campaign"
                                        prospects={filteredCampaignProspects}
                                        searchTerm={inCampaignSearch}
                                        onSearchChange={setInCampaignSearch}
                                        onAction={handleRemoveProspect}
                                        actionIcon={MinusCircle}
                                        actionColor="bg-red-500 hover:bg-red-600"
                                    />
                                    <ProspectList
                                        title="Available Prospects"
                                        prospects={filteredAvailableProspects}
                                        searchTerm={availableSearch}
                                        onSearchChange={setAvailableSearch}
                                        onAction={handleAddProspect}
                                        actionIcon={PlusCircle}
                                        actionColor="bg-green-500 hover:bg-green-600"
                                    />
                                </div>
                             </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex justify-end items-center space-x-3 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 border border-gray-300 dark:border-slate-600 rounded-md text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors">
                        Cancel
                    </button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                        Save Campaign
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CampaignDetailModal;