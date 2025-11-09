import React, { useState, useEffect } from 'react';
import { X, List, Plus } from 'lucide-react';
import type { ProspectList } from '../../types';

interface AddToListModalProps {
  onClose: () => void;
  prospectLists: ProspectList[];
  onAddToList: (listId: string) => void;
  onCreateAndAddToList: (listName: string) => void;
}

const AddToListModal: React.FC<AddToListModalProps> = ({ onClose, prospectLists, onAddToList, onCreateAndAddToList }) => {
    const [newListName, setNewListName] = useState('');
    const [selectedListId, setSelectedListId] = useState<string | null>(null);

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newListName.trim()) {
            onCreateAndAddToList(newListName.trim());
        }
    };

    const handleAddClick = () => {
        if (selectedListId) {
            onAddToList(selectedListId);
        }
    };
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-md transform transition-all duration-300 ease-out"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Add Prospects to List</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Select an existing list</label>
                        <div className="max-h-40 overflow-y-auto space-y-2 border dark:border-slate-600 rounded-md p-2">
                            {prospectLists.length > 0 ? prospectLists.map(list => (
                                <div key={list.id} 
                                    onClick={() => setSelectedListId(list.id)}
                                    className={`flex justify-between items-center p-2 rounded cursor-pointer ${selectedListId === list.id ? 'bg-blue-100 dark:bg-blue-900/50 ring-2 ring-blue-500' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                >
                                    <span className="font-medium text-gray-800 dark:text-slate-200">{list.name}</span>
                                    <span className="text-sm text-gray-500 dark:text-slate-400">{list.prospectIds.length} prospects</span>
                                </div>
                            )) : <p className="text-center text-sm text-gray-500 dark:text-slate-400 py-4">No lists created yet.</p>}
                        </div>
                    </div>
                    <form onSubmit={handleCreateSubmit} className="pt-4 border-t border-gray-200 dark:border-slate-700">
                        <label htmlFor="new-list-name" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Or create a new list</label>
                        <div className="flex gap-2 mt-1">
                            <input 
                                id="new-list-name"
                                type="text"
                                value={newListName}
                                onChange={(e) => {
                                    setNewListName(e.target.value);
                                    if(selectedListId) setSelectedListId(null);
                                }}
                                placeholder="e.g., Enterprise Leads"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"
                            />
                            <button type="submit" title="Create and Add" className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50" disabled={!newListName.trim()}>
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>
                    </form>
                </div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex justify-end items-center space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 border border-gray-300 dark:border-slate-600 rounded-md text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleAddClick}
                        disabled={!selectedListId}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add to Selected List
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddToListModal;