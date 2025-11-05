import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { MoreVertical, Search, Trash2, Tag, PlusCircle, Phone, Briefcase, CheckCircle, AlertCircle, HelpCircle, Zap, Loader2, ArrowUp, ArrowDown, Edit, ChevronDown } from 'lucide-react';
import TaggingModal from './modals/TaggingModal';
import AddProspectModal from './modals/AddProspectModal';
import { Prospect, ProspectStatus, ConfidenceScore, ContactHistoryItem } from '../types';
import ProspectIntelligencePanel from './ProspectIntelligencePanel';
import { generateProspectIntelligence } from '../services/geminiService';

const statusColors: Record<ProspectStatus, string> = {
  'New': 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
  'Contacted': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  'Engaged': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  'Meeting': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  'Closed': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
};

const confidenceStyles: Record<ConfidenceScore, { icon: React.ElementType, color: string }> = {
    'High': { icon: CheckCircle, color: 'text-green-500' },
    'Medium': { icon: AlertCircle, color: 'text-yellow-500' },
    'Low': { icon: HelpCircle, color: 'text-red-500' },
};

const statusOptions: ProspectStatus[] = ['New', 'Contacted', 'Engaged', 'Meeting', 'Closed'];
const confidenceOptions: ConfidenceScore[] = ['High', 'Medium', 'Low'];

interface ProspectsProps {
    prospects: Prospect[];
    setProspects: React.Dispatch<React.SetStateAction<Prospect[]>>;
}

export const Prospects: React.FC<ProspectsProps> = ({ prospects, setProspects }) => {
    const [selectedProspects, setSelectedProspects] = useState<string[]>([]);
    const [isTaggingModalOpen, setTaggingModalOpen] = useState(false);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isStatusMenuOpen, setStatusMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingProspect, setViewingProspect] = useState<Prospect | null>(null);
    const [enrichingProspectIds, setEnrichingProspectIds] = useState<string[]>([]);

    const [statusFilter, setStatusFilter] = useState<ProspectStatus | 'All'>('All');
    const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceScore | 'All'>('All');
    const [tagFilter, setTagFilter] = useState<string>('All');
    const [sortBy, setSortBy] = useState<'name' | 'company' | 'lastContact'>('lastContact');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const allTags = useMemo(() => {
        return [...new Set(prospects.flatMap(p => p.tags))].sort();
    }, [prospects]);

    const processedProspects = useMemo(() => {
        let filtered = prospects;

        if (searchTerm.trim()) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(lowercasedFilter) ||
                p.email.toLowerCase().includes(lowercasedFilter) ||
                p.company.toLowerCase().includes(lowercasedFilter) ||
                p.tags.some(tag => tag.toLowerCase().includes(lowercasedFilter))
            );
        }

        if (statusFilter !== 'All') {
            filtered = filtered.filter(p => p.status === statusFilter);
        }

        if (confidenceFilter !== 'All') {
            filtered = filtered.filter(p => p.confidenceScore === confidenceFilter);
        }

        if (tagFilter !== 'All') {
            filtered = filtered.filter(p => p.tags.includes(tagFilter));
        }

        const sorted = [...filtered].sort((a, b) => {
            if (sortBy === 'lastContact') {
                return (a.lastContactDate?.getTime() || 0) - (b.lastContactDate?.getTime() || 0);
            }
            if (sortBy === 'name') {
                return a.name.localeCompare(b.name);
            }
            if (sortBy === 'company') {
                return a.company.localeCompare(b.company);
            }
            return 0;
        });

        if (sortOrder === 'desc') {
            sorted.reverse();
        }

        return sorted;
    }, [prospects, searchTerm, statusFilter, confidenceFilter, tagFilter, sortBy, sortOrder]);
    
    const handleRowClick = (prospect: Prospect) => {
        setViewingProspect(prospect);
    };

    const handleUpdateProspect = (updatedProspect: Prospect) => {
        setProspects(prev => prev.map(p => p.id === updatedProspect.id ? updatedProspect : p));
        setViewingProspect(updatedProspect); // Update the panel with new data
    };

    const handleEnrichProspectRow = async (prospectId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setEnrichingProspectIds(prev => [...prev, prospectId]);
        
        const prospectToEnrich = prospects.find(p => p.id === prospectId);
        if (!prospectToEnrich) {
            setEnrichingProspectIds(prev => prev.filter(id => id !== prospectId));
            return;
        }
    
        try {
            const { intelligence: aiData, sources } = await generateProspectIntelligence(prospectToEnrich);
    
            const enrichedData: Partial<Prospect> = {
                isEnriched: true,
                confidenceScore: ['High', 'Medium'][Math.floor(Math.random() * 2)] as ConfidenceScore,
                decisionAuthorityScore: Math.floor(Math.random() * 4) + 7, // 7-10
                linkedInUrl: `https://linkedin.com/in/${prospectToEnrich.name.toLowerCase().replace(' ','-')}`,
                companyDetails: {
                    ...prospectToEnrich.companyDetails,
                    description: aiData.companyDescription,
                    industry: 'Technology',
                    revenue: `$${Math.floor(Math.random() * 50) + 10}M`,
                    employeeCount: `${Math.floor(Math.random() * 300) + 50}`,
                },
                recentNews: aiData.recentNews,
                aiAnalysis: {
                    communicationStyle: aiData.communicationStyle,
                    motivations: aiData.motivations,
                    painPoints: aiData.painPoints,
                },
                contactHistory: aiData.contactHistory,
                groundingSources: sources,
            };
            
            const fullyEnrichedProspect = { ...prospectToEnrich, ...enrichedData };
            setProspects(prev => prev.map(p => p.id === prospectId ? fullyEnrichedProspect : p));
    
        } catch (error) {
            console.error("Enrichment failed:", error);
        } finally {
            setEnrichingProspectIds(prev => prev.filter(id => id !== prospectId));
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedProspects(processedProspects.map(p => p.id));
        } else {
            setSelectedProspects([]);
        }
    };

    const handleSelectOne = (id: string) => {
        setSelectedProspects(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const handleDeleteSelected = () => {
        if (window.confirm(`Are you sure you want to delete ${selectedProspects.length} prospect(s)? This action cannot be undone.`)) {
            setProspects(prev => prev.filter(p => !selectedProspects.includes(p.id)));
            setSelectedProspects([]);
        }
    };

    const handleAddTags = (tags: string[]) => {
        setProspects(prev => prev.map(p => {
            if (selectedProspects.includes(p.id)) {
                const newTags = [...new Set([...p.tags, ...tags])];
                return { ...p, tags: newTags };
            }
            return p;
        }));
        setSelectedProspects([]);
        setTaggingModalOpen(false);
    };

    const handleChangeStatus = (newStatus: ProspectStatus) => {
        setProspects(prev => prev.map(p => {
            if (selectedProspects.includes(p.id)) {
                return { ...p, status: newStatus };
            }
            return p;
        }));
        setSelectedProspects([]);
        setStatusMenuOpen(false);
    };

    const handleAddProspect = (newProspectData: Omit<Prospect, 'id' | 'avatarColor' | 'initials' | 'lastContact' | 'lastContactDate'>) => {
        const initials = newProspectData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        const newProspect: Prospect = {
            id: String(Date.now()),
            ...newProspectData,
            initials,
            avatarColor: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
            lastContact: 'Just now',
            lastContactDate: new Date(),
            isEnriched: false,
            confidenceScore: 'Low',
        };
        setProspects(prev => [newProspect, ...prev]);
        setAddModalOpen(false);
    };

    const isAllSelected = useMemo(() => processedProspects.length > 0 && selectedProspects.length === processedProspects.length, [processedProspects, selectedProspects]);

    return (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {isTaggingModalOpen && <TaggingModal onAddTags={handleAddTags} onClose={() => setTaggingModalOpen(false)} />}
            {isAddModalOpen && <AddProspectModal onAddProspect={handleAddProspect} onClose={() => setAddModalOpen(false)} />}
            {viewingProspect && <ProspectIntelligencePanel prospect={viewingProspect} onClose={() => setViewingProspect(null)} onUpdateProspect={handleUpdateProspect} />}


            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Prospects</h1>
                    <p className="mt-1 text-gray-600 dark:text-slate-400">Manage and research your leads and potential customers.</p>
                </div>
                 <button onClick={() => setAddModalOpen(true)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm">
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Add Prospect
                </button>
            </div>
            
            <div className="mb-4 flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-slate-800/50 rounded-lg border dark:border-slate-700 shadow-sm">
                <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search by name, company..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-200 focus:ring-2 focus:ring-blue-500" 
                    />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="py-2 pl-3 pr-8 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="All">All Statuses</option>
                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={confidenceFilter} onChange={(e) => setConfidenceFilter(e.target.value as any)} className="py-2 pl-3 pr-8 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="All">All Confidence</option>
                    {confidenceOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="py-2 pl-3 pr-8 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="All">All Tags</option>
                    {allTags.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div className="flex items-center gap-2 ml-auto">
                     <label htmlFor="sort-by" className="text-sm font-medium text-gray-600 dark:text-slate-400">Sort by:</label>
                     <select id="sort-by" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="py-2 pl-3 pr-8 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 text-sm">
                        <option value="lastContact">Last Contact</option>
                        <option value="name">Name</option>
                        <option value="company">Company</option>
                    </select>
                    <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="p-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700">
                        {sortOrder === 'asc' ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            <Card>
                <CardHeader className="p-4 border-b border-gray-200 dark:border-slate-700 min-h-[60px]">
                    {selectedProspects.length > 0 ? (
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{selectedProspects.length} selected</span>
                            <div className="flex items-center space-x-2">
                                <div className="relative">
                                    <button 
                                        onClick={() => setStatusMenuOpen(!isStatusMenuOpen)}
                                        className="flex items-center px-3 py-1.5 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600"
                                    >
                                        <Edit className="h-4 w-4 mr-2" /> Change Status <ChevronDown className="h-4 w-4 ml-1 -mr-1" />
                                    </button>
                                    {isStatusMenuOpen && (
                                        <div 
                                            className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black dark:ring-slate-700 ring-opacity-5 z-10"
                                            onMouseLeave={() => setStatusMenuOpen(false)}
                                        >
                                            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                                {statusOptions.map(status => (
                                                    <a 
                                                        key={status} 
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleChangeStatus(status);
                                                        }} 
                                                        className="block px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                                                        role="menuitem"
                                                    >
                                                        Set to {status}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => setTaggingModalOpen(true)} className="flex items-center px-3 py-1.5 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600">
                                    <Tag className="h-4 w-4 mr-2" /> Add Tags
                                </button>
                                <button onClick={handleDeleteSelected} className="flex items-center px-3 py-1.5 text-sm bg-red-50 dark:bg-red-500/10 text-red-600 border border-red-200 dark:border-red-500/20 rounded-md shadow-sm hover:bg-red-100 dark:hover:bg-red-500/20">
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </button>
                            </div>
                        </div>
                    ) : (
                        <CardTitle className="text-lg">All Prospects ({processedProspects.length})</CardTitle>
                    )}
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-800/50">
                                <tr>
                                    <th scope="col" className="p-4">
                                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={isAllSelected} onChange={handleSelectAll} />
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Company</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Confidence</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Last Contact</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                {processedProspects.length > 0 ? processedProspects.map((prospect) => (
                                    <tr key={prospect.id} onClick={() => handleRowClick(prospect)} className={`${selectedProspects.includes(prospect.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''} hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer`}>
                                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={selectedProspects.includes(prospect.id)} onChange={() => handleSelectOne(prospect.id)} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: prospect.avatarColor }}>
                                                    {prospect.initials}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-slate-100">{prospect.name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-slate-400">{prospect.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="text-gray-700 dark:text-slate-300">{prospect.company}</div>
                                            {prospect.title && (
                                                <div className="flex items-center text-xs text-gray-500 dark:text-slate-400 mt-1">
                                                    <Briefcase className="h-3 w-3 mr-1.5" />
                                                    {prospect.title}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[prospect.status]}`}>
                                                {prospect.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {/* FIX: Corrected dynamic component rendering for JSX by assigning the icon to a capitalized variable. */}
                                            {prospect.confidenceScore && (() => {
                                                const { icon: ConfidenceIcon, color } = confidenceStyles[prospect.confidenceScore];
                                                return (
                                                    <div className={`flex items-center ${color}`}>
                                                        <ConfidenceIcon className="h-4 w-4 mr-1.5" />
                                                        <span className="font-medium">{prospect.confidenceScore}</span>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{prospect.lastContact}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {!prospect.isEnriched && (
                                                enrichingProspectIds.includes(prospect.id) ? (
                                                    <button
                                                        className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md text-gray-500 bg-gray-100 dark:bg-slate-700 cursor-wait mr-2"
                                                        disabled
                                                    >
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Enriching...
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={(e) => handleEnrichProspectRow(prospect.id, e)}
                                                        className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md text-blue-600 bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900 mr-2"
                                                    >
                                                        <Zap className="h-4 w-4 mr-2" />
                                                        Enrich with AI
                                                    </button>
                                                )
                                            )}
                                            <button className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 inline-block align-middle" onClick={(e) => e.stopPropagation()}>
                                                <MoreVertical className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-gray-500 dark:text-slate-400">
                                            No prospects found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};