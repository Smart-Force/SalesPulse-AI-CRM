import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Telescope, Search, Loader2, Globe, Briefcase, Building, Bot, Wand2, Copy, Check, Mail, Linkedin, Users, Hash, UserPlus, ExternalLink, Phone, ChevronDown, ChevronRight, BarChart, Link, Download } from 'lucide-react';
import type { ResearchResult, Prospect, ConfidenceScore } from '../types';
import { findCompaniesAndExecutives, generateOutreachPlan } from '../services/aiService';

interface LeadGenerationProps {
    onAddProspects: (prospects: Prospect[]) => void;
    prospects: Prospect[];
}

const copyToClipboard = (text: string, onCopy: () => void) => {
    navigator.clipboard.writeText(text).then(() => {
        onCopy();
    });
};

const OutreachContent: React.FC<{ title: string; content?: string; icon: React.ElementType }> = ({ title, content, icon: Icon }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!content) return;
        copyToClipboard(content, () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
            <div className="flex justify-between items-center mb-1">
                <h4 className="flex items-center text-sm font-semibold text-gray-800 dark:text-slate-200">
                    <Icon className="h-4 w-4 mr-2 text-blue-500" />
                    {title}
                </h4>
                <button
                    onClick={handleCopy}
                    disabled={!content}
                    className="p-1.5 rounded-md text-gray-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
                >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-300 whitespace-pre-wrap">{content || '...'}</p>
        </div>
    );
};

