import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import type { AIProvider, ApiKeys, User } from '../../types';
import { BrainCircuit, Beaker, Bot, Cloud, Feather, Eye, EyeOff, AlertTriangle, Key } from 'lucide-react';

interface AIProviderSettingsProps {
    currentProvider: AIProvider;
    onProviderChange: (provider: AIProvider) => void;
    currentUser: User;
    apiKeys: ApiKeys;
    onApiKeysSave: (keys: ApiKeys) => void;
}

const providers = [
    { value: 'gemini' as AIProvider, title: 'Google Gemini (Recommended)', description: "The default, full-power provider. Uses real-time Google Search for lead generation and enrichment, providing the most accurate and up-to-date information. This option consumes API tokens.", icon: BrainCircuit, disabled: false },
    { value: 'glm' as AIProvider, title: 'GLM (Zhipu AI)', description: "An alternative powerful model. Currently uses a mock service for demonstration and testing purposes. Can be configured with a real API key in the future.", icon: Bot, disabled: false },
    { value: 'openai' as AIProvider, title: 'OpenAI (GPT Models)', description: "Integrate with OpenAI's powerful GPT models. Requires a separate OpenAI API key. This feature is planned for a future release.", icon: Cloud, disabled: true },
    { value: 'anthropic' as AIProvider, title: 'Anthropic (Claude Models)', description: "Leverage Anthropic's Claude models for content generation. Requires a separate Anthropic API key. This feature is planned for a future release.", icon: Feather, disabled: true },
    { value: 'mock' as AIProvider, title: 'Mock Provider (Cost-Free Testing)', description: "A simulated AI that returns realistic-looking fake data instantly. Perfect for development, testing UI, or demonstrating features without consuming any API tokens. Does not use real-world data.", icon: Beaker, disabled: false },
];

const keyConfig: { provider: AIProvider, label: string }[] = [
    { provider: 'gemini', label: 'Google Gemini API Key' },
    { provider: 'glm', label: 'GLM (Zhipu AI) API Key' },
];

const ProviderOption: React.FC<{
    value: AIProvider; title: string; description: string; icon: React.ElementType; currentProvider: AIProvider; onProviderChange: (provider: AIProvider) => void; disabled?: boolean;
}> = ({ value, title, description, icon: Icon, currentProvider, onProviderChange, disabled = false }) => (
    <div
        onClick={() => !disabled && onProviderChange(value)}
        className={`p-4 rounded-lg border-2 transition-all ${
            currentProvider === value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-slate-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50' : 'cursor-pointer hover:border-gray-400 dark:hover:border-slate-500'}`}
    >
        <div className="flex items-center">
            <input type="radio" name="ai-provider" value={value} checked={currentProvider === value} onChange={() => !disabled && onProviderChange(value)} disabled={disabled} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
            <div className="ml-3 flex items-center">
                <Icon className="h-6 w-6 mr-3 text-gray-700 dark:text-slate-300" />
                <span className="text-md font-semibold text-gray-900 dark:text-slate-100">{title}</span>
                {disabled && <span className="ml-2 text-xs font-semibold text-gray-500 bg-gray-200 dark:bg-slate-700 dark:text-slate-400 px-2 py-0.5 rounded-full">Coming Soon</span>}
            </div>
        </div>
        <p className="mt-2 ml-10 text-sm text-gray-600 dark:text-slate-400">{description}</p>
    </div>
);

export const AIProviderSettings: React.FC<AIProviderSettingsProps> = ({ currentProvider, onProviderChange, currentUser, apiKeys, onApiKeysSave }) => {
    const [localKeys, setLocalKeys] = useState<ApiKeys>(apiKeys);
    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

    const handleKeyChange = (provider: AIProvider, value: string) => {
        setLocalKeys(prev => ({ ...prev, [provider]: value }));
    };

    const toggleShowKey = (provider: AIProvider) => {
        setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
    };
    
    const handleSave = () => {
        onApiKeysSave(localKeys);
    };
    
    const hasAdminRights = currentUser.role === 'Admin' || currentUser.role === 'Super Admin';

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>AI Provider Selection</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Select the AI service to power this application's intelligent features.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {providers.map(p => (
                        <ProviderOption key={p.value} {...p} currentProvider={currentProvider} onProviderChange={onProviderChange} />
                    ))}
                </CardContent>
            </Card>

            {hasAdminRights ? (
                <Card>
                    <CardHeader>
                        <CardTitle>API Key Configuration</CardTitle>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Manage the API keys for the AI providers. These are stored securely in your browser.</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {keyConfig.map(({ provider, label }) => (
                            <div key={provider}>
                                <label htmlFor={`${provider}-key`} className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{label}</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        id={`${provider}-key`}
                                        type={showKeys[provider] ? 'text' : 'password'}
                                        value={localKeys[provider] || ''}
                                        onChange={(e) => handleKeyChange(provider, e.target.value)}
                                        className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"
                                        placeholder="Enter your API key"
                                    />
                                    <button type="button" onClick={() => toggleShowKey(provider)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400">
                                        {showKeys[provider] ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="border-t dark:border-slate-700 pt-6 flex justify-end">
                        <button onClick={handleSave} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                            Save API Keys
                        </button>
                    </CardFooter>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>API Key Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-lg border border-yellow-200 dark:border-yellow-500/30">
                            <AlertTriangle className="h-5 w-5 mr-3" />
                            <p className="text-sm font-medium">API key configuration is restricted to Admin and Super Admin roles.</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
