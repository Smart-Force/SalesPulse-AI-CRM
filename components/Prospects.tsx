import React, { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { MoreVertical, Search, Trash2, Tag, PlusCircle, Phone, Briefcase, CheckCircle, AlertCircle, HelpCircle, Zap, Loader2, ArrowUp, ArrowDown, Edit, ChevronDown, ListPlus, List, Users, LayoutGrid, Upload, Download } from 'lucide-react';
import AddToListModal from './modals/AddToListModal';
import TaggingModal from './modals/TaggingModal';
import AddProspectModal from './modals/AddProspectModal';
import { Prospect, ProspectStatus, ConfidenceScore, ContactHistoryItem, NewProspectData, ProspectList, Deal, Product } from '../types';
import ProspectIntelligencePanel from './ProspectIntelligencePanel';
import { generateProspectIntelligence } from '../services/aiService';
import { useToasts } from '../contexts/ToastContext';

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
    prospectLists: ProspectList[];
    setProspectLists: React.Dispatch<React.SetStateAction<ProspectList[]>>;
    deals: Deal[];
    setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
    products: Product[];
}

export const Prospects: React.FC<ProspectsProps> = ({ prospects, setProspects, prospectLists, setProspectLists, deals, setDeals, products }) => {
    const [selectedProspects, setSelectedProspects] = useState<string[]>([]);
    const [isTaggingModalOpen, setTaggingModalOpen] = useState(false);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isAddToListModalOpen, setAddToListModalOpen] = useState(false);
    const [isStatusMenuOpen, setStatusMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingProspect, setViewingProspect] = useState<Prospect | null>(null);
    const [enrichingProspectIds, setEnrichingProspectIds] = useState<string[]>([]);
    const [isBulkEnriching, setIsBulkEnriching] = useState(false);
    const [activeView, setActiveView] = useState<'list' | 'board'>('list');
    const { addToast } = useToasts();

    const [statusFilter, setStatusFilter] = useState<ProspectStatus | 'All'>('All');
    const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceScore | 'All'>('All');
    const [tagFilter, setTagFilter] = useState<string>('All');
    const [sortBy, setSortBy] = useState<'name' | 'company' | 'lastContact'>('lastContact');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedListId, setSelectedListId] = useState<string | null>(null);
    const importFileInputRef = useRef<HTMLInputElement>(null);

    const allTags = useMemo(() => {
        return [...new Set(prospects.flatMap(p => p.tags))].sort();
    }, [prospects]);

    const processedProspects = useMemo(() => {
        let filtered = prospects;

        if (selectedListId) {
            const list = prospectLists.find(l => l.id === selectedListId);
            if (list) {
                const prospectIdsInList = new Set(list.prospectIds);
                filtered = filtered.filter(p => prospectIdsInList.has(p.id));
            }
        }

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
    }, [prospects, searchTerm, statusFilter, confidenceFilter, tagFilter, sortBy, sortOrder, selectedListId, prospectLists]);
    
    const prospectsByStatus = useMemo(() => {
        return processedProspects.reduce((acc, prospect) => {
            const status = prospect.status;
            if (!acc[status]) {
                acc[status] = [];
            }
            acc[status].push(prospect);
            return acc;
        }, {} as Record<ProspectStatus, Prospect[]>);
    }, [processedProspects]);

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

    const handleBulkEnrich = async () => {
        setIsBulkEnriching(true);

        const prospectsToEnrich = selectedProspects
            .map(id => prospects.find(p => p.id === id))
            .filter((p): p is Prospect => !!p && !p.isEnriched);

        if (prospectsToEnrich.length === 0) {
            addToast(`${selectedProspects.length} prospect(s) selected, but all are already enriched.`, 'info');
            setIsBulkEnriching(false);
            return;
        }

        const skippedCount = selectedProspects.length - prospectsToEnrich.length;
        addToast(`Enriching ${prospectsToEnrich.length} prospect(s)... This may take a moment.`, 'info');

        try {
            const enrichmentPromises = prospectsToEnrich.map(async (prospect) => {
                try {
                    const { intelligence: aiData, sources } = await generateProspectIntelligence(prospect);
                    const enrichedData: Partial<Prospect> = {
                        isEnriched: true,
                        confidenceScore: ['High', 'Medium'][Math.floor(Math.random() * 2)] as ConfidenceScore,
                        decisionAuthorityScore: Math.floor(Math.random() * 4) + 7,
                        linkedInUrl: `https://linkedin.com/in/${prospect.name.toLowerCase().replace(' ','-')}`,
                        companyDetails: {
                            ...prospect.companyDetails,
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
                    return { ...prospect, ...enrichedData };
                } catch (error) {
                    console.error(`Failed to enrich prospect ${prospect.id}:`, error);
                    return prospect.id; // Return ID on failure
                }
            });

            const enrichedResults = await Promise.all(enrichmentPromises);
            
            const successfullyEnriched = enrichedResults.filter((p): p is Prospect => typeof p === 'object' && p !== null);
            const failedIds = enrichedResults.filter((p): p is string => typeof p === 'string');

            if (successfullyEnriched.length > 0) {
                setProspects(currentProspects => {
                    const updatedProspectsMap = new Map(successfullyEnriched.map(p => [p.id, p]));
                    return currentProspects.map(p => updatedProspectsMap.get(p.id) || p);
                });
            }

            let successMessage = `${successfullyEnriched.length} prospect(s) enriched successfully.`;
            if (skippedCount > 0) {
                successMessage += ` ${skippedCount} were skipped.`;
            }
            addToast(successMessage, 'success');

            if (failedIds.length > 0) {
                addToast(`${failedIds.length} prospect(s) failed to enrich. See console for details.`, 'error');
            }

        } catch (error) {
            console.error("Bulk enrichment failed:", error);
            addToast('An unexpected error occurred during bulk enrichment.', 'error');
        } finally {
            setSelectedProspects([]);
            setIsBulkEnriching(false);
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
            // Also remove from any lists
            setProspectLists(prevLists => prevLists.map(list => ({
                ...list,
                prospectIds: list.prospectIds.filter(id => !selectedProspects.includes(id))
            })));
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

    const handleAddProspect = (newProspectData: NewProspectData) => {
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

    const handleCreateList = () => {
        const listName = prompt("Enter new list name:");
        if (listName && listName.trim()) {
            const newList: ProspectList = {
                id: `list${Date.now()}`,
                name: listName.trim(),
                prospectIds: [],
                createdAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            };
            setProspectLists(prev => [newList, ...prev]);
        }
    };
    
    const handleAddSelectedToList = (listId: string) => {
        setProspectLists(prev => prev.map(list => {
            if (list.id === listId) {
                const newProspectIds = [...new Set([...list.prospectIds, ...selectedProspects])];
                return { ...list, prospectIds: newProspectIds };
            }
            return list;
        }));
        setAddToListModalOpen(false);
        setSelectedProspects([]);
    };
    
    const handleCreateAndAddToList = (listName: string) => {
        const newList: ProspectList = {
            id: `list${Date.now()}`,
            name: listName,
            prospectIds: selectedProspects,
            createdAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        };
        setProspectLists(prev => [newList, ...prev]);
        setAddToListModalOpen(false);
        setSelectedProspects([]);
    };

    const handleDragStart = (e: React.DragEvent, prospectId: string) => {
        e.dataTransfer.setData("prospectId", prospectId);
    };
    
    const handleDrop = (e: React.DragEvent, newStatus: ProspectStatus) => {
        const prospectId = e.dataTransfer.getData("prospectId");
        setProspects(prev => prev.map(p => p.id === prospectId ? { ...p, status: newStatus } : p));
        e.currentTarget.classList.remove('bg-blue-100', 'dark:bg-blue-900/30');
    };
    
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.currentTarget.classList.add('bg-blue-100', 'dark:bg-blue-900/30');
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.currentTarget.classList.remove('bg-blue-100', 'dark:bg-blue-900/30');
    };

    const handleExport = () => {
        const headers = ['name', 'company', 'email', 'phone', 'title', 'status', 'tags'];
        const csvContent = [
            headers.join(','),
            ...processedProspects.map(p => [
                `"${p.name.replace(/"/g, '""')}"`,
                `"${p.company.replace(/"/g, '""')}"`,
                `"${p.email}"`,
                `"${p.phone || ''}"`,
                `"${(p.title || '').replace(/"/g, '""')}"`,
                p.status,
                `"${p.tags.join('|')}"` // Use pipe as separator for tags
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "prospects.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const rows = text.split('\n');
            const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
            
            const headerMap: { [key: string]: number } = {};
            headers.forEach((header, index) => {
                headerMap[header] = index;
            });
            
            const potentialProspects = rows.slice(1).map(row => {
                const data = row.split(',');
                if (data.length < headers.length) return null;

                const name = data[headerMap['name']]?.replace(/"/g, '') || '';
                const email = data[headerMap['email']]?.replace(/"/g, '') || '';
                if (!name || !email) return null;

                const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                
                return {
                    id: `prospect_${Date.now()}_${Math.random()}`,
                    name,
                    email,
                    company: data[headerMap['company']]?.replace(/"/g, '') || '',
                    phone: data[headerMap['phone']]?.replace(/"/g, '') || undefined,
                    title: data[headerMap['title']]?.replace(/"/g, '') || undefined,
                    status: (data[headerMap['status']] as ProspectStatus) || 'New',
                    tags: data[headerMap['tags']]?.replace(/"/g, '').split('|') || [],
                    initials,
                    avatarColor: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
                    lastContact: 'Just imported',
                    lastContactDate: new Date(),
                    isEnriched: false,
                } as Prospect;
            }).filter((p): p is Prospect => p !== null);

            const existingEmails = new Set(prospects.map(p => p.email.toLowerCase()));
            const seenEmailsInFile = new Set<string>();
            
            const newUniqueProspects = potentialProspects.filter(prospect => {
                const prospectEmailLower = prospect.email.toLowerCase();
                if (existingEmails.has(prospectEmailLower) || seenEmailsInFile.has(prospectEmailLower)) {
                    return false;
                }
                seenEmailsInFile.add(prospectEmailLower);
                return true;
            });

            if (newUniqueProspects.length > 0) {
                const duplicateCount = potentialProspects.length - newUniqueProspects.length;
                let confirmationMessage = `Found ${newUniqueProspects.length} new prospects to import.`;
                if (duplicateCount > 0) {
                    confirmationMessage += ` ${duplicateCount} duplicate or invalid rows were ignored.`;
                }
                confirmationMessage += " Would you like to add them?";

                if (window.confirm(confirmationMessage)) {
                    setProspects(prev => [...prev, ...newUniqueProspects]);
                }
            } else {
                alert('No new prospects found in the file. All entries were either duplicates of existing prospects, duplicates within the file, or invalid.');
            }

            if(importFileInputRef.current) {
                importFileInputRef.current.value = "";
            }
        };
        reader.readAsText(file);
    };


    const isAllSelected = useMemo(() => processedProspects.length > 0 && selectedProspects.length === processedProspects.length, [processedProspects, selectedProspects]);
    
    const renderFilters = () => (
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
            {activeView === 'list' && (
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="py-2 pl-3 pr-8 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="All">All Statuses</option>
                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            )}
            <select value={confidenceFilter} onChange={(e) => setConfidenceFilter(e.target.value as any)} className="py-2 pl-3 pr-8 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 text-sm">
                <option value="All">All Confidence</option>
                {confidenceOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="py-2 pl-3 pr-8 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 text-sm">
                <option value="All">All Tags</option>
                {allTags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className="flex items-center gap-2 ml-auto">
                <span className="isolate inline-flex rounded-md shadow-sm">
                    <button onClick={() => setActiveView('list')} type="button" className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 dark:ring-slate-600 focus:z-10 ${activeView === 'list' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                        <List className="h-5 w-5" />
                    </button>
                    <button onClick={() => setActiveView('board')} type="button" className={`relative -ml-px inline-flex items-center rounded-r-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 dark:ring-slate-600 focus:z-10 ${activeView === 'board' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                        <LayoutGrid className="h-5 w-5" />
                    </button>
                </span>
            </div>
        </div>
    );

    return (
        <div className="bg-slate-50 dark:bg-slate-900">
            <input type="file" ref={importFileInputRef} onChange={handleImport} style={{ display: 'none' }} accept=".csv" />
            {isTaggingModalOpen && <TaggingModal onAddTags={handleAddTags} onClose={() => setTaggingModalOpen(false)} />}
            {isAddModalOpen && <AddProspectModal onAddProspect={handleAddProspect} onClose={() => setAddModalOpen(false)} />}
            {isAddToListModalOpen && <AddToListModal onClose={() => setAddToListModalOpen(false)} prospectLists={prospectLists} onAddToList={handleAddSelectedToList} onCreateAndAddToList={handleCreateAndAddToList} />}
            {viewingProspect && <ProspectIntelligencePanel 
                                    prospect={viewingProspect} 
                                    onClose={() => setViewingProspect(null)} 
                                    onUpdateProspect={handleUpdateProspect}
                                    deals={deals.filter(d => d.prospectId === viewingProspect.id)}
                                    setDeals={setDeals}
                                    products={products}
                                />}

            <main className="h-[calc(100vh-4rem)] flex flex-col p-4 sm:p-6 lg:p-8 overflow-hidden">
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Prospects</h1>
                        <p className="mt-1 text-gray-600 dark:text-slate-400">Manage and research your leads and potential customers.</p>
                    </div>
                     <div className="flex items-center space-x-2">
                        <button onClick={() => importFileInputRef.current?.click()} className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors flex items-center shadow-sm">
                            <Upload className="h-4 w-4 mr-2" />
                            Import
                        </button>
                         <button onClick={handleExport} className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors flex items-center shadow-sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </button>
                        <button onClick={() => setAddModalOpen(true)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm">
                            <PlusCircle className="h-5 w-5 mr-2" />
                            Add Prospect
                        </button>
                    </div>
                </div>
                
                <div className="flex items-center border-b border-gray-200 dark:border-slate-700 mb-4">
                    <nav className="flex-1 -mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                        <button
                            onClick={() => setSelectedListId(null)}
                            className={`flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                selectedListId === null
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-600'
                            }`}
                        >
                           <Users className="h-5 w-5 mr-2" /> All Prospects
                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200">
                                {prospects.length}
                            </span>
                        </button>
                        {prospectLists.map(list => (
                            <button
                                key={list.id}
                                onClick={() => setSelectedListId(list.id)}
                                className={`flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    selectedListId === list.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-600'
                                }`}
                            >
                                <List className="h-5 w-5 mr-2" /> {list.name}
                                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200">
                                    {list.prospectIds.length}
                                </span>
                            </button>
                        ))}
                    </nav>
                     <button onClick={handleCreateList} title="Create New List" className="ml-4 flex-shrink-0 flex items-center px-3 py-1.5 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600">
                        <ListPlus className="h-4 w-4 mr-2"/>
                        New List
                    </button>
                </div>
                
                {renderFilters()}
                
                {activeView === 'list' && (
                    <Card className="flex-grow overflow-hidden flex flex-col">
                        <CardHeader className="p-4 border-b border-gray-200 dark:border-slate-700 min-h-[60px] flex-shrink-0">
                            {selectedProspects.length > 0 ? (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{selectedProspects.length} selected</span>
                                    <div className="flex items-center space-x-2 flex-wrap gap-2">
                                        <div className="relative">
                                            <button onClick={() => setStatusMenuOpen(!isStatusMenuOpen)} className="flex items-center px-3 py-1.5 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600">
                                                <Edit className="h-4 w-4 mr-2" /> Change Status <ChevronDown className="h-4 w-4 ml-1 -mr-1" />
                                            </button>
                                            {isStatusMenuOpen && (<div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black dark:ring-slate-700 ring-opacity-5 z-10" onMouseLeave={() => setStatusMenuOpen(false)}><div className="py-1">{statusOptions.map(status => (<a key={status} href="#" onClick={(e) => { e.preventDefault(); handleChangeStatus(status); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700">Set to {status}</a>))}</div></div>)}
                                        </div>
                                        <button onClick={() => setAddToListModalOpen(true)} className="flex items-center px-3 py-1.5 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600"><List className="h-4 w-4 mr-2" /> Add to List</button>
                                        <button onClick={() => setTaggingModalOpen(true)} className="flex items-center px-3 py-1.5 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600"><Tag className="h-4 w-4 mr-2" /> Add Tags</button>
                                        <button 
                                            onClick={handleBulkEnrich} 
                                            disabled={isBulkEnriching}
                                            className="flex items-center px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/50 text-blue-600 border border-blue-200 dark:border-blue-500/20 rounded-md shadow-sm hover:bg-blue-100 dark:hover:bg-blue-900 disabled:opacity-50 disabled:cursor-wait"
                                        >
                                            {isBulkEnriching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
                                            {isBulkEnriching ? 'Enriching...' : 'Enrich with AI'}
                                        </button>
                                        <button onClick={handleDeleteSelected} className="flex items-center px-3 py-1.5 text-sm bg-red-50 dark:bg-red-500/10 text-red-600 border border-red-200 dark:border-red-500/20 rounded-md shadow-sm hover:bg-red-100 dark:hover:bg-red-500/20"><Trash2 className="h-4 w-4 mr-2" /> Delete</button>
                                    </div>
                                </div>
                            ) : (<CardTitle className="text-lg">{selectedListId ? prospectLists.find(l=>l.id===selectedListId)?.name : 'All Prospects'} ({processedProspects.length})</CardTitle>)}
                        </CardHeader>
                        <CardContent className="p-0 flex-grow overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                                <thead className="bg-gray-50 dark:bg-slate-800/50 sticky top-0">
                                    <tr>
                                        <th scope="col" className="p-4"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={isAllSelected} onChange={handleSelectAll} /></th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Company</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Tags</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Confidence</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Last Contact</th>
                                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                    {processedProspects.length > 0 ? processedProspects.map((prospect) => (
                                        <tr key={prospect.id} onClick={() => handleRowClick(prospect)} className={`${selectedProspects.includes(prospect.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''} hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer`}>
                                            <td className="p-4" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={selectedProspects.includes(prospect.id)} onChange={() => handleSelectOne(prospect.id)} /></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><div className="h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: prospect.avatarColor }}>{prospect.initials}</div><div className="ml-4"><div className="text-sm font-medium text-gray-900 dark:text-slate-100">{prospect.name}</div><div className="text-sm text-gray-500 dark:text-slate-400">{prospect.email}</div></div></div></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm"><div className="text-gray-700 dark:text-slate-300">{prospect.company}</div>{prospect.title && (<div className="flex items-center text-xs text-gray-500 dark:text-slate-400 mt-1"><Briefcase className="h-3 w-3 mr-1.5" />{prospect.title}</div>)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[prospect.status]}`}>{prospect.status}</span></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="flex flex-wrap gap-1">{prospect.tags.map(tag => <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200">{tag}</span>)}</div></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{prospect.confidenceScore && (() => { const { icon: ConfidenceIcon, color } = confidenceStyles[prospect.confidenceScore]; return (<div className={`flex items-center ${color}`}><ConfidenceIcon className="h-4 w-4 mr-1.5" /><span className="font-medium">{prospect.confidenceScore}</span></div>); })()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{prospect.lastContact}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {!prospect.isEnriched && (enrichingProspectIds.includes(prospect.id) ? (<button className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md text-gray-500 bg-gray-100 dark:bg-slate-700 cursor-wait mr-2" disabled><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enriching...</button>) : (<button onClick={(e) => handleEnrichProspectRow(prospect.id, e)} className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md text-blue-600 bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900 mr-2"><Zap className="h-4 w-4 mr-2" />Enrich with AI</button>))}
                                                <button className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 inline-block align-middle" onClick={(e) => e.stopPropagation()}><MoreVertical className="h-5 w-5" /></button>
                                            </td>
                                        </tr>
                                    )) : (<tr><td colSpan={8} className="text-center py-12 text-gray-500 dark:text-slate-400">No prospects found.</td></tr>)}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}
                {activeView === 'board' && (
                     <div className="flex-grow flex gap-4 overflow-x-auto pb-4">
                        {statusOptions.map(status => (
                            <div key={status} onDrop={(e) => handleDrop(e, status)} onDragOver={handleDragOver} onDragLeave={handleDragLeave} className="w-72 flex-shrink-0 bg-slate-100 dark:bg-slate-900/50 rounded-lg flex flex-col transition-colors">
                                <h3 className={`p-3 text-sm font-semibold text-gray-700 dark:text-slate-200 border-b-2 ${statusColors[status].replace('bg-', 'border-').replace(/text-\w+-\d+/, '')}`}>{status} <span className="text-gray-400 font-normal ml-1">({prospectsByStatus[status]?.length || 0})</span></h3>
                                <div className="p-2 space-y-2 overflow-y-auto flex-grow">
                                    {(prospectsByStatus[status] || []).map(prospect => {
                                        const { icon: ConfidenceIcon, color } = confidenceStyles[prospect.confidenceScore || 'Low'];
                                        return (
                                            <Card key={prospect.id} draggable onDragStart={(e) => handleDragStart(e, prospect.id)} onClick={() => handleRowClick(prospect)} className="cursor-pointer hover:ring-2 hover:ring-blue-500">
                                                <CardContent className="p-3">
                                                    <div className="flex items-start justify-between">
                                                        <p className="font-semibold text-sm text-gray-800 dark:text-slate-100">{prospect.name}</p>
                                                        <div className="h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ backgroundColor: prospect.avatarColor }}>{prospect.initials}</div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-slate-400">{prospect.company}</p>
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {prospect.tags.map(tag => <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200">{tag}</span>)}
                                                    </div>
                                                    <div className="flex items-center justify-between mt-3 text-xs">
                                                        <span className="text-gray-500 dark:text-slate-400">{prospect.lastContact}</span>
                                                        <div className={`flex items-center ${color}`}><ConfidenceIcon className="h-3 w-3 mr-1" />{prospect.confidenceScore}</div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};