import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import type { Deal, DealLineItem, Product, Prospect, DealStatus } from '../../types';
import DealCalculator from '../DealCalculator';

interface DealBuilderModalProps {
  onClose: () => void;
  onSaveDeal: (deal: Deal) => void;
  prospect: Prospect;
  products: Product[];
  deal: Deal | null; // Pass a deal to edit, or null to create
}

const statusOptions: DealStatus[] = ['Proposal', 'Negotiating', 'Won', 'Lost'];

const DealBuilderModal: React.FC<DealBuilderModalProps> = ({ onClose, onSaveDeal, prospect, products, deal }) => {
    const [editedDeal, setEditedDeal] = useState<Partial<Deal>>({});
    const [showProductList, setShowProductList] = useState(false);

    useEffect(() => {
        if (deal) {
            setEditedDeal(JSON.parse(JSON.stringify(deal))); // Deep copy for editing
        } else {
            // Initialize a new deal
            setEditedDeal({
                prospectId: prospect.id,
                name: `${prospect.company} - New Deal`,
                status: 'Proposal',
                lineItems: [],
            });
        }
    }, [deal, prospect]);

    const handleSave = () => {
        const dealToSave: Deal = {
            id: editedDeal.id || `deal_${Date.now()}`,
            prospectId: prospect.id,
            name: editedDeal.name || 'Untitled Deal',
            status: editedDeal.status || 'Proposal',
            lineItems: editedDeal.lineItems || [],
            createdAt: editedDeal.createdAt ? new Date(editedDeal.createdAt) : new Date(),
            updatedAt: new Date(),
        };
        onSaveDeal(dealToSave);
    };

    const handleAddProduct = (product: Product) => {
        const newLineItem: DealLineItem = {
            id: `li_${Date.now()}`,
            productId: product.id,
            name: product.name,
            basePrice: product.basePrice,
            commissionRate: product.commissionRate,
            billingType: product.billingType,
        };
        const updatedLineItems = [...(editedDeal.lineItems || []), newLineItem];
        setEditedDeal(prev => ({...prev, lineItems: updatedLineItems}));
        setShowProductList(false);
    };

    const handleRemoveLineItem = (lineItemId: string) => {
        const updatedLineItems = (editedDeal.lineItems || []).filter(item => item.id !== lineItemId);
        setEditedDeal(prev => ({...prev, lineItems: updatedLineItems}));
    };

    const handleLineItemChange = (updatedLineItem: DealLineItem) => {
        const updatedLineItems = (editedDeal.lineItems || []).map(item =>
            item.id === updatedLineItem.id ? updatedLineItem : item
        );
        setEditedDeal(prev => ({...prev, lineItems: updatedLineItems}));
    };
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const availableProducts = products.filter(p => 
        !(editedDeal.lineItems || []).some(li => li.productId === p.id)
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col transform transition-all duration-300 ease-out"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between flex-shrink-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                        {deal ? 'Edit Deal' : 'Create New Deal'} for {prospect.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm flex items-center"><Save className="h-4 w-4 mr-2" /> Save Deal</button>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="h-5 w-5" /></button>
                    </div>
                </div>

                <div className="flex-grow p-6 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="dealName" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Deal Name</label>
                            <input
                                id="dealName"
                                type="text"
                                value={editedDeal.name || ''}
                                onChange={(e) => setEditedDeal(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"
                            />
                        </div>
                        <div>
                            <label htmlFor="dealStatus" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Deal Status</label>
                            <select
                                id="dealStatus"
                                value={editedDeal.status || ''}
                                onChange={(e) => setEditedDeal(prev => ({...prev, status: e.target.value as DealStatus}))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"
                            >
                                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="pt-4">
                        <h4 className="text-md font-semibold text-gray-800 dark:text-slate-200 mb-2">Line Items & Negotiation</h4>
                        <DealCalculator 
                            lineItems={editedDeal.lineItems || []}
                            onLineItemChange={handleLineItemChange}
                            onRemoveLineItem={handleRemoveLineItem}
                        />
                         <div className="mt-2 relative">
                            <button 
                                onClick={() => setShowProductList(!showProductList)}
                                className="w-full flex items-center justify-center p-2 text-sm font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/50 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900 border-2 border-dashed border-blue-200 dark:border-blue-700"
                            >
                                <Plus className="h-4 w-4 mr-2" /> Add Product to Deal
                            </button>
                            {showProductList && (
                                <div className="absolute z-10 top-full mt-1 w-full max-h-60 overflow-y-auto bg-white dark:bg-slate-700 rounded-md shadow-lg border dark:border-slate-600">
                                    {availableProducts.length > 0 ? availableProducts.map(product => (
                                        <div 
                                            key={product.id}
                                            onClick={() => handleAddProduct(product)}
                                            className="px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/50"
                                        >
                                            <p className="font-semibold text-sm text-gray-900 dark:text-slate-100">{product.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">{product.tier}</p>
                                        </div>
                                    )) : <p className="p-4 text-sm text-center text-gray-500 dark:text-slate-400">All products have been added.</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DealBuilderModal;