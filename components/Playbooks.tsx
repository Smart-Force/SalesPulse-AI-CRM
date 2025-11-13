import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { BookOpen, ChevronRight } from 'lucide-react';
import { playbooks } from '../data/playbooks';
import type { Playbook } from '../types';

export const Playbooks: React.FC = () => {
    const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook>(playbooks[0]);

    const categories = [...new Set(playbooks.map(p => p.category))];

    return (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Sales Playbooks</h1>
                <p className="mt-1 text-gray-600 dark:text-slate-400">Your team's central knowledge base for sales strategies, objection handling, and best practices.</p>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-12rem)]">
                {/* Sidebar */}
                <aside className="w-full lg:w-1/3 xl:w-1/4 flex-shrink-0">
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle>Categories</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow overflow-y-auto">
                            <nav className="space-y-4">
                                {categories.map(category => (
                                    <div key={category}>
                                        <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider mb-2 px-2">{category}</h3>
                                        <div className="space-y-1">
                                            {playbooks.filter(p => p.category === category).map(playbook => (
                                                <button 
                                                    key={playbook.id}
                                                    onClick={() => setSelectedPlaybook(playbook)}
                                                    className={`w-full text-left flex items-center justify-between p-2 rounded-md text-sm font-medium transition-colors ${
                                                        selectedPlaybook.id === playbook.id
                                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                                            : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50'
                                                    }`}
                                                >
                                                    <div className="flex items-center">
                                                        <BookOpen className="h-4 w-4 mr-3 flex-shrink-0" />
                                                        <span>{playbook.title}</span>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </nav>
                        </CardContent>
                    </Card>
                </aside>

                {/* Main Content */}
                <main className="w-full lg:w-2/3 xl:w-3/4">
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-2xl">{selectedPlaybook.title}</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-slate-400">{selectedPlaybook.description}</p>
                        </CardHeader>
                        <CardContent className="flex-grow overflow-y-auto">
                           <div 
                                className="prose prose-blue dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: selectedPlaybook.content }}
                            />
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
};