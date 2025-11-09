import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import { Sun, Moon, UploadCloud, Loader2 } from 'lucide-react';
import { useToasts } from '../../contexts/ToastContext';

export const SettingsProfile: React.FC = () => {
    const { addToast } = useToasts();
    const [profile, setProfile] = useState({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [theme, setTheme] = useState('light');
    const [language, setLanguage] = useState('en-US');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        const savedLang = localStorage.getItem('language') || 'en-US';
        setTheme(savedTheme);
        setLanguage(savedLang);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }, []);

    const handleThemeChange = (newTheme: 'light' | 'dark') => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    const handleSave = () => {
        setIsSaving(true);
        localStorage.setItem('language', language);
        // In a real app, you'd save profile info here
        setTimeout(() => {
            setIsSaving(false);
            addToast('Your changes have been saved!', 'success');
        }, 1500);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile & Appearance</CardTitle>
                <p className="text-sm text-gray-500 dark:text-slate-400">Update your photo, personal details, and interface preferences.</p>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Personal Info Section */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Personal Information</h3>
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-medium">JD</div>
                            <button onClick={() => fileInputRef.current?.click()} className="cursor-pointer bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600">
                                <UploadCloud className="h-5 w-5 mr-2 inline-block" />
                                <span>Change</span>
                            </button>
                            <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">First Name</label>
                                <input type="text" value={profile.firstName} onChange={e => setProfile(p => ({...p, firstName: e.target.value}))} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Last Name</label>
                                <input type="text" value={profile.lastName} onChange={e => setProfile(p => ({...p, lastName: e.target.value}))} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Email</label>
                            <input type="email" value={profile.email} readOnly className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm bg-gray-100 dark:bg-slate-600/50 cursor-not-allowed text-gray-500 dark:text-slate-400" />
                        </div>
                    </div>
                </div>
                {/* Appearance Section */}
                <div className="border-t border-gray-200 dark:border-slate-700 pt-8">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Appearance</h3>
                    <div className="space-y-6">
                         <div>
                            <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Language</label>
                            <select id="language" value={language} onChange={e => setLanguage(e.target.value)} className="mt-1 block w-full md:w-1/2 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200">
                                <option value="en-US">English (United States)</option>
                                <option value="es-ES">Español (España)</option>
                                <option value="fr-FR">Français (France)</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Theme</label>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => handleThemeChange('light')} className={`flex items-center space-x-2 p-3 border-2 rounded-lg w-32 ${theme === 'light' ? 'border-blue-500' : 'border-gray-300 dark:border-slate-600'}`}>
                                    <Sun className="h-5 w-5 text-gray-500"/>
                                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Light</span>
                                </button>
                                <button onClick={() => handleThemeChange('dark')} className={`flex items-center space-x-2 p-3 border-2 rounded-lg w-32 ${theme === 'dark' ? 'border-blue-500' : 'border-gray-300 dark:border-slate-600'}`}>
                                    <Moon className="h-5 w-5 text-gray-500"/>
                                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Dark</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t dark:border-slate-700 pt-6 flex justify-end">
                <button onClick={handleSave} disabled={isSaving} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed">
                    {isSaving && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                    {isSaving ? 'Saving...' : 'Save All Changes'}
                </button>
            </CardFooter>
        </Card>
    );
};