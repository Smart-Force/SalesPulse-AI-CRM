import React, { useState, useEffect } from 'react';
import { X, Package, DollarSign, Percent, ChevronsRight } from 'lucide-react';
import type { Product } from '../../types';

type ProductFormData = Omit<Product, 'negotiatedCommissionRate' | 'discountRate'> & { id?: string };

interface AddProductModalProps {
  onClose: () => void;
  onSaveProduct: (productData: ProductFormData) => void;
  productToEdit?: Product | null;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, onSaveProduct, productToEdit }) => {
    const isEditMode = !!productToEdit;

    const [formData, setFormData] = useState({
        name: '',
        tier: '',
        billingType: 'Monthly' as 'Monthly' | 'One-time',
        basePrice: 0,
        commissionRate: 0.25,
    });
    const [descriptionInput, setDescriptionInput] = useState('');

    useEffect(() => {
        if (productToEdit) {
            setFormData({
                name: productToEdit.name,
                tier: productToEdit.tier,
                billingType: productToEdit.billingType,
                basePrice: productToEdit.basePrice,
                commissionRate: productToEdit.commissionRate,
            });
            setDescriptionInput(productToEdit.description.join(', '));
        }
    }, [productToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumberField = ['basePrice'].includes(name);
        setFormData(prev => ({ 
            ...prev, 
            [name]: isNumberField ? parseFloat(value) || 0 : value 
        }));
    };

    const handleCommissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) {
            setFormData(prev => ({ ...prev, commissionRate: value / 100 }));
        } else {
             setFormData(prev => ({ ...prev, commissionRate: 0 }));
        }
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescriptionInput(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const descriptionArray = descriptionInput.split(',').map(item => item.trim()).filter(Boolean);
        onSaveProduct({ 
            id: productToEdit?.id,
            ...formData, 
            description: descriptionArray 
        });
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
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                        {isEditMode ? 'Edit Product' : 'Add New Product'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Product Name</label>
                            <div className="relative">
                                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" autoFocus/>
                            </div>
                        </div>
                         <div>
                            <label htmlFor="tier" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Tier</label>
                            <div className="relative">
                                <ChevronsRight className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input id="tier" name="tier" type="text" value={formData.tier} onChange={handleChange} required className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description (comma-separated points)</label>
                            <textarea id="description" name="description" value={descriptionInput} onChange={handleDescriptionChange} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" />
                        </div>
                        <div>
                            <label htmlFor="billingType" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Billing Type</label>
                            <select id="billingType" name="billingType" value={formData.billingType} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200">
                                <option value="Monthly">Monthly</option>
                                <option value="One-time">One-time</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Base Price</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input id="basePrice" name="basePrice" type="number" step="0.01" value={formData.basePrice} onChange={handleChange} required className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="commissionRate" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Commission Rate (%)</label>
                                <div className="relative">
                                    <input id="commissionRate" name="commissionRate" type="number" value={formData.commissionRate * 100} onChange={handleCommissionChange} required className="w-full pl-3 pr-8 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200" />
                                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex justify-end items-center space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 border border-gray-300 dark:border-slate-600 rounded-md text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                            {isEditMode ? 'Save Changes' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;