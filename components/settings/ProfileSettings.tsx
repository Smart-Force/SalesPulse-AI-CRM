import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import { UploadCloud, Loader2 } from 'lucide-react';
import { useToasts } from '../../contexts/ToastContext';

export const ProfileSettings: React.FC = () => {
    const { addToast } = useToasts();
    const [profile, setProfile] = useState({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        // In a real app, you'd save profile info here
        setTimeout(() => {
            setIsSaving(false);
            addToast('Profile changes have been saved!', 'success');
        }, 1500);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <p className="text-sm text-gray-500 dark:text-slate-400">Update your photo and personal details.</p>
            </CardHeader>
            <CardContent>
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
            </CardContent>
            <CardFooter className="border-t dark:border-slate-700 pt-6 flex justify-end">
                <button onClick={handleSave} disabled={isSaving} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed">
                    {isSaving && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </CardFooter>
        </Card>
    );
};
