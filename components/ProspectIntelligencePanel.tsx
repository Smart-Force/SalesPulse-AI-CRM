import React, { useState, useEffect } from 'react';
import type { Prospect, ConfidenceScore, ContactHistoryItem, Deal, DealStatus, Product } from '../types';
import { X, Bot, Zap, Building, BarChart, UserCheck, MessageSquare, Lightbulb, TrendingUp, Link, Loader2, Check, ExternalLink, BookUser, Mail, Phone, Calendar, Sparkles, ChevronRight, Wand2, ClipboardEdit, PhoneCall, Plus, Clock, Save, Handshake, DollarSign, ChevronDown, Edit } from 'lucide-react';
import { generateProspectIntelligence, generateNextSteps } from '../services/geminiService';
import DealBuilderModal from './modals/DealBuilderModal';

interface PanelProps {
  prospect: Prospect;
  onClose: () => void;
  onUpdateProspect: (updatedProspect: Prospect) => void;
  deals: Deal[];
  setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
  products: Product[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const dealStatusColors: Record<DealStatus, string> = {
  'Proposal': 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
  'Negotiating': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  'Won': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  'Lost': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
};


const InfoPill = ({ icon: Icon, text, score, maxScore }: { icon: React.ElementType, text: string, score?: number, maxScore?: number }) => (
    <div className="flex items-center p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
        <Icon className="h-6 w-6 text-blue-500 mr-3 flex-shrink-0" />
        <div>
            <p className="text-sm font-medium text-gray-700 dark:text-slate-300">{text}</p>
            {score && maxScore && (
                <div className="flex items-center mt-1">
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(score / maxScore) * 100}%` }}></div>
                    </div>
                    <span className="text-xs font-semibold text-gray-600 dark:text-slate-400 ml-2">{score}/{maxScore}</span>
                </div>
            )}
        </div>
    </div>
);

interface SectionProps {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon: Icon, children }) => (
    <div>
        <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3">
            <Icon className="h-5 w-5 mr-2 text-gray-500 dark:text-slate-400" />
            {title}
        </h3>
        <div className="space-y-3">{children}</div>
    </div>
);

const interactionIcons: { [key in ContactHistoryItem['type']]: React.ElementType } = {
    Email: Mail,
    Call: Phone,
    Meeting: Calendar,
};

interface Suggestion {
  title: string;
  rationale: string;
}

const ProspectIntelligencePanel: React.FC<PanelProps> = ({ prospect, onClose, onUpdateProspect, deals, setDeals, products }) => {
    const [isPanelOpen, setPanelOpen] = useState(false);
    const [isEnriching, setIsEnriching] = useState(false);
    const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
    const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
    const [notesContent, setNotesContent] = useState(prospect.notes || '');
    const [isNotesDirty, setIsNotesDirty] = useState(false);
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [saveNotesStatus, setSaveNotesStatus] = useState<'idle' | 'success'>('idle');
    const [activeTab, setActiveTab] = useState<'intelligence' | 'deals'>('intelligence');
    const [isDealBuilderOpen, setDealBuilderOpen] = useState(false);
    const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
    const [expandedDealId, setExpandedDealId] = useState<string | null>(null);
    
    // State for new call log
    const [showCallLogForm, setShowCallLogForm] = useState(false);
    const [newCallLog, setNewCallLog] = useState({ duration: '', outcome: '', aiInsight: '' });


    useEffect(() => {
        setPanelOpen(true);
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        setNotesContent(prospect.notes || '');
        setIsNotesDirty(false);
        setSaveNotesStatus('idle');
    }, [prospect]);

    const handleClose = () => {
        setPanelOpen(false);
        setTimeout(onClose, 300); // Wait for animation
    };

    const handleEnrich = async () => {
        setIsEnriching(true);
        try {
            const { intelligence: aiData, sources } = await generateProspectIntelligence(prospect);
            
            const enrichedData: Partial<Prospect> = {
                isEnriched: true,
                confidenceScore: ['High', 'Medium'][Math.floor(Math.random() * 2)] as ConfidenceScore,
                decisionAuthorityScore: Math.floor(Math.random() * 4) + 7, // 7-10
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
            
            onUpdateProspect({ ...prospect, ...enrichedData });

        } catch (error) {
            console.error("Enrichment failed:", error);
            // Handle error state in UI if necessary
        } finally {
            setIsEnriching(false);
        }
    };
    
    const handleGenerateSuggestions = async () => {
        setIsGeneratingSuggestions(true);
        setSuggestions(null);
        try {
            const result = await generateNextSteps(prospect);
            setSuggestions(result);
        } catch (error) {
            console.error("Failed to get suggestions:", error);
            // Optionally set an error state to show in the UI
        } finally {
            setIsGeneratingSuggestions(false);
        }
    };

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNotesContent(e.target.value);
        setIsNotesDirty(true);
        setSaveNotesStatus('idle');
    };

    const handleSaveNotes = () => {
        setIsSavingNotes(true);
        setSaveNotesStatus('idle');
        setTimeout(() => {
            const updatedProspect = { ...prospect, notes: notesContent };
            onUpdateProspect(updatedProspect);
            setIsSavingNotes(false);
            setIsNotesDirty(false);
            setSaveNotesStatus('success');
            setTimeout(() => setSaveNotesStatus('idle'), 2000);
        }, 1000);
    };
    
    const handleAddCallLog = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCallLog.outcome) return; // Basic validation

        const log: ContactHistoryItem = {
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            type: 'Call',
            duration: newCallLog.duration,
            outcome: newCallLog.outcome,
            aiInsight: newCallLog.aiInsight,
        };
        const updatedHistory = [...(prospect.contactHistory || []), log];
        onUpdateProspect({ ...prospect, contactHistory: updatedHistory });

        // Reset form
        setNewCallLog({ duration: '', outcome: '', aiInsight: '' });
        setShowCallLogForm(false);
    };

    const handleSaveDeal = (dealToSave: Deal) => {
        setDeals(prevDeals => {
            const existingDeal = prevDeals.find(d => d.id === dealToSave.id);
            if (existingDeal) {
                return prevDeals.map(d => d.id === dealToSave.id ? dealToSave : d);
            } else {
                return [...prevDeals, dealToSave];
            }
        });
        
        // Ensure prospect has the deal ID
        const prospectHasDealId = prospect.dealIds?.includes(dealToSave.id);
        if (!prospectHasDealId) {
            const updatedProspect = {
                ...prospect,
                dealIds: [...(prospect.dealIds || []), dealToSave.id]
            };
            onUpdateProspect(updatedProspect);
        }

        setDealBuilderOpen(false);
        setEditingDeal(null);
    };

    const handleOpenDealBuilder = (deal: Deal | null) => {
        setEditingDeal(deal);
        setDealBuilderOpen(true);
    };
    
    const callLogs = prospect.contactHistory?.filter(item => item.type === 'Call') || [];

    const calculateDealValue = (deal: Deal) => {
        return deal.lineItems.reduce((total, item) => {
            const currentCommissionRate = item.negotiatedCommissionRate ?? item.commissionRate;
            const totalPrice = item.basePrice * (1 + currentCommissionRate);
            const discountRate = item.discountRate ?? 0;
            const discountedPrice = totalPrice * (1 - discountRate);
            return total + discountedPrice;
        }, 0);
    };

    const toggleDealExpansion = (dealId: string) => {
        setExpandedDealId(prevId => (prevId === dealId ? null : dealId));
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {isDealBuilderOpen && (
                <DealBuilderModal
                    onClose={() => setDealBuilderOpen(false)}
                    onSaveDeal={handleSaveDeal}
                    prospect={prospect}
                    products={products}
                    deal={editingDeal}
                />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose}></div>
            <section className={`absolute inset-y-0 right-0 w-full max-w-lg bg-white dark:bg-slate-800 shadow-xl transform transition-transform duration-300 ease-in-out ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-start justify-between">
                        <div className="flex items-center">
                            <div className="h-12 w-12 flex-shrink-0 rounded-full flex items-center justify-center text-white text-xl font-semibold" style={{ backgroundColor: prospect.avatarColor }}>
                                {prospect.initials}
                            </div>
                            <div className="ml-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">{prospect.name}</h2>
                                <p className="text-sm text-gray-500 dark:text-slate-400">{prospect.title} at {prospect.company}</p>
                            </div>
                        </div>
                        <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full"><X className="h-6 w-6" /></button>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 dark:border-slate-700 px-4">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                            <button onClick={() => setActiveTab('intelligence')} className={`flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'intelligence' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}>
                                <Bot className="h-5 w-5 mr-2" /> Intelligence
                            </button>
                            <button onClick={() => setActiveTab('deals')} className={`flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'deals' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}>
                                <Handshake className="h-5 w-5 mr-2" /> Deals
                                {deals.length > 0 && <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200">{deals.length}</span>}
                            </button>
                        </nav>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {activeTab === 'intelligence' && (
                          <>
                            {!prospect.isEnriched ? (
                                <div className="text-center p-8 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg">
                                    <Bot className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500" />
                                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-slate-100">Prospect Not Enriched</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Unlock deep insights by running the AI Research Engine.</p>
                                    <button onClick={handleEnrich} disabled={isEnriching} className="mt-4 inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                                        {isEnriching ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5" />}
                                        {isEnriching ? 'Enriching...' : 'Enrich with AI'}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Section title="AI-Suggested Next Steps" icon={Sparkles}>
                                        {isGeneratingSuggestions ? (
                                            <div className="flex items-center justify-center p-4">
                                                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                                                <span className="ml-2 text-gray-600 dark:text-slate-400">Generating ideas...</span>
                                            </div>
                                        ) : suggestions ? (
                                            <div className="space-y-3">
                                                {suggestions.map((suggestion, index) => (
                                                    <div key={index} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                                        <h4 className="flex items-center font-semibold text-gray-800 dark:text-slate-200">
                                                            <ChevronRight className="h-4 w-4 mr-1.5 text-blue-500 flex-shrink-0" />
                                                            {suggestion.title}
                                                        </h4>
                                                        <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 pl-5">{suggestion.rationale}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleGenerateSuggestions}
                                                className="w-full text-left p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-between"
                                            >
                                                <span className="font-semibold text-blue-600 dark:text-blue-400">Generate Next Best Action</span>
                                                <Wand2 className="h-5 w-5 text-blue-500" />
                                            </button>
                                        )}
                                    </Section>
                                    <Section title="At a Glance" icon={BarChart}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <InfoPill icon={UserCheck} text="Decision Authority" score={prospect.decisionAuthorityScore} maxScore={10} />
                                            <InfoPill icon={Check} text={`Confidence: ${prospect.confidenceScore}`} />
                                            {prospect.linkedInUrl && (
                                               <a href={prospect.linkedInUrl} target="_blank" rel="noopener noreferrer" className="col-span-1 md:col-span-2 flex items-center p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">
                                                    <Link className="h-6 w-6 text-blue-500 mr-3"/>
                                                    View LinkedIn Profile
                                                    <ExternalLink className="h-4 w-4 ml-auto text-gray-400"/>
                                               </a>
                                            )}
                                        </div>
                                    </Section>
                                    <Section title="AI-Powered Insights" icon={Bot}>
                                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-500/30 rounded-lg space-y-4">
                                            <div className="flex">
                                                <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3 mt-0.5"/>
                                                <div>
                                                    <h4 className="font-semibold text-purple-800 dark:text-purple-300">Communication Style</h4>
                                                    <p className="text-sm text-purple-700 dark:text-purple-400">{prospect.aiAnalysis?.communicationStyle}</p>
                                                </div>
                                            </div>
                                             <div className="flex">
                                                <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3 mt-0.5"/>
                                                <div>
                                                    <h4 className="font-semibold text-purple-800 dark:text-purple-300">Key Motivations</h4>
                                                    <ul className="list-disc list-inside text-sm text-purple-700 dark:text-purple-400">
                                                        {prospect.aiAnalysis?.motivations?.map((m, i) => <li key={i}>{m}</li>)}
                                                    </ul>
                                                </div>
                                            </div>
                                             <div className="flex">
                                                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3 mt-0.5"/>
                                                <div>
                                                    <h4 className="font-semibold text-purple-800 dark:text-purple-300">Potential Pain Points</h4>
                                                    <ul className="list-disc list-inside text-sm text-purple-700 dark:text-purple-400">
                                                        {prospect.aiAnalysis?.painPoints?.map((p, i) => <li key={i}>{p}</li>)}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </Section>
                                    <Section title="Company Intelligence" icon={Building}>
                                        <p className="text-sm text-gray-600 dark:text-slate-300 italic">{prospect.companyDetails?.description}</p>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                            <div className="font-semibold text-gray-800 dark:text-slate-200">Industry:</div><div className="text-gray-600 dark:text-slate-400">{prospect.companyDetails?.industry}</div>
                                            <div className="font-semibold text-gray-800 dark:text-slate-200">Revenue:</div><div className="text-gray-600 dark:text-slate-400">{prospect.companyDetails?.revenue} (est.)</div>
                                            <div className="font-semibold text-gray-800 dark:text-slate-200">Employees:</div><div className="text-gray-600 dark:text-slate-400">{prospect.companyDetails?.employeeCount}</div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800 dark:text-slate-200 mt-4 mb-2">Recent News & Signals</h4>
                                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-slate-400">
                                                {prospect.recentNews?.map((item, i) => <li key={i}>{item}</li>)}
                                            </ul>
                                        </div>
                                    </Section>
                                    
                                    <Section title="Call Logs" icon={PhoneCall}>
                                        {!showCallLogForm && (
                                            <button onClick={() => setShowCallLogForm(true)} className="w-full flex items-center justify-center p-2 text-sm font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/50 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900">
                                                <Plus className="h-4 w-4 mr-2" /> Add Call Log
                                            </button>
                                        )}
                                        {showCallLogForm && (
                                            <form onSubmit={handleAddCallLog} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-3">
                                                <h4 className="font-semibold text-md text-gray-800 dark:text-slate-200">New Call Log</h4>
                                                <div>
                                                    <label htmlFor="duration" className="text-sm font-medium">Duration (e.g., 15m)</label>
                                                    <input id="duration" type="text" value={newCallLog.duration} onChange={(e) => setNewCallLog(p => ({...p, duration: e.target.value}))} className="mt-1 w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm"/>
                                                </div>
                                                <div>
                                                    <label htmlFor="outcome" className="text-sm font-medium">Outcome *</label>
                                                    <textarea id="outcome" value={newCallLog.outcome} onChange={(e) => setNewCallLog(p => ({...p, outcome: e.target.value}))} required rows={2} className="mt-1 w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm"></textarea>
                                                </div>
                                                <div>
                                                    <label htmlFor="insight" className="text-sm font-medium">Notes / AI Insight</label>
                                                    <textarea id="insight" value={newCallLog.aiInsight} onChange={(e) => setNewCallLog(p => ({...p, aiInsight: e.target.value}))} rows={2} className="mt-1 w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm"></textarea>
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <button type="button" onClick={() => setShowCallLogForm(false)} className="px-3 py-1.5 text-sm bg-white dark:bg-slate-600 border dark:border-slate-500 rounded-md">Cancel</button>
                                                    <button type="submit" className="px-3 py-1.5 text-sm bg-blue-600 text-white font-semibold rounded-md flex items-center"><Save className="h-4 w-4 mr-2" />Save Log</button>
                                                </div>
                                            </form>
                                        )}
                                        <ul className="space-y-4">
                                            {callLogs.map((item, index) => (
                                                <li key={index} className="flex items-start space-x-4">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                                        <Phone className="h-5 w-5 text-gray-500 dark:text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800 dark:text-slate-200 flex items-center">
                                                            Call on <span className="font-semibold ml-1">{item.date}</span>
                                                            {item.duration && <span className="ml-2 text-xs text-gray-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-600 px-1.5 py-0.5 rounded-full flex items-center"><Clock className="h-3 w-3 mr-1"/>{item.duration}</span>}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-slate-400">{item.outcome}</p>
                                                        {item.aiInsight && (
                                                            <div className="mt-2 flex items-start text-xs text-purple-700 dark:text-purple-400 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-md border border-purple-200 dark:border-purple-500/30">
                                                                <Lightbulb className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                                                                <p className="italic">{item.aiInsight}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </Section>

                                    {prospect.isEnriched && prospect.groundingSources && prospect.groundingSources.length > 0 && (
                                        <Section title="Sources" icon={Link}>
                                            <ul className="list-disc list-inside space-y-1 text-sm">
                                                {prospect.groundingSources.map((source, i) => (
                                                    source.web && <li key={i} className="truncate"><a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{source.web.title || source.web.uri}</a></li>
                                                ))}
                                            </ul>
                                        </Section>
                                    )}
                                    
                                    <Section title="Notes" icon={ClipboardEdit}>
                                        <textarea
                                            value={notesContent}
                                            onChange={handleNotesChange}
                                            rows={5}
                                            className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                            placeholder="Add your private notes here..."
                                        />
                                        <div className="flex justify-end items-center mt-2 h-8">
                                            {isNotesDirty && (
                                                <button
                                                    onClick={handleSaveNotes}
                                                    disabled={isSavingNotes}
                                                    className="inline-flex items-center bg-blue-600 text-white px-3 py-1 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 text-sm transition-colors"
                                                >
                                                    {isSavingNotes && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    {isSavingNotes ? 'Saving...' : 'Save Notes'}
                                                </button>
                                            )}
                                            {saveNotesStatus === 'success' && !isNotesDirty && (
                                                <span className="text-sm text-green-600 flex items-center transition-opacity">
                                                    <Check className="h-4 w-4 mr-1" />
                                                    Saved!
                                                </span>
                                            )}
                                        </div>
                                    </Section>
                                </>
                            )}
                          </>
                        )}
                        {activeTab === 'deals' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                                        Deals ({deals.length})
                                    </h3>
                                    <button
                                        onClick={() => handleOpenDealBuilder(null)}
                                        className="inline-flex items-center bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 text-sm transition-colors"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create New Deal
                                    </button>
                                </div>
                                {deals.length > 0 ? (
                                    <div className="space-y-3">
                                        {deals.map(deal => {
                                            const dealValue = calculateDealValue(deal);
                                            const isExpanded = expandedDealId === deal.id;
                                            
                                            const calculateLineItemMetrics = (item: any) => {
                                                const currentCommissionRate = item.negotiatedCommissionRate ?? item.commissionRate;
                                                const totalPrice = item.basePrice * (1 + currentCommissionRate);
                                                const discountRate = item.discountRate ?? 0;
                                                const finalPrice = totalPrice * (1 - discountRate);
                                                const agentComm = finalPrice - item.basePrice;
                                                return { finalPrice, agentComm, currentCommissionRate, discountRate };
                                            };

                                            return (
                                                <div key={deal.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg border dark:border-slate-600/50 transition-shadow hover:shadow-md">
                                                    <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => toggleDealExpansion(deal.id)}>
                                                        <div className="flex items-center gap-3">
                                                            {isExpanded ? <ChevronDown className="h-5 w-5 text-gray-500" /> : <ChevronRight className="h-5 w-5 text-gray-500" />}
                                                            <div>
                                                                <p className="font-semibold text-gray-800 dark:text-slate-100">{deal.name}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${dealStatusColors[deal.status]}`}>{deal.status}</span>
                                                                <span className="text-xs text-gray-500 dark:text-slate-400">{deal.lineItems.length} line item(s)</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                        <div>
                                                                <p className="text-xs text-gray-500 dark:text-slate-400 text-right">Total Value</p>
                                                                <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{formatCurrency(dealValue)}</p>
                                                        </div>
                                                            <button onClick={(e) => { e.stopPropagation(); handleOpenDealBuilder(deal); }} title="Edit Deal" className="p-2 text-gray-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600">
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {isExpanded && (
                                                        <div className="pb-4 px-4 border-t border-gray-200 dark:border-slate-600">
                                                            <div className="overflow-x-auto mt-3">
                                                            <table className="min-w-full text-sm">
                                                                <thead className="text-xs text-gray-500 dark:text-slate-400 uppercase">
                                                                    <tr>
                                                                        <th className="pb-2 text-left font-medium w-2/5">Product</th>
                                                                        <th className="pb-2 text-left font-medium">Base Price</th>
                                                                        <th className="pb-2 text-left font-medium">Agent Rate</th>
                                                                        <th className="pb-2 text-left font-medium">Discount</th>
                                                                        <th className="pb-2 text-left font-medium">Final Price</th>
                                                                        <th className="pb-2 text-left font-medium">Agent Comm.</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-200 dark:divide-slate-600">
                                                                    {deal.lineItems.map(item => {
                                                                        const { finalPrice, agentComm, currentCommissionRate, discountRate } = calculateLineItemMetrics(item);
                                                                        return (
                                                                            <tr key={item.id}>
                                                                                <td className="py-2 font-medium text-gray-800 dark:text-slate-200">{item.name}</td>
                                                                                <td className="py-2 text-gray-600 dark:text-slate-300">{formatCurrency(item.basePrice)}</td>
                                                                                <td className="py-2 text-gray-600 dark:text-slate-300">{(currentCommissionRate * 100).toFixed(0)}%</td>
                                                                                <td className="py-2 text-gray-600 dark:text-slate-300">{(discountRate * 100).toFixed(0)}%</td>
                                                                                <td className="py-2 font-semibold text-green-600">{formatCurrency(finalPrice)}</td>
                                                                                <td className={`py-2 font-medium ${agentComm < 0 ? 'text-red-500' : 'text-gray-800 dark:text-slate-200'}`}>{formatCurrency(agentComm)}</td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                                        <DollarSign className="mx-auto h-10 w-10 text-gray-400"/>
                                        <p className="mt-2 font-semibold">No deals yet</p>
                                        <p className="text-sm text-gray-500">Create a new deal to start tracking sales opportunities.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center">
                        <p className="text-xs text-gray-500 dark:text-slate-400">Data sources: Gemini AI, Google Search</p>
                        {prospect.isEnriched && (
                             <button onClick={handleEnrich} disabled={isEnriching} className="inline-flex items-center bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 text-sm transition-colors">
                                {isEnriching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                                {isEnriching ? 'Refreshing...' : 'Refresh Data'}
                            </button>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ProspectIntelligencePanel;