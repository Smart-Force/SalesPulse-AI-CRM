import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { PlusCircle, Target, Mail, Send, BarChart2, Edit, Trash2, Search, FileText } from 'lucide-react';
import type { Campaign, Prospect, Template, ProspectList } from '../types';
import { CampaignWorkflow } from './CampaignWorkflow';
import CreateCampaignModal from './modals/CreateCampaignModal';
import CampaignDetailModal from './modals/CampaignDetailModal';
import TemplateEditorModal from './modals/TemplateEditorModal';
import { templates as initialTemplates } from '../data/templates';

const initialCampaigns: Campaign[] = [
  { id: 'c1', name: 'Q3 Product Launch', status: 'Active', sent: 1500, opens: 980, clicks: 250, replies: 45, createdDate: 'June 15, 2024', steps: [
    { id: 's1', type: 'Email', templateId: 't1', delayDays: 0 },
    { id: 's2', type: 'Email', templateId: 't2', delayDays: 3 },
    { id: 's3', type: 'LinkedIn', message: 'Hi {{first_name}}, following up on my email. Would love to connect and share some insights on how we help companies like {{company}} with {{specific_pain_point}}.', delayDays: 2 },
  ], prospectIds: ['1', '2'], prospectListIds: ['list2'] },
  { id: 'c2', name: 'Re-engagement Campaign', status: 'Draft', sent: 0, opens: 0, clicks: 0, replies: 0, createdDate: 'July 20, 2024', steps: [
     { id: 's4', type: 'Email', templateId: 't3', delayDays: 0 },
  ], prospectIds: [], prospectListIds: [] },
  { id: 'c3', name: 'Webinar Follow-up', status: 'Completed', sent: 500, opens: 450, clicks: 150, replies: 80, createdDate: 'May 01, 2024', steps: [], prospectIds: [], prospectListIds: [] },
];

interface CampaignsProps {
    prospects: Prospect[];
    connectedIntegrations: Set<string>;
    prospectLists: ProspectList[];
}

export const Campaigns: React.FC<CampaignsProps> = ({ prospects, connectedIntegrations, prospectLists }) => {
    const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
    const [templates, setTemplates] = useState<Template[]>(initialTemplates);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [viewingCampaign, setViewingCampaign] = useState<Campaign | null>(null);
    const [isTemplateEditorOpen, setTemplateEditorOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCampaigns = campaigns.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateCampaign = (campaignName: string) => {
        const newCampaign: Campaign = {
            id: `c${Date.now()}`,
            name: campaignName,
            status: 'Draft',
            sent: 0, opens: 0, clicks: 0, replies: 0,
            createdDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            steps: [], prospectIds: [], prospectListIds: [],
        };
        setCampaigns(prev => [newCampaign, ...prev]);
        setCreateModalOpen(false);
    };

    const handleSaveCampaign = (updatedCampaign: Campaign) => {
        setCampaigns(prev => prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c));
        setViewingCampaign(null);
    };

    const handleDeleteCampaign = (campaignId: string) => {
        if (window.confirm('Are you sure you want to delete this campaign?')) {
            setCampaigns(prev => prev.filter(c => c.id !== campaignId));
        }
    };
    
    const handleSaveTemplate = (templateData: Omit<Template, 'id'> & { id?: string }) => {
        if (templateData.id) {
            setTemplates(prev => prev.map(t => t.id === templateData.id ? { ...t, ...templateData } : t));
        } else {
            const newTemplate: Template = { ...templateData, id: `t${Date.now()}` };
            setTemplates(prev => [...prev, newTemplate]);
        }
        setTemplateEditorOpen(false);
        setEditingTemplate(null);
    };

    const handleDeleteTemplate = (templateId: string) => {
        if (window.confirm('Are you sure you want to delete this template? It may be used in active campaigns.')) {
            setTemplates(prev => prev.filter(t => t.id !== templateId));
        }
    };

    const openTemplateEditor = (template: Template | null) => {
        setEditingTemplate(template);
        setTemplateEditorOpen(true);
    };

    return (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {isCreateModalOpen && <CreateCampaignModal onCreateCampaign={handleCreateCampaign} onClose={() => setCreateModalOpen(false)} />}
            {viewingCampaign && <CampaignDetailModal campaign={viewingCampaign} prospects={prospects} templates={templates} onSave={handleSaveCampaign} onClose={() => setViewingCampaign(null)} connectedIntegrations={connectedIntegrations} prospectLists={prospectLists} />}
            {isTemplateEditorOpen && <TemplateEditorModal onSave={handleSaveTemplate} onClose={() => {setTemplateEditorOpen(false); setEditingTemplate(null);}} templateToEdit={editingTemplate} />}

            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Campaigns</h1>
                    <p className="mt-1 text-gray-600 dark:text-slate-400">Design, automate, and analyze your outreach sequences.</p>
                </div>
                <button onClick={() => setCreateModalOpen(true)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm">
                    <PlusCircle className="h-5 w-5 mr-2" />
                    New Campaign
                </button>
            </div>

            <CampaignWorkflow />
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <Card className="xl:col-span-2">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <CardTitle>All Campaigns ({filteredCampaigns.length})</CardTitle>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text" placeholder="Search campaigns..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                                <thead className="bg-gray-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Campaign Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Performance</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Created</th>
                                        <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                    {filteredCampaigns.map((campaign) => (
                                        <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-slate-100">{campaign.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-slate-400">{campaign.steps.length} steps</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${campaign.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : campaign.status === 'Draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                                                    {campaign.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                                                <div className="flex items-center space-x-4">
                                                    <div title="Sent"><Send className="inline h-4 w-4 mr-1 text-gray-400"/>{campaign.sent}</div>
                                                    <div title="Opens"><Mail className="inline h-4 w-4 mr-1 text-gray-400"/>{campaign.sent > 0 ? ((campaign.opens / campaign.sent) * 100).toFixed(1) + '%' : '0%'}</div>
                                                    <div title="Clicks"><Target className="inline h-4 w-4 mr-1 text-gray-400"/>{campaign.sent > 0 ? ((campaign.clicks / campaign.sent) * 100).toFixed(1) + '%' : '0%'}</div>
                                                    <div title="Replies"><BarChart2 className="inline h-4 w-4 mr-1 text-gray-400"/>{campaign.replies}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{campaign.createdDate}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => setViewingCampaign(campaign)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4">View / Edit</button>
                                                <button onClick={() => handleDeleteCampaign(campaign.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle>Email Templates</CardTitle>
                        <button onClick={() => openTemplateEditor(null)} className="bg-blue-600 text-white font-semibold py-1.5 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm text-sm">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            New Template
                        </button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                           {templates.map(template => (
                               <div key={template.id} className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-700 flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-sm text-gray-800 dark:text-slate-200">{template.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-xs">{template.subject}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => openTemplateEditor(template)} className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"><Edit className="h-4 w-4"/></button>
                                        <button onClick={() => handleDeleteTemplate(template.id)} className="p-1.5 text-gray-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500"><Trash2 className="h-4 w-4"/></button>
                                    </div>
                               </div>
                           ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};