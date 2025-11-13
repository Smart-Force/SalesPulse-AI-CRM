import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import type { TrainingModule, TrainingModuleDifficulty } from '../../types';

interface AddEditModuleModalProps {
  onClose: () => void;
  onSave: (moduleData: Omit<TrainingModule, 'id' | 'resources'> & { id?: string }) => void;
  moduleToEdit: TrainingModule | null;
  allModules: TrainingModule[];
  parentId?: string | null; 
}

const difficulties: TrainingModuleDifficulty[] = ['Beginner', 'Intermediate', 'Advanced'];

const AddEditModuleModal: React.FC<AddEditModuleModalProps> = ({ onClose, onSave, moduleToEdit, allModules, parentId: initialParentId }) => {
    const isEditMode = !!moduleToEdit;
    const [title, setTitle] = useState(moduleToEdit?.title || '');
    const [description, setDescription] = useState(moduleToEdit?.description || '');
    const [parentId, setParentId] = useState(moduleToEdit?.parentId || initialParentId || '');
    const [difficulty, setDifficulty] = useState<TrainingModuleDifficulty>(moduleToEdit?.difficulty || 'Beginner');
    const [tags, setTags] = useState((moduleToEdit?.tags || []).join(', '));
    const [prerequisites, setPrerequisites] = useState(new Set(moduleToEdit?.prerequisites || []));
    const [isTemplate, setIsTemplate] = useState(moduleToEdit?.isTemplate || false);
    const [availableFrom, setAvailableFrom] = useState(moduleToEdit?.availability?.from?.split('T')[0] || '');
    const [availableUntil, setAvailableUntil] = useState(moduleToEdit?.availability?.until?.split('T')[0] || '');
    
    const parentOptions = useMemo(() => {
        if (!isEditMode) return allModules;

        const getDescendantIds = (moduleId: string): string[] => {
            const children = allModules.filter(m => m.parentId === moduleId);
            return [moduleId, ...children.flatMap(c => getDescendantIds(c.id))];
        };

        const disallowedIds = new Set(getDescendantIds(moduleToEdit.id));
        return allModules.filter(m => !disallowedIds.has(m.id));
    }, [allModules, moduleToEdit, isEditMode]);
    
    const prerequisiteOptions = useMemo(() => {
        return allModules.filter(m => m.id !== moduleToEdit?.id);
    }, [allModules, moduleToEdit]);


    const handleSave = () => {
        if (!title.trim() || !description.trim()) {
            alert('Title and Description are required.');
            return;
        }
        
        const availability = (availableFrom || availableUntil) ? {
            from: availableFrom ? new Date(availableFrom).toISOString() : undefined,
            until: availableUntil ? new Date(availableUntil).toISOString() : undefined,
        } : undefined;

        onSave({ 
            id: moduleToEdit?.id, 
            title, 
            description, 
            parentId: parentId || undefined,
            difficulty,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            prerequisites: Array.from(prerequisites),
            isTemplate,
            availability,
            version: isEditMode ? (moduleToEdit.version || 0) + 1 : 1,
            lastUpdatedAt: new Date().toISOString(),
        });
    };
    
    const handlePrerequisiteToggle = (moduleId: string) => {
        setPrerequisites(prev => {
            const newSet = new Set(prev);
            newSet.has(moduleId) ? newSet.delete(moduleId) : newSet.add(moduleId);
            return newSet;
        });
    };
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-lg font-semibold">{isEditMode ? 'Edit' : 'Add'} Module</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><X className="h-5 w-5"/></button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto space-y-4">
                    <div>
                        <label htmlFor="module-title" className="block text-sm font-medium">Title</label>
                        <input id="module-title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600"/>
                    </div>
                     <div>
                        <label htmlFor="module-description" className="block text-sm font-medium">Description</label>
                        <textarea id="module-description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full mt-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600"/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="module-parent" className="block text-sm font-medium">Parent Module / Category</label>
                            <select id="module-parent" value={parentId} onChange={e => setParentId(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600">
                                <option value="">None (Top Level)</option>
                                {parentOptions.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="module-difficulty" className="block text-sm font-medium">Difficulty</label>
                            <select id="module-difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value as TrainingModuleDifficulty)} className="w-full mt-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600">
                                {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="module-tags" className="block text-sm font-medium">Tags (comma-separated)</label>
                        <input id="module-tags" type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Prerequisites</label>
                        <div className="mt-2 p-2 border rounded max-h-40 overflow-y-auto space-y-1 dark:border-slate-600">
                            {prerequisiteOptions.map(m => (
                                <label key={m.id} className="flex items-center gap-2 text-sm p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <input type="checkbox" checked={prerequisites.has(m.id)} onChange={() => handlePrerequisiteToggle(m.id)}/> {m.title}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="module-available-from" className="block text-sm font-medium">Available From</label>
                            <input id="module-available-from" type="date" value={availableFrom} onChange={e => setAvailableFrom(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:[color-scheme:dark]"/>
                        </div>
                         <div>
                            <label htmlFor="module-available-until" className="block text-sm font-medium">Available Until</label>
                            <input id="module-available-until" type="date" value={availableUntil} onChange={e => setAvailableUntil(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:[color-scheme:dark]"/>
                        </div>
                    </div>
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium">
                            <input type="checkbox" checked={isTemplate} onChange={e => setIsTemplate(e.target.checked)}/> Mark as Module Template
                        </label>
                    </div>
                </div>
                <div className="p-4 border-t dark:border-slate-700 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 bg-white dark:bg-slate-600 border dark:border-slate-500 rounded-md text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-500">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700">Save Module</button>
                </div>
            </div>
        </div>
    );
};

export default AddEditModuleModal;
