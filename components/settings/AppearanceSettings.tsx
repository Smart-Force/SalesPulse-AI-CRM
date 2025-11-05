import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import { Sun, Moon } from 'lucide-react';

export const AppearanceSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    language: 'en-US',
    theme: 'light',
  });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    const savedLang = localStorage.getItem('language');
    
    let currentTheme = 'light';
    if (savedTheme) {
      currentTheme = savedTheme;
    } else if (prefersDark) {
      currentTheme = 'dark';
    }
    
    document.documentElement.classList.toggle('dark', currentTheme === 'dark');

    setSettings({
        language: savedLang || 'en-US',
        theme: currentTheme
    });

  }, []);

  const handleThemeChange = (theme: 'light' | 'dark') => {
    setSettings(p => ({...p, theme: theme}));
    document.documentElement.classList.toggle('dark', theme === 'dark');
  };
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({...prev, [name]: value}));
  };

  const handleSaveChanges = () => {
    localStorage.setItem('theme', settings.theme);
    localStorage.setItem('language', settings.language);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  }

  const isDarkMode = settings.theme === 'dark';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <p className="text-sm text-gray-500 dark:text-slate-400">Customize the look and feel of your workspace.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Language</label>
          <select id="language" name="language" value={settings.language} onChange={handleSelectChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200">
            <option value="en-US">English (United States)</option>
            <option value="es-ES">Español (España)</option>
            <option value="fr-FR">Français (France)</option>
          </select>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Theme</label>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">Switch between light and dark mode for the application.</p>
            <button
                type="button"
                className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:ring-offset-slate-800 ${
                    isDarkMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'
                }`}
                role="switch"
                aria-checked={isDarkMode}
                onClick={() => handleThemeChange(isDarkMode ? 'light' : 'dark')}
            >
                <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                        isDarkMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                >
                    {isDarkMode ?
                        <Moon className="h-4 w-4 text-blue-600" /> :
                        <Sun className="h-4 w-4 text-yellow-500" />
                    }
                </span>
            </button>
        </div>
      </CardContent>
      <CardFooter className="border-t dark:border-slate-700 pt-6 flex justify-end">
        <button onClick={handleSaveChanges} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50" disabled={isSaved}>
          {isSaved ? 'Saved!' : 'Save Preferences'}
        </button>
      </CardFooter>
    </Card>
  );
};