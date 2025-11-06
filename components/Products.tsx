import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Package, PlusCircle, Percent } from 'lucide-react';
import type { Product } from '../types';

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

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Deal Negotiator & Calculator</h1>
                <p className="mt-1 text-gray-600 dark:text-slate-400">Adjust commission and discounts to calculate deal profitability in real-time.</p>
            </div>
            <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm">
                <PlusCircle className="h-5 w-5 mr-2" />
                Add Product
            </button>
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
                                                    className="w-24 pl-2 pr-5 py-1 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 text-sm"
                                                />
                                                <Percent className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{formatCurrency(product.basePrice * commissionRate)}</div>
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
                                                    className="w-24 pl-2 pr-5 py-1 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 text-sm"
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