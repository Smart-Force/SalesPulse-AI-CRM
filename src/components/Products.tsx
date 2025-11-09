import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Package, PlusCircle, Percent, Edit, Trash2, Upload, Download } from 'lucide-react';
import type { Product } from '../types';
import AddProductModal from './modals/AddProductModal';
import { usePermissions } from '../contexts/PermissionContext';

type ProductFormData = Omit<Product, 'negotiatedCommissionRate' | 'discountRate'> & { id?: string };

interface ProductsProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

export const Products: React.FC<ProductsProps> = ({ products, setProducts }) => {
  const { create: canCreate, edit: canEdit, delete: canDelete } = usePermissions('Products');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  const handleValueChange = (productId: string, field: 'negotiatedCommissionRate' | 'discountRate', value: string) => {
      const numericValue = parseFloat(value);
      if (isNaN(numericValue) && value !== '') return;

      const rate = value === '' ? 0 : numericValue / 100;

      setProducts(prevProducts =>
          prevProducts.map(p =>
              p.id === productId ? { ...p, [field]: rate } : p
          )
      );
  };

  const handleSaveProduct = (productData: ProductFormData) => {
      const isUpdate = productData.id && products.some(p => p.id === productData.id);

      if (isUpdate) {
          setProducts(prevProducts =>
              prevProducts.map(p => {
                  if (p.id === productData.id) {
                      return { 
                          ...p, // keep old discountRate
                          ...productData,
                          negotiatedCommissionRate: productData.commissionRate // Reset negotiated rate to new base rate
                      };
                  }
                  return p;
              })
          );
      } else {
          const newProduct: Product = {
              ...productData,
              id: `prod_${Date.now()}`,
              negotiatedCommissionRate: productData.commissionRate,
              discountRate: 0,
          };
          setProducts(prev => [newProduct, ...prev]);
      }
      setIsModalOpen(false);
      setProductToEdit(null);
  };

  const handleOpenEditModal = (product: Product) => {
      setProductToEdit(product);
      setIsModalOpen(true);
  };

  const handleRemoveProduct = (productId: string) => {
      if (window.confirm('Are you sure you want to remove this product? This action cannot be undone.')) {
          setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
      }
  };

  const handleExport = () => {
        const headers = ['name', 'tier', 'description', 'billingType', 'basePrice', 'commissionRate'];
        const csvContent = [
            headers.join(','),
            ...products.map(p => [
                `"${p.name.replace(/"/g, '""')}"`,
                `"${p.tier.replace(/"/g, '""')}"`,
                `"${p.description.join('|').replace(/"/g, '""')}"`, // Use pipe separator
                p.billingType,
                p.basePrice,
                p.commissionRate * 100 // Export as percentage
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "products.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const rows = text.split('\n');
            const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
            
            const headerMap: { [key: string]: number } = {};
            headers.forEach((header, index) => {
                headerMap[header] = index;
            });

            const potentialProducts = rows.slice(1).map(row => {
                const data = row.split(',');
                if (data.length < headers.length) return null;

                const name = data[headerMap['name']]?.replace(/"/g, '') || '';
                if (!name) return null;
                
                const commissionRate = parseFloat(data[headerMap['commissionrate']]) / 100 || 0;

                return {
                    id: `prod_${Date.now()}_${Math.random()}`,
                    name,
                    tier: data[headerMap['tier']]?.replace(/"/g, '') || '',
                    description: data[headerMap['description']]?.replace(/"/g, '').split('|') || [],
                    billingType: (data[headerMap['billingtype']] as any) === 'Monthly' ? 'Monthly' : 'One-time',
                    basePrice: parseFloat(data[headerMap['baseprice']]) || 0,
                    commissionRate: commissionRate,
                    negotiatedCommissionRate: commissionRate,
                    discountRate: 0,
                } as Product;
            }).filter((p): p is Product => p !== null);

            const existingNames = new Set(products.map(p => p.name.toLowerCase()));
            const seenNamesInFile = new Set<string>();

            const newUniqueProducts = potentialProducts.filter(product => {
                const productNameLower = product.name.toLowerCase();
                if (existingNames.has(productNameLower) || seenNamesInFile.has(productNameLower)) {
                    return false;
                }
                seenNamesInFile.add(productNameLower);
                return true;
            });

            if (newUniqueProducts.length > 0) {
                const duplicateCount = potentialProducts.length - newUniqueProducts.length;
                let confirmationMessage = `Found ${newUniqueProducts.length} new products to import.`;
                if (duplicateCount > 0) {
                    confirmationMessage += ` ${duplicateCount} duplicate or invalid rows were ignored.`;
                }
                confirmationMessage += " Would you like to add them?";

                if (window.confirm(confirmationMessage)) {
                    setProducts(prev => [...prev, ...newUniqueProducts]);
                }
            } else {
                alert('No new products found in the file. All entries were either duplicates of existing products, duplicates within the file, or invalid.');
            }
            
            if(importFileInputRef.current) {
                importFileInputRef.current.value = "";
            }
        };
        reader.readAsText(file);
    };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <input type="file" ref={importFileInputRef} onChange={handleImport} style={{ display: 'none' }} accept=".csv" />
        {isModalOpen && <AddProductModal 
            onClose={() => { setIsModalOpen(false); setProductToEdit(null); }} 
            onSaveProduct={handleSaveProduct} 
            productToEdit={productToEdit} 
        />}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Deal Negotiator & Calculator</h1>
                <p className="mt-1 text-gray-600 dark:text-slate-400">Add, edit, and remove products, then calculate deal profitability in real-time.</p>
            </div>
            <div className="flex items-center space-x-2">
                 {canCreate && (
                    <>
                        <button onClick={() => importFileInputRef.current?.click()} className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors flex items-center shadow-sm">
                            <Upload className="h-4 w-4 mr-2" />
                            Import
                        </button>
                        <button onClick={handleExport} className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors flex items-center shadow-sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </button>
                        <button onClick={() => { setProductToEdit(null); setIsModalOpen(true); }} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm">
                            <PlusCircle className="h-5 w-5 mr-2" />
                            Add Product
                        </button>
                    </>
                 )}
            </div>
        </div>

        <Card>
            <CardHeader>
                 <CardTitle className="flex items-center">
                    <Package className="mr-2 h-6 w-6" />
                    Product Catalog & Deal Calculator
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-800/50">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider w-1/4">Product / Service</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Base Price</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Commission Rate (%)</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Price</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Discount Rate (%)</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Discounted Price</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Agent Commission</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Sys. Rate</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Customer Savings</th>
                                {(canEdit || canDelete) && <th scope="col" className="relative px-4 py-3"><span className="sr-only">Actions</span></th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                            {products.map((product) => {
                                const commissionRate = product.negotiatedCommissionRate;
                                const discountRate = product.discountRate;

                                const totalPrice = product.basePrice * (1 + commissionRate);
                                const discountedPrice = totalPrice * (1 - discountRate);
                                const agentCommission = discountedPrice - product.basePrice;
                                const sysRate = product.basePrice > 0 ? (agentCommission / product.basePrice) * 100 : 0;
                                const customerSavings = totalPrice - discountedPrice;
                                const savingsPerBilling = product.billingType === 'Monthly' ? `${formatCurrency(customerSavings)}/mo` : formatCurrency(customerSavings);
                                const totalAnnualSavings = product.billingType === 'Monthly' ? `${formatCurrency(customerSavings * 12)}/yr` : '';
                                
                                return (
                                    <tr key={product.id}>
                                        <td className="px-4 py-3 align-top">
                                            <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">{product.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-slate-400">{product.tier}</div>
                                        </td>
                                        <td className="px-4 py-3 align-top whitespace-nowrap text-sm text-gray-800 dark:text-slate-200 font-medium">
                                            {formatCurrency(product.basePrice)}
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={(commissionRate * 100).toFixed(0)}
                                                    onChange={(e) => handleValueChange(product.id, 'negotiatedCommissionRate', e.target.value)}
                                                    disabled={!canEdit}
                                                    className="w-24 pl-2 pr-5 py-1 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 text-sm disabled:bg-slate-100 dark:disabled:bg-slate-700/50"
                                                />
                                                <Percent className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">Base: {(product.commissionRate * 100).toFixed(0)}%</div>
                                        </td>
                                        <td className="px-4 py-3 align-top whitespace-nowrap text-sm font-bold text-gray-800 dark:text-slate-200">
                                            {formatCurrency(totalPrice)}
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={(discountRate * 100).toFixed(0)}
                                                    onChange={(e) => handleValueChange(product.id, 'discountRate', e.target.value)}
                                                    disabled={!canEdit}
                                                    className="w-24 pl-2 pr-5 py-1 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 text-sm disabled:bg-slate-100 dark:disabled:bg-slate-700/50"
                                                />
                                                <Percent className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 align-top whitespace-nowrap text-sm font-bold text-green-600">
                                            {formatCurrency(discountedPrice)}
                                        </td>
                                        <td className="px-4 py-3 align-top whitespace-nowrap text-sm font-medium text-gray-800 dark:text-slate-200">
                                            {formatCurrency(agentCommission)}
                                        </td>
                                        <td className="px-4 py-3 align-top whitespace-nowrap text-sm font-medium text-gray-700 dark:text-slate-300">
                                            {sysRate.toFixed(2)}%
                                        </td>
                                        <td className="px-4 py-3 align-top whitespace-nowrap text-sm">
                                            <div className="font-medium text-green-600">{savingsPerBilling}</div>
                                            {totalAnnualSavings && <div className="text-xs text-gray-500 dark:text-slate-400">{totalAnnualSavings}</div>}
                                        </td>
                                        {(canEdit || canDelete) &&
                                            <td className="px-4 py-3 align-top whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    {canEdit && <button onClick={() => handleOpenEditModal(product)} className="p-2 text-gray-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" title="Edit Product">
                                                        <Edit className="h-4 w-4" />
                                                    </button>}
                                                    {canDelete && <button onClick={() => handleRemoveProduct(product.id)} className="p-2 text-gray-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" title="Remove Product">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>}
                                                </div>
                                            </td>
                                        }
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    </div>
  );
};