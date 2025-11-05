import React, { useState, useEffect } from 'react';
import type { Prospect, ConfidenceScore, ContactHistoryItem } from '../types';
import { X, Bot, Zap, Building, BarChart, UserCheck, MessageSquare, Lightbulb, TrendingUp, Link, Loader2, Check, ExternalLink, BookUser, Mail, Phone, Calendar, Sparkles, ChevronRight, Wand2, ClipboardEdit } from 'lucide-react';
import { generateProspectIntelligence, generateNextSteps } from '../services/geminiService';

interface PanelProps {
  prospect: Prospect;
  onClose: () => void;
  onUpdateProspect: (updatedProspect: Prospect) => void;
}

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

const ProspectIntelligencePanel: React.FC<PanelProps> = ({ prospect, onClose, onUpdateProspect }) => {
    const [isPanelOpen, setPanelOpen] = useState(false);
    const [isEnriching, setIsEnriching] = useState(false);
    const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
    const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
    const [notesContent, setNotesContent] = useState(prospect.notes || '');
    const [isNotesDirty, setIsNotesDirty] = useState(false);
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [saveNotesStatus, setSaveNotesStatus] = useState<'idle' | 'success'>('idle');


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

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
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

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
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

                                {prospect.isEnriched && prospect.groundingSources && prospect.groundingSources.length > 0 && (
                                    <Section title="Sources" icon={Link}>
                                        <ul className="list-disc list-inside space-y-1 text-sm">
                                            {prospect.groundingSources.map((source, i) => (
                                                source.web && <li key={i} className="truncate"><a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{source.web.title || source.web.uri}</a></li>
                                            ))}
                                        </ul>
                                    </Section>
                                )}
                                
                                {prospect.contactHistory && prospect.contactHistory.length > 0 && (
                                    <Section title="Contact History" icon={BookUser}>
                                        <ul className="space-y-4">
                                            {prospect.contactHistory.map((item, index) => {
                                                const Icon = interactionIcons[item.type];
                                                return (
                                                    <li key={index} className="flex items-start space-x-4">
                                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                                            <Icon className="h-5 w-5 text-gray-500 dark:text-slate-400" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800 dark:text-slate-200">
                                                                {item.type} on <span className="font-semibold">{item.date}</span>
                                                            </p>
                                                            <p className="text-sm text-gray-600 dark:text-slate-400">{item.outcome}</p>
                                                            {item.aiInsight && (
                                                                <div className="mt-2 flex items-start text-xs text-purple-700 dark:text-purple-400 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-md border border-purple-200 dark:border-purple-500/30">
                                                                    <Sparkles className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                                                                    <p className="italic">{item.aiInsight}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </li>
                                                );
                                            })}
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