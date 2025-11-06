import React from 'react';
import { Percent, Trash2 } from 'lucide-react';
import type { DealLineItem } from '../types';

interface DealCalculatorProps {
  lineItems: DealLineItem[];
  onLineItemChange: (item: DealLineItem) => void;
  onRemoveLineItem: (itemId: string) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

const DealCalculator: React.FC<DealCalculatorProps> = ({ lineItems, onLineItemChange, onRemoveLineItem }) => {
    
    const handleValueChange = (itemId: string, field: 'negotiatedCommissionRate' | 'discountRate', value: string) => {
        const item = lineItems.find(li => li.id === itemId);
        if (!item) return;

        const numericValue = parseFloat(value);
        if (isNaN(numericValue) && value !== '') return;

        const rate = value === '' ? undefined : numericValue / 100;
        onLineItemChange({ ...item, [field]: rate });
    };

    const totals = lineItems.reduce((acc, item) => {
        const commissionRate = item.negotiatedCommissionRate ?? item.commissionRate;
        const discountRate = item.discountRate ?? 0;

        const totalPrice = item.basePrice * (1 + commissionRate);
        const discountedPrice = totalPrice * (1 - discountRate);
        const agentCommission = discountedPrice - item.basePrice;
        const customerSavings = totalPrice - discountedPrice;

        acc.totalPrice += totalPrice;
        acc.discountedPrice += discountedPrice;
        acc.agentCommission += agentCommission;
        acc.customerSavings += customerSavings;
        return acc;
    }, { totalPrice: 0, discountedPrice: 0, agentCommission: 0, customerSavings: 0 });

    if (lineItems.length === 0) {
        return (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <p className="text-sm text-gray-500">No products added to this deal yet.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto border dark:border-slate-700 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-800/50">
                    <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider w-1/4">Product</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Base Price</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Commission Rate (%)</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Price</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Discount Rate (%)</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Discounted Price</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Agent Commission</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Sys. Rate</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Customer Savings</th>
                        <th scope="col" className="relative px-4 py-3"><span className="sr-only">Remove</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                    {lineItems.map((item) => {
                        const commissionRate = item.negotiatedCommissionRate ?? item.commissionRate;
                        const discountRate = item.discountRate ?? 0;

                        const totalPrice = item.basePrice * (1 + commissionRate);
                        const discountedPrice = totalPrice * (1 - discountRate);
                        const agentCommission = discountedPrice - item.basePrice;
                        const sysRate = item.basePrice > 0 ? (agentCommission / item.basePrice) * 100 : 0;
                        const customerSavings = totalPrice - discountedPrice;
                        
                        const savingsPerBilling = item.billingType === 'Monthly' ? `${formatCurrency(customerSavings)}/mo` : formatCurrency(customerSavings);
                        const totalAnnualSavings = item.billingType === 'Monthly' && customerSavings > 0 ? `${formatCurrency(customerSavings * 12)}/yr` : '';

                        return (
                            <tr key={item.id}>
                                <td className="px-4 py-3 align-top text-sm font-semibold text-gray-900 dark:text-slate-100">{item.name}</td>
                                <td className="px-4 py-3 whitespace-nowrap align-top text-sm text-gray-700 dark:text-slate-300">{formatCurrency(item.basePrice)}</td>
                                <td className="px-4 py-3 align-top">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={item.negotiatedCommissionRate !== undefined ? (item.negotiatedCommissionRate * 100) : ''}
                                            onChange={(e) => handleValueChange(item.id, 'negotiatedCommissionRate', e.target.value)}
                                            className="w-24 pl-2 pr-5 py-1 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 text-sm"
                                            placeholder={(item.commissionRate * 100).toFixed(0)}
                                        />
                                        <Percent className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{formatCurrency(item.basePrice * commissionRate)}</div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap align-top text-sm font-bold text-gray-800 dark:text-slate-200">{formatCurrency(totalPrice)}</td>
                                <td className="px-4 py-3 align-top">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={item.discountRate !== undefined ? (item.discountRate * 100) : ''}
                                            onChange={(e) => handleValueChange(item.id, 'discountRate', e.target.value)}
                                            className="w-24 pl-2 pr-5 py-1 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 text-sm"
                                            placeholder="0"
                                        />
                                        <Percent className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap align-top text-sm font-bold text-green-600">{formatCurrency(discountedPrice)}</td>
                                <td className={`px-4 py-3 whitespace-nowrap align-top text-sm font-medium ${agentCommission < 0 ? 'text-red-500' : 'text-gray-800 dark:text-slate-200'}`}>{formatCurrency(agentCommission)}</td>
                                <td className="px-4 py-3 whitespace-nowrap align-top text-sm font-medium text-gray-700 dark:text-slate-300">{sysRate.toFixed(2)}%</td>
                                <td className="px-4 py-3 whitespace-nowrap align-top text-sm">
                                    <div className="font-medium text-green-600">{savingsPerBilling}</div>
                                    {totalAnnualSavings && <div className="text-xs text-gray-500 dark:text-slate-400">{totalAnnualSavings}</div>}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap align-top text-center">
                                    <button onClick={() => onRemoveLineItem(item.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="h-4 w-4"/></button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-slate-800/50 font-bold">
                    <tr>
                        <td className="px-4 py-2 text-right text-sm text-gray-800 dark:text-slate-200" colSpan={3}>Totals</td>
                        <td className="px-4 py-2 text-sm text-gray-800 dark:text-slate-200">{formatCurrency(totals.totalPrice)}</td>
                        <td className="px-4 py-2"></td>
                        <td className="px-4 py-2 text-sm text-green-600">{formatCurrency(totals.discountedPrice)}</td>
                        <td className={`px-4 py-2 text-sm ${totals.agentCommission < 0 ? 'text-red-500' : 'text-gray-800 dark:text-slate-200'}`}>{formatCurrency(totals.agentCommission)}</td>
                        <td className="px-4 py-2"></td>
                        <td className="px-4 py-2 text-sm text-green-600">{formatCurrency(totals.customerSavings)}</td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default DealCalculator;