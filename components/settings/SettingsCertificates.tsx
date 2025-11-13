import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import { Loader2 } from 'lucide-react';
import { useToasts } from '../../contexts/ToastContext';
import type { CertificateSettings } from '../../types';

interface SettingsCertificatesProps {
  settings: CertificateSettings;
  onSave: (settings: CertificateSettings) => void;
}

export const SettingsCertificates: React.FC<SettingsCertificatesProps> = ({ settings, onSave }) => {
  const { addToast } = useToasts();
  const [localSettings, setLocalSettings] = useState<CertificateSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onSave(localSettings);
      setIsSaving(false);
      addToast('Certificate settings saved successfully!', 'success');
    }, 1000);
  };
  
  const hasChanges = JSON.stringify(settings) !== JSON.stringify(localSettings);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
     if (isCheckbox) {
        const { checked } = e.target as HTMLInputElement;
        setLocalSettings(prev => ({ ...prev, [name]: checked }));
    } else {
        setLocalSettings(prev => ({ ...prev, [name]: value }));
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Certificate Settings</CardTitle>
        <p className="text-sm text-gray-500 dark:text-slate-400">Configure the appearance and content of training completion certificates.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="proctorName" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Proctor/Director Name</label>
            <input type="text" id="proctorName" name="proctorName" value={localSettings.proctorName} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"/>
          </div>
          <div>
            <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Organization Name</label>
            <input type="text" id="organizationName" name="organizationName" value={localSettings.organizationName} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"/>
          </div>
        </div>
        <div>
            <label htmlFor="customMessage" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Custom Message</label>
            <textarea id="customMessage" name="customMessage" value={localSettings.customMessage} onChange={handleInputChange} rows={3} className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600" />
        </div>
         <div className="flex items-center space-x-3">
            <input type="checkbox" id="includeSignature" name="includeSignature" checked={localSettings.includeSignature} onChange={handleInputChange} className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"/>
            <label htmlFor="includeSignature" className="text-sm font-medium text-gray-700 dark:text-slate-300">Include signature line for proctor</label>
        </div>
        <div className="border-t dark:border-slate-700 pt-6 space-y-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-slate-100">Logo Customization</h4>
             <div>
                <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Logo URL</label>
                <input type="url" id="logoUrl" name="logoUrl" value={localSettings.logoUrl || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600" placeholder="https://example.com/logo.png"/>
            </div>
            {localSettings.logoUrl && (
                <div className="p-4 border rounded-md dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50">
                    <p className="text-sm font-medium mb-2">Logo Preview:</p>
                    <img src={localSettings.logoUrl} alt="Logo Preview" className="logo-preview bg-white dark:bg-slate-700 p-2 rounded border dark:border-slate-600" onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')}/>
                </div>
            )}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="logoPosition" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Logo Position</label>
                    <select id="logoPosition" name="logoPosition" value={localSettings.logoPosition} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600">
                        <option value="top-left">Top Left</option>
                        <option value="top-center">Top Center</option>
                        <option value="top-right">Top Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="bottom-center">Bottom Center</option>
                        <option value="bottom-right">Bottom Right</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="logoSize" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Logo Size</label>
                    <select id="logoSize" name="logoSize" value={localSettings.logoSize} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600">
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                    </select>
                </div>
            </div>
        </div>
      </CardContent>
      {hasChanges && (
        <CardFooter className="border-t dark:border-slate-700 pt-6 flex justify-end">
            <button onClick={handleSave} disabled={isSaving} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed">
                {isSaving && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
        </CardFooter>
      )}
    </Card>
  );
};