export const LeadGeneration: React.FC<LeadGenerationProps> = ({ onAddProspects, prospects }) => {
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<ResearchResult[]>([]);
    const [searchSources, setSearchSources] = useState<any[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

    const [searchCriteria, setSearchCriteria] = useState({
        city: 'Riyadh',
        companySize: 'SMEs',
        industry: 'Technology',
        count: 5,
        executiveLevel: 'C-Level'
    });

    const isAllSelected = useMemo(() => searchResults.length > 0 && selectedIds.length === searchResults.length, [searchResults, selectedIds]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSearchCriteria(prev => ({ ...prev, [name]: name === 'count' ? parseInt(value, 10) : value }));
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        setHasSearched(true);
        setSearchResults([]);
        setSelectedIds([]);
        setExpandedRowId(null);
        setSearchSources([]);
        try {
            const { results, sources } = await findCompaniesAndExecutives(
                searchCriteria.city,
                searchCriteria.companySize,
                searchCriteria.industry,
                searchCriteria.count,
                searchCriteria.executiveLevel
            );
            setSearchResults(results.map(r => ({ ...r, id: crypto.randomUUID() })));
            setSearchSources(sources);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };
    
    const mapConfidence = (score: number): ConfidenceScore => {
        if (score >= 9) return 'High';
        if (score >= 8) return 'Medium';
        return 'Low';
    };

    const handleAddSelectedToProspects = () => {
        const selectedResults = searchResults.filter(r => selectedIds.includes(r.id));

        const existingEmails = new Set(prospects.map(p => p.email.toLowerCase()));
        const seenEmailsInSelection = new Set<string>();

        const newUniqueResults = selectedResults.filter(result => {
            const resultEmailLower = result.executiveEmail.toLowerCase();
            if (existingEmails.has(resultEmailLower) || seenEmailsInSelection.has(resultEmailLower)) {
                return false;
            }
            seenEmailsInSelection.add(resultEmailLower);
            return true;
        });

        if (newUniqueResults.length === 0) {
            alert('No new prospects to add. All selected leads are either duplicates of existing prospects or duplicates within the selection.');
            return;
        }

        const newProspects: Prospect[] = newUniqueResults.map(r => {
            const initials = r.executiveName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            return {
                id: crypto.randomUUID(),
                name: r.executiveName,
                company: r.companyName,
                email: r.executiveEmail,
                phone: r.directPhone || r.mainPhone,
                title: r.executivePosition,
                status: 'New',
                lastContact: 'Just added',
                lastContactDate: new Date(),
                tags: [],
                isEnriched: false, // Mark as false initially, full enrichment is a separate step
                confidenceScore: mapConfidence(r.dataConfidenceScore),
                initials,
                avatarColor: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
                companyDetails: {
                    industry: r.industry,
                    revenue: r.annualRevenue,
                    employeeCount: r.employeeCount,
                    description: '', // This will be filled by full enrichment
                },
                linkedInUrl: r.linkedInProfile,
                aiAnalysis: undefined,
                contactHistory: [],
                notes: `Added from Lead Generation research.\nSource: ${r.companyName} website (${r.website})`,
            };
        });
        
        const duplicateCount = selectedResults.length - newUniqueResults.length;
        let confirmationMessage = `You are about to add ${newProspects.length} new prospect(s).`;
        if (duplicateCount > 0) {
            confirmationMessage += ` ${duplicateCount} duplicate(s) were ignored.`;
        }
        confirmationMessage += " Proceed?";
        
        if (window.confirm(confirmationMessage)) {
             onAddProspects(newProspects);
             setSelectedIds([]);
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(searchResults.map(p => p.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const handleGenerateOutreach = async (prospectId: string) => {
        setSearchResults(prev => prev.map(p => p.id === prospectId ? { ...p, isGeneratingOutreach: true } : p));

        const prospect = searchResults.find(p => p.id === prospectId);
        if (!prospect) return;

        try {
            const { plan, sources } = await generateOutreachPlan(prospect);
            setSearchResults(prev => prev.map(p =>
                p.id === prospectId ? {
                    ...p,
                    ...plan,
                    isGeneratingOutreach: false,
                    isOutreachGenerated: true,
                    outreachSources: sources,
                } : p
            ));
        } catch (error) {
            console.error(error);
            setSearchResults(prev => prev.map(p => p.id === prospectId ? { ...p, isGeneratingOutreach: false } : p));
        }
    };

    const toggleExpandRow = (id: string) => {
        setExpandedRowId(prev => prev === id ? null : id);
    };

    const handleExport = () => {
        const headers = Object.keys(searchResults[0] || {}).filter(key => !['isGeneratingOutreach', 'isOutreachGenerated', 'outreachSources', 'id'].includes(key));
        const csvContent = [
            headers.join(','),
            ...searchResults.map(row => 
                headers.map(header => {
                    const value = (row as any)[header];
                    if (typeof value === 'string') {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    if (Array.isArray(value)) {
                        return `"${value.join('|').replace(/"/g, '""')}"`;
                    }
                    return value;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "lead_generation_results.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Advanced Market Researcher</h1>
                <p className="mt-1 text-gray-600 dark:text-slate-400">AI-powered deep research and sales enablement engine.</p>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center"><Telescope className="mr-2 h-6 w-6 text-blue-600" /> Research New Prospects</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                            {/* Form Inputs */}
                            <div className="lg:col-span-1">
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">City/Region</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input type="text" id="city" name="city" value={searchCriteria.city} onChange={handleInputChange} required className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Industry</label>
                                 <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input type="text" id="industry" name="industry" value={searchCriteria.industry} onChange={handleInputChange} required className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Company Size</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <select id="companySize" name="companySize" value={searchCriteria.companySize} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200">
                                        <option>Startups</option>
                                        <option>SMEs</option>
                                        <option>Large Enterprises</option>
                                        <option>All Sizes</option>
                                    </select>
                                </div>
                            </div>
                             <div>
                                <label htmlFor="executiveLevel" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Executive Level</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <select id="executiveLevel" name="executiveLevel" value={searchCriteria.executiveLevel} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200">
                                        <option>C-Level</option>
                                        <option>VP-Level</option>
                                        <option>Director-Level</option>
                                        <option>Manager-Level</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="count" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"># of Companies</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input type="number" id="count" name="count" value={searchCriteria.count} onChange={handleInputChange} min="1" max="15" required className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" />
                                </div>
                            </div>
                            <button type="submit" disabled={isSearching} className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                {isSearching ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Search className="mr-2 h-5 w-5" />}
                                {isSearching ? 'Researching...' : 'Start Research'}
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
            
            {isSearching && (
                <div className="text-center py-16">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-500" />
                    <p className="mt-4 text-lg font-medium text-gray-600 dark:text-slate-400">Conducting deep market research...</p>
                    <p className="text-sm text-gray-500">This may take a moment.</p>
                </div>
            )}

            {hasSearched && !isSearching && (
                <>
                {searchSources.length > 0 && (
                    <Card className="mb-4">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center"><Link className="h-4 w-4 mr-2"/>Sources</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside space-y-1 text-sm columns-2">
                                {searchSources.map((source, i) => source.web && (
                                    <li key={i} className="truncate"><a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{source.web.title}</a></li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}
                <Card>
                    <CardHeader className="p-4 border-b border-gray-200 dark:border-slate-700 min-h-[60px] flex justify-between items-center">
                        <CardTitle className="text-lg">Master Data Table ({searchResults.length} Results)</CardTitle>
                        {selectedIds.length > 0 ? (
                           <button onClick={handleAddSelectedToProspects} className="bg-green-600 text-white font-semibold py-1.5 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center shadow-sm text-sm">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add {selectedIds.length} to Prospects
                            </button>
                        ) : (
                             <button onClick={handleExport} disabled={searchResults.length === 0} className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 font-semibold py-1.5 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors flex items-center shadow-sm text-sm disabled:opacity-50">
                                <Download className="h-4 w-4 mr-2" />
                                Export Results
                            </button>
                        )}
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                                <thead className="bg-gray-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th scope="col" className="p-4"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={isAllSelected} onChange={handleSelectAll} /></th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Company</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Executive</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Details</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Confidence</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                    {searchResults.map((prospect) => (
                                        <React.Fragment key={prospect.id}>
                                            <tr onClick={() => toggleExpandRow(prospect.id)} className={`${selectedIds.includes(prospect.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''} hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer`}>
                                                <td className="p-4" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={selectedIds.includes(prospect.id)} onChange={() => handleSelectOne(prospect.id)} /></td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-slate-100">{prospect.companyName}</div>
                                                    <a href={prospect.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-blue-500 hover:underline flex items-center">{prospect.website.replace(/https?:\/\//, '')}<ExternalLink className="h-3 w-3 ml-1"/></a>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-slate-100">{prospect.executiveName}</div>
                                                    <div className="text-xs text-gray-500 dark:text-slate-400">{prospect.executivePosition}</div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-300">
                                                    <div className="flex items-center text-xs"><Mail className="h-3 w-3 mr-1.5 text-gray-400"/> {prospect.executiveEmail}</div>
                                                    <div className="flex items-center text-xs mt-1"><Phone className="h-3 w-3 mr-1.5 text-gray-400"/> {prospect.directPhone || prospect.mainPhone}</div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-slate-400">
                                                    <div>Industry: {prospect.industry}</div>
                                                    <div>Employees: {prospect.employeeCount}</div>
                                                    <div>Revenue: {prospect.annualRevenue}</div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <BarChart className="h-4 w-4 mr-2 text-gray-400"/>
                                                        <span className="text-sm font-semibold text-gray-700 dark:text-slate-200">{prospect.dataConfidenceScore}/10</span>
                                                        <div className="ml-auto pl-2 text-gray-400">
                                                           {expandedRowId === prospect.id ? <ChevronDown className="h-5 w-5"/> : <ChevronRight className="h-5 w-5"/>}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedRowId === prospect.id && (
                                                <tr className="bg-slate-50 dark:bg-slate-800/50">
                                                    <td colSpan={6} className="p-4">
                                                        {!prospect.isOutreachGenerated ? (
                                                            <div className="flex flex-col items-center justify-center p-4 text-center">
                                                                <button
                                                                    onClick={() => handleGenerateOutreach(prospect.id)}
                                                                    disabled={prospect.isGeneratingOutreach}
                                                                    className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 text-sm transition-colors"
                                                                >
                                                                    {prospect.isGeneratingOutreach ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                                                    {prospect.isGeneratingOutreach ? 'Generating...' : 'Generate Outreach Plan'}
                                                                </button>
                                                                <p className="text-xs text-gray-500 mt-2">Generate AI-powered talking points and personalized messages for this lead.</p>
                                                            </div>
                                                        ) : (
                                                          <>
                                                            {prospect.outreachSources && prospect.outreachSources.length > 0 && (
                                                                <div className="mb-4">
                                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1 flex items-center"><Link className="h-4 w-4 mr-2" />Sources used for this plan:</h4>
                                                                    <ul className="list-disc list-inside text-xs columns-2">
                                                                        {prospect.outreachSources.map((source, i) => source.web && (
                                                                            <li key={i} className="truncate"><a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{source.web.title}</a></li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                                <div className="space-y-4">
                                                                    <div>
                                                                        <h3 className="flex items-center text-md font-semibold text-gray-900 dark:text-slate-100 mb-2"><Bot className="h-5 w-5 mr-2 text-purple-500" /> Company Analysis & Talking Points</h3>
                                                                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 p-3 rounded-md">
                                                                            {prospect.talkingPoints?.map((point, i) => <li key={i}>{point}</li>)}
                                                                        </ul>
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="font-semibold text-md text-gray-900 dark:text-slate-100 mb-2">Recommended Products</h3>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {prospect.recommendedProducts?.map((prod, i) => (<span key={i} className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">{prod}</span>))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-4">
                                                                    <OutreachContent title="Personalized Email" content={prospect.personalizedEmail} icon={Mail} />
                                                                    <OutreachContent title="LinkedIn Message 1 (Connect)" content={prospect.linkedinMessage1} icon={Linkedin} />
                                                                    <OutreachContent title="LinkedIn Message 2 (Follow-up)" content={prospect.linkedinMessage2} icon={Linkedin} />
                                                                    <OutreachContent title="LinkedIn Message 3 (Follow-up)" content={prospect.linkedinMessage3} icon={Linkedin} />
                                                                </div>
                                                            </div>
                                                          </>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
                </>
            )}
        </div>
    );
};
