import React, { useState } from 'react';
import { generateContent } from '../services/geminiService';
import type { GeneratorFormState } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Mail, MessageSquare, Sparkles, Wand2, Loader2 } from 'lucide-react';

const generatorOptions = [
  { type: 'email', name: 'Email Template', description: 'Generate a full email template.', icon: Mail, bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
  { type: 'subject', name: 'Subject Line', description: 'Generate catchy subject lines.', icon: Sparkles, bgColor: 'bg-green-100', iconColor: 'text-green-600' },
  { type: 'followup', name: 'Follow-up Message', description: 'Craft a compelling follow-up.', icon: MessageSquare, bgColor: 'bg-purple-100', iconColor: 'text-purple-600' },
];

export const AIGenerator: React.FC = () => {
  const [selectedGenerator, setSelectedGenerator] = useState<string | null>('email');
  const [formData, setFormData] = useState<GeneratorFormState>({
    recipient: 'Jane Doe, Marketing Director at InnovateCorp',
    purpose: 'Introduce our new AI-powered analytics platform and schedule a brief 15-minute demo.',
    tone: 'Professional',
    keyPoints: 'Key features: real-time insights, predictive analytics, 30% cost saving for similar companies.',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    if (!selectedGenerator) return;
    setIsGenerating(true);
    setGeneratedContent('');
    try {
      const content = await generateContent(selectedGenerator, formData);
      setGeneratedContent(content);
    } catch (error) {
      console.error(error);
      setGeneratedContent('An error occurred while generating content.');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentGenerator = generatorOptions.find(opt => opt.type === selectedGenerator);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">AI Content Generator</h1>
        <p className="mt-1 text-gray-600 dark:text-slate-400">Generate personalized sales content with Gemini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {generatorOptions.map((option) => (
          <div
            key={option.type}
            onClick={() => setSelectedGenerator(option.type)}
            className={`p-6 rounded-lg shadow cursor-pointer transition-all duration-300 dark:bg-slate-800 ${
              selectedGenerator === option.type ? 'ring-2 ring-blue-500 scale-105 bg-white dark:bg-slate-700' : 'bg-white hover:shadow-lg dark:hover:bg-slate-700'
            }`}
          >
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${option.bgColor} mb-4`}>
              <option.icon className={`h-6 w-6 ${option.iconColor}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">{option.name}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">{option.description}</p>
          </div>
        ))}
      </div>

      {selectedGenerator && (
        <Card className="transition-all duration-500">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Wand2 className="mr-2 h-6 w-6 text-blue-600" />
              {currentGenerator?.name} Generator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Recipient</label>
                  <input type="text" id="recipient" name="recipient" value={formData.recipient} onChange={handleInputChange} placeholder="e.g., John Doe, CEO at Tech Solutions" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" />
                </div>
                <div>
                  <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Purpose</label>
                  <textarea id="purpose" name="purpose" value={formData.purpose} onChange={handleInputChange} rows={3} placeholder="e.g., Introduce our product, Schedule a demo" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"></textarea>
                </div>
                <div>
                  <label htmlFor="tone" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Tone</label>
                  <select id="tone" name="tone" value={formData.tone} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200">
                    <option>Professional</option>
                    <option>Friendly</option>
                    <option>Casual</option>
                    <option>Formal</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="keyPoints" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Key Points (Optional)</label>
                  <textarea id="keyPoints" name="keyPoints" value={formData.keyPoints} onChange={handleInputChange} rows={3} placeholder="e.g., Highlight competitive pricing, Mention 24/7 support" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"></textarea>
                </div>
                <div className="flex justify-end">
                  <button onClick={handleGenerate} disabled={isGenerating} className="inline-flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                    {isGenerating ? 'Generating...' : 'Generate Content'}
                  </button>
                </div>
              </div>
              
              <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg min-h-[300px]">
                <h4 className="text-md font-medium text-gray-900 dark:text-slate-100 mb-2">Generated Content</h4>
                <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-white dark:bg-slate-800 rounded-md h-full overflow-y-auto">
                  {isGenerating ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-500 dark:text-slate-400">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
                        <p className="mt-2">Generating with Gemini...</p>
                      </div>
                    </div>
                  ) : (
                    generatedContent ? <div dangerouslySetInnerHTML={{ __html: generatedContent }} /> : <p className="text-gray-400 dark:text-slate-500">Your generated content will appear here.</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};