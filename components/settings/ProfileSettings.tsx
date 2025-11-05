import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import { UploadCloud, CheckCircle, Loader2 } from 'lucide-react';

export const ProfileSettings: React.FC = () => {
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    title: 'Sales Director',
    bio: 'Experienced sales director with a passion for building high-performing teams.',
    signature: 'John Doe\nSales Director\nSalesPulse AI\njohn.doe@example.com',
  });
  const [signatureEnabled, setSignatureEnabled] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({...prev, [name]: value}));
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setSaveStatus('idle');
    setTimeout(() => {
        setIsSaving(false);
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <p className="text-sm text-gray-500 dark:text-slate-400">This is how others will see you on the site.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar Preview" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-medium">
              JD
            </div>
          )}
          <div className="flex items-center space-x-2">
             <button onClick={() => fileInputRef.current?.click()} className="cursor-pointer bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600">
                <UploadCloud className="h-5 w-5 mr-2 inline-block" />
                <span>Change</span>
             </button>
             <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
             <button className="text-sm font-medium text-red-600 hover:text-red-800">Remove</button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-slate-300">First Name</label>
            <input type="text" name="firstName" id="firstName" value={profile.firstName} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Last Name</label>
            <input type="text" name="lastName" id="lastName" value={profile.lastName} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" />
          </div>
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Email</label>
          <input type="email" name="email" id="email" value={profile.email} readOnly className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm bg-gray-100 dark:bg-slate-600/50 cursor-not-allowed text-gray-500 dark:text-slate-400" />
        </div>
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Title</label>
          <input type="text" name="title" id="title" value={profile.title} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" />
        </div>
        
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Bio</label>
          <textarea name="bio" id="bio" rows={3} value={profile.bio} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"></textarea>
           <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">Brief description for your profile.</p>
        </div>

        <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
            <h3 className="text-md font-medium text-gray-900 dark:text-slate-100">Email Signature</h3>
            <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-gray-500 dark:text-slate-400">
                Enable a signature on all outgoing emails.
                </p>
                <button
                type="button"
                className={`${
                    signatureEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:ring-offset-slate-800`}
                role="switch"
                aria-checked={signatureEnabled}
                onClick={() => setSignatureEnabled(!signatureEnabled)}
                >
                <span
                    aria-hidden="true"
                    className={`${
                    signatureEnabled ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
                </button>
            </div>
            <div className="mt-4">
                <label htmlFor="signature" className="sr-only">Signature</label>
                <textarea
                name="signature"
                id="signature"
                rows={4}
                value={profile.signature}
                onChange={handleInputChange}
                disabled={!signatureEnabled}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 disabled:bg-gray-100 dark:disabled:bg-slate-700/50 disabled:cursor-not-allowed"
                placeholder="Your signature here..."
                ></textarea>
            </div>
        </div>

      </CardContent>
      <CardFooter className="border-t dark:border-slate-700 pt-6 flex justify-end items-center gap-x-3">
        {saveStatus === 'success' && (
            <span className="text-sm text-green-600 flex items-center transition-opacity"><CheckCircle className="h-4 w-4 mr-1" />Saved!</span>
        )}
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </CardFooter>
    </Card>
  );
};