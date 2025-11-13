import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Wand2, Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { generateAdHocContent } from '../services/aiService';
import { useToasts } from '../contexts/ToastContext';

const contentTypes = ['Sales Email', 'LinkedIn Post', 'Follow-up Message', 'Objection Response', 'Value Proposition'];

export const AIGenerator: React.FC = () => {
    const [contentType, setContentType] = useState(contentTypes[0]);
    const [prompt, setPrompt] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const { addToast } = useToasts();

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            addToast('Please enter a prompt.', 'error');
            return;
        }
        setIsLoading(true);
        setGeneratedContent('');
        try {
            const content = await generateAdHocContent(contentType, prompt);
            setGeneratedContent(content);
        } catch (error) {
            console.error(error);
            addToast('Failed to generate content. See console for details.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!generatedContent) return;
        navigator.clipboard.writeText(generatedContent).then(() => {
            setIsCopied(true);
            addToast('Content copied to clipboard!', 'success');
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">AI Content Generator</h1>
                <p className="mt-1 text-gray-600 dark:text-slate-400">Craft any piece of sales content you need, on the fly.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><Wand2 className="mr-2 h-6 w-6 text-blue-600" /> Create Your Content</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label htmlFor="contentType" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Content Type</label>
                            <select 
                                id="contentType"
                                value={contentType}
                                onChange={(e) => setContentType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"
                            >
                                {contentTypes.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                        <div>
                             <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Your Prompt</label>
                             <textarea 
                                id="prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={8}
                                placeholder={`e.g., "Write a short, friendly follow-up email to a prospect who missed our scheduled demo. Mention that we can reschedule at their convenience."`}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"
                             />
                        </div>
                        <button 
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center shadow-sm disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                            {isLoading ? 'Generating...' : 'Generate Content'}
                        </button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle className="flex items-center">Generated Content</CardTitle>
                        <button 
                            onClick={handleCopy}
                            disabled={!generatedContent || isLoading}
                            className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold py-1.5 px-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center shadow-sm text-sm disabled:opacity-50"
                        >
                            {isCopied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                            {isCopied ? 'Copied!' : 'Copy'}
                        </button>
                    </CardHeader>
                    <CardContent>
                        <div 
                            className="prose prose-sm dark:prose-invert max-w-none p-4 bg-slate-50 dark:bg-slate-800/50 rounded-md border dark:border-slate-200 dark:border-slate-700 min-h-[200px] whitespace-pre-wrap"
                        >
                            {isLoading 
                                ? 'Generating...' 
                                : generatedContent || <p className="text-center text-slate-500">Your AI-generated content will appear here.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};