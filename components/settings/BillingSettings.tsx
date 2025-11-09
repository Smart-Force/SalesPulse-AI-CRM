import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Download } from 'lucide-react';

const invoices = [
  { id: 'INV-2024-003', date: 'July 1, 2024', amount: '$99.00', status: 'Paid' },
  { id: 'INV-2024-002', date: 'June 1, 2024', amount: '$99.00', status: 'Paid' },
];

export const BillingSettings: React.FC = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Billing</CardTitle>
                <p className="text-sm text-gray-500 dark:text-slate-400">Manage subscription and payment details.</p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold text-blue-800 dark:text-blue-300">Pro Plan</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-400">Next billing date: August 1, 2024.</p>
                    </div>
                    <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">Upgrade Plan</button>
                </div>
                <div>
                    <h3 className="text-md font-medium text-gray-900 dark:text-slate-100 mb-2">Billing History</h3>
                    <table className="min-w-full">
                        <tbody className="divide-y dark:divide-slate-700">
                            {invoices.map(invoice => (
                            <tr key={invoice.id}>
                                <td className="py-2 text-sm text-gray-900 dark:text-slate-100">{invoice.id}</td>
                                <td className="py-2 text-sm text-gray-500 dark:text-slate-400">{invoice.date}</td>
                                <td className="py-2 text-sm text-gray-900 dark:text-slate-100">{invoice.amount}</td>
                                <td className="py-2 text-sm"><span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Paid</span></td>
                                <td className="py-2 text-right"><a href="#" className="text-sm font-medium text-blue-600 hover:underline flex justify-end items-center"><Download className="h-4 w-4 mr-1" /> PDF</a></td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};
