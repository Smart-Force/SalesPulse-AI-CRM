import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/Card';
import { PlusCircle, Send, Eye, MousePointerClick, MessageSquareReply, MoreVertical, Target, Rocket, Edit, Trash2 } from 'lucide-react';
import type { Campaign, Prospect, Template } from '../types';
import { templates as initialTemplates } from '../data/templates';
import CreateCampaignModal from './modals/CreateCampaignModal';
import CampaignDetailModal from './modals/CampaignDetailModal';
import { CampaignWorkflow } from './CampaignWorkflow';
import TemplateEditorModal from './modals/TemplateEditorModal';

const initialCampaigns: Campaign[] = [
  { id: '1', name: 'Q3 Product Launch', status: 'Active', sent: 12500, opens: 4875, clicks: 1250, replies: 150, createdDate: '2 days ago', steps: [{ id: 'step1', type: 'Email', templateId: 't1', delayDays: 0 }], prospectIds: ['1', '2'] },
  { id: '2', name: 'Summer Sales Promo', status: 'Completed', sent: 25000, opens: 11250, clicks: 4500, replies: 420, createdDate: '1 month ago', steps: [], prospectIds: [] },
  { id: '3', name: 'New Feature Announcement', status: 'Draft', sent: 0, opens: 0, clicks: 0, replies: 0, createdDate: '4 hours ago', steps: [], prospectIds: ['4'] },
  { id: '4', name: 'Lead Nurturing Sequence', status: 'Active', sent: 8400, opens: 3200, clicks: 800, replies: 95, createdDate: '1 week ago', steps: [], prospectIds: [] },
  { id: '5', name: 'Holiday Greetings 2024', status: 'Draft', sent: 0, opens: 0, clicks: 0, replies: 0, createdDate: '3 days ago', steps: [], prospectIds: [] },
  { id: '6', name: 'Re-engagement Campaign', status: 'Completed', sent: 15000, opens: 3000, clicks: 450, replies: 30, createdDate: '3 months ago', steps: [], prospectIds: [] },
];

const statusColors: Record<Campaign['status'], string> = {
  'Active': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  'Draft': 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300',
  'Completed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
};

const Metric = ({ icon: Icon, value, label }: { icon: React.ElementType, value: string | number, label: string }) => (
    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-slate-400">
        <Icon className="h-4 w-4" />
        <span><strong>{value}</strong> {label}</span>
    </div>
);

const ProgressBar = ({ value, colorClass }: { value: number, colorClass: string }) => (
    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
        <div className={`${colorClass} h-1.5 rounded-full`} style={{ width: `${value}%` }}></div>
    </div>
);

interface CampaignsProps {
    prospects: Prospect[];
}

