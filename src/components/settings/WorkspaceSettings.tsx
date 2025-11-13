import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../components/ui/Card';
import type { AIProvider, ApiKeys, User } from '../../types';
import { BrainCircuit, Beaker, Bot, Eye, EyeOff, Key, Download, AlertTriangle, CreditCard } from 'lucide-react';
import { useToasts } from '../../contexts/ToastContext';
import { usePermissions } from '../../contexts/PermissionContext';

const providers = [
    { value: 'gemini' as AIProvider, title: 'Google Gemini (Recommended)', description: "Full-power provider using real-time search.", icon: BrainCircuit },
    { value: 'glm' as AIProvider, title: 'GLM (Zhipu AI)', description: "Alternative model, currently using a mock service.", icon: Bot },
    { value: 'mock' as AIProvider, title: 'Mock Provider (Cost-Free Testing)', description: "Simulated AI for development and demos.", icon: Beaker },
];
const keyConfig: { provider: AIProvider, label: string }[] = [
    { provider: 'gemini', label: 'Google Gemini API Key' },
    { provider: 'glm', label: 'GLM (Zhipu AI) API Key' },
];
const invoices = [
  { id: 'INV-2024-003', date: 'July 1, 2024', amount: '$99.00' },
  { id: 'INV-2024-002', date: 'June 1, 2024', amount: '$99.00' },
];

interface WorkspaceSettingsProps {
    currentProvider: AIProvider;
    onProviderChange: (provider: AIProvider) => void;
    currentUser: User;
    apiKeys: ApiKeys;
    setApiKeys: (keys: ApiKeys) => void;
    onLogout: () => void;
}

export const SettingsWorkspace: React.FC<WorkspaceSettingsProps> = ({ currentProvider, onProviderChange, apiKeys, setApiKeys, onLogout, currentUser }) => {
    const { addToast } = useToasts();
    const [localKeys, setLocalKeys] = useState<ApiKeys>(apiKeys);
    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
    const [activeTab, setActiveTab] = useState<'ai' | 'billing' | 'account'>('ai');
    
    const { view: canViewAI, edit: canEditAI } = usePermissions('Settings - AI Provider');
    const { view: canViewBilling } = usePermissions('Settings - Billing');

    const handleKeyChange = (provider: AIProvider, value: string) => setLocalKeys(prev => ({ ...prev, [provider]: value }));
    const toggleShowKey = (provider: AIProvider) => setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
    
    const handleSaveKeys = () => {
        setApiKeys(localKeys);
        addToast('API Keys saved successfully!', 'success');
    };
    
    const handleDeleteWorkspace = () => {
        if (window.confirm('Are you absolutely sure? This action is permanent and cannot be undone.')) {
            addToast('Workspace deleted (simulation).', 'error');
            onLogout();
        }
    };
    
    const canDeleteWorkspace = currentUser.role === 'Super Admin' || currentUser.role === 'Admin';

    return (
        <Card>
             <CardHeader className="border-b dark:border-slate-700 p-0">
                <div className="flex items-center px-6">
                    {canViewAI && <button onClick={() => setActiveTab('ai')} className={`flex items-center gap-2 py-3 border-b-2 text-sm font-medium ${activeTab === 'ai' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><Bot className="h-5 w-5" /> AI Provider</button>}
                    {canViewBilling && <button onClick={() => setActiveTab('billing')} className={`flex items-center gap-2 py-3 ml-6 border-b-2 text-sm font-medium ${activeTab === 'billing' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><CreditCard className="h-5 w-5" /> Billing</button>}
                    <button onClick={() => setActiveTab('account')} className={`flex items-center gap-2 py-3 ml-6 border-b-2 text-sm font-medium ${activeTab === 'account' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Account</button>
                </div>
            </CardHeader>
            
            {activeTab === 'ai' && canViewAI && (
                <>
                    <CardContent className="pt-6 space-y-6">
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-slate-100 mb-2">Provider Selection</h3>
                            <div className="space-y-2">
                                {providers.map(p => (
                                    <div key={p.value} onClick={() => canEditAI && onProviderChange(p.value)} className={`p-3 rounded-lg border-2 transition-colors ${currentProvider === p.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-700'} ${!canEditAI ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-gray-400 dark:hover:border-slate-600'}`}>
                                        <div className="flex items-center">
                                            <input type="radio" name="ai-provider" value={p.value} checked={currentProvider === p.value} onChange={() => onProviderChange(p.value)} disabled={!canEditAI} className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                                            <div className="ml-3 flex items-center">
                                                <p.icon className="h-5 w-5 mr-2 text-gray-700 dark:text-slate-300" /> 
                                                <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">{p.title}</span>
                                            </div>
                                        </div>
                                         <p className="mt-1 ml-9 text-xs text-gray-600 dark:text-slate-400">{p.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {canEditAI && (
                            <div className="border-t dark:border-slate-600 pt-6">
                                <h3 className="font-medium text-gray-900 dark:text-slate-100 mb-2">API Keys</h3>
                                {keyConfig.map(({ provider, label }) => (
                                    <div key={provider} className="mt-4">
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-300">{label}</label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input type={showKeys[provider] ? 'text' : 'password'} value={localKeys[provider] || ''} onChange={e => handleKeyChange(provider, e.target.value)} className="w-full pl-10 pr-10 py-2 border rounded-lg bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-200" placeholder="Enter API key" />
                                            <button type="button" onClick={() => toggleShowKey(provider)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400">{showKeys[provider] ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                    {canEditAI && <CardFooter className="pt-0 flex justify-end"><button onClick={handleSaveKeys} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">Save API Keys</button></CardFooter>}
                </>
            )}

            {activeTab === 'billing' && canViewBilling && (
                 <CardContent className="pt-6 space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold text-blue-800 dark:text-blue-300">Pro Plan</h3>
                            <p className="text-sm text-blue-700 dark:text-blue-400">Next billing date: August 1, 2024.</p>
                        </div>
                        <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">Upgrade</button>
                    </div>
                    <div>
                        <h3 className="font-medium mb-2 text-gray-900 dark:text-slate-100">Billing History</h3>
                        <table className="min-w-full"><tbody className="divide-y dark:divide-slate-700">{invoices.map(i => <tr key={i.id}><td className="py-2 text-sm text-gray-900 dark:text-slate-100">{i.id}</td><td className="py-2 text-sm text-gray-500 dark:text-slate-400">{i.date}</td><td className="py-2 text-sm text-gray-900 dark:text-slate-100">{i.amount}</td><td><span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300">Paid</span></td><td className="text-right"><a href="#" className="flex justify-end items-center text-blue-600 dark:text-blue-400 hover:underline"><Download className="h-4 w-4 mr-1" /> PDF</a></td></tr>)}</tbody></table>
                    </div>
                </CardContent>
            )}
            
            {activeTab === 'account' && (
                <CardContent className="pt-6">
                    <div className="border border-red-500 dark:border-red-500/50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-red-700 dark:text-red-500">Danger Zone</h3>
                         {canDeleteWorkspace ? (
                            <div className="mt-4 flex justify-between items-center">
                                <div>
                                    <h4 className="font-semibold text-gray-800 dark:text-slate-200">Delete Workspace</h4>
                                    <p className="text-sm text-gray-600 dark:text-slate-400">Permanently delete this workspace and all its contents.</p>
                                </div>
                                <button onClick={handleDeleteWorkspace} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700">Delete Workspace</button>
                            </div>
                        ) : (
                            <div className="mt-4 flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-lg border border-yellow-200 dark:border-yellow-500/30"><AlertTriangle className="h-5 w-5 mr-3" /><p className="text-sm font-medium">Workspace deletion is restricted to Admins.</p></div>
                        )}
                    </div>
                </CardContent>
            )}
        </Card>
    );
};