export const Campaigns: React.FC<CampaignsProps> = ({ prospects: allProspects }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [recentlyEditedTemplateId, setRecentlyEditedTemplateId] = useState<string | null>(null);

  const handleCreateCampaign = (campaignName: string) => {
    const newCampaign: Campaign = {
        id: String(Date.now()),
        name: campaignName,
        status: 'Draft',
        sent: 0,
        opens: 0,
        clicks: 0,
        replies: 0,
        createdDate: 'Just now',
        steps: [],
        prospectIds: [],
    };
    setCampaigns(prev => [newCampaign, ...prev]);
    setCreateModalOpen(false);
  };

  const handleUpdateCampaign = (updatedCampaign: Campaign) => {
    setCampaigns(prev => prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c));
    setEditingCampaign(updatedCampaign);
  };

  const handleStartCampaign = (campaignId: string) => {
      setCampaigns(prev => prev.map(c => 
          c.id === campaignId ? { ...c, status: 'Active' } : c
      ));
  };
  
  const handleOpenTemplateModal = (template: Template | null = null) => {
    setEditingTemplate(template);
    setTemplateModalOpen(true);
  };

  const handleSaveTemplate = (templateData: Omit<Template, 'id'> & { id?: string }) => {
    if (templateData.id) { // Editing existing
      setTemplates(prev => prev.map(t => t.id === templateData.id ? { ...t, name: templateData.name, subject: templateData.subject, body: templateData.body } : t));
      setRecentlyEditedTemplateId(templateData.id);
      setTimeout(() => setRecentlyEditedTemplateId(null), 2500);
    } else { // Creating new
      const newTemplate: Template = {
        id: crypto.randomUUID(),
        name: templateData.name,
        subject: templateData.subject,
        body: templateData.body,
      };
      setTemplates(prev => [newTemplate, ...prev]);
    }
    setTemplateModalOpen(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = useCallback((templateIdToDelete: string) => {
    if (window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
        setTemplates(prevTemplates => prevTemplates.filter(t => t.id !== templateIdToDelete));
    }
  }, []); // Empty dependency array is correct because setTemplates is a stable function.

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {isCreateModalOpen && <CreateCampaignModal onClose={() => setCreateModalOpen(false)} onCreateCampaign={handleCreateCampaign} />}
      {isTemplateModalOpen && <TemplateEditorModal onClose={() => setTemplateModalOpen(false)} onSave={handleSaveTemplate} templateToEdit={editingTemplate} />}
      {editingCampaign && (
        <CampaignDetailModal 
          campaign={editingCampaign}
          allProspects={allProspects}
          allTemplates={templates}
          onClose={() => setEditingCampaign(null)}
          onUpdateCampaign={handleUpdateCampaign}
        />
      )}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Campaigns</h1>
            <p className="mt-1 text-gray-600 dark:text-slate-400">Create, monitor, and analyze your email outreach campaigns.</p>
        </div>
        <button onClick={() => setCreateModalOpen(true)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm">
            <PlusCircle className="h-5 w-5 mr-2" />
            Create Campaign
        </button>
      </div>

      <CampaignWorkflow />
      
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Email Templates</CardTitle>
                <p className="text-sm text-gray-500 dark:text-slate-400">Manage your reusable email templates.</p>
            </div>
            <button onClick={() => handleOpenTemplateModal()} className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center">
                <PlusCircle className="h-5 w-5 mr-2" />
                Create Template
            </button>
        </CardHeader>
        <CardContent>
            <div className="space-y-3">
                {templates.length > 0 ? templates.map(template => (
                   <div
                        key={template.id}
                        className={`p-3 rounded-md border dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between transition-all duration-300 ${recentlyEditedTemplateId === template.id ? 'bg-yellow-100 dark:bg-yellow-900/50 ring-2 ring-yellow-400' : ''}`}
                    >
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-slate-200">{template.name}</p>
                            <p className="text-sm text-gray-500 dark:text-slate-400 truncate">Subject: {template.subject}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => handleOpenTemplateModal(template)} className="p-2 text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md">
                                <Edit className="h-4 w-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTemplate(template.id);
                                }}
                                className="p-2 text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                        <p>No custom templates yet. Create one to get started!</p>
                    </div>
                )}
            </div>
        </CardContent>
      </Card>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.length > 0 ? campaigns.map(campaign => {
             const openRate = campaign.sent > 0 ? ((campaign.opens / campaign.sent) * 100).toFixed(1) : 0;
             const clickRate = campaign.opens > 0 ? ((campaign.clicks / campaign.opens) * 100).toFixed(1) : 0;
            return (
                <Card 
                    key={campaign.id} 
                    className="flex flex-col hover:shadow-lg transition-shadow duration-300 cursor-pointer" 
                    onClick={(e) => {
                        if ((e.target as HTMLElement).closest('button')) {
                            return;
                        }
                        setEditingCampaign(campaign);
                    }}
                >
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="mb-1">{campaign.name}</CardTitle>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[campaign.status]}`}>
                                    {campaign.status}
                                </span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <button className="p-1 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
                                    <MoreVertical className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Metric icon={Send} value={campaign.sent.toLocaleString()} label="Sent" />
                            <Metric icon={Eye} value={campaign.opens.toLocaleString()} label="Opens" />
                            <Metric icon={MousePointerClick} value={campaign.clicks.toLocaleString()} label="Clicks" />
                            <Metric icon={MessageSquareReply} value={campaign.replies.toLocaleString()} label="Replies" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700 dark:text-slate-300">Open Rate</span>
                                <span className="text-gray-500 dark:text-slate-400">{openRate}%</span>
                            </div>
                            <ProgressBar value={Number(openRate)} colorClass="bg-blue-500" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700 dark:text-slate-300">Click Rate (from opens)</span>
                                <span className="text-gray-500 dark:text-slate-400">{clickRate}%</span>
                            </div>
                            <ProgressBar value={Number(clickRate)} colorClass="bg-green-500" />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t dark:border-slate-700 pt-4 flex justify-between items-center">
                        <p className="text-xs text-gray-500 dark:text-slate-400">Created: {campaign.createdDate}</p>
                        {campaign.status === 'Draft' ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartCampaign(campaign.id);
                                }}
                                className="bg-green-600 text-white font-semibold py-1.5 px-3 rounded-lg hover:bg-green-700 transition-colors flex items-center shadow-sm text-sm"
                            >
                                <Rocket className="h-4 w-4 mr-2" />
                                Start Campaign
                            </button>
                        ) : (
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                View Details
                            </p>
                        )}
                    </CardFooter>
                </Card>
            )
        }) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 text-gray-500 dark:text-slate-400">
                <Target className="h-16 w-16 mx-auto text-gray-300 dark:text-slate-600" />
                <h3 className="mt-4 text-lg font-medium">No campaigns yet</h3>
                <p className="mt-1 text-sm">Get started by creating your first campaign.</p>
            </div>
        )}
      </div>
    </div>
  );
};