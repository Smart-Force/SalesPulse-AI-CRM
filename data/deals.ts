import { Deal } from '../types';

export const initialDeals: Deal[] = [
    {
        id: 'deal1',
        prospectId: '1',
        name: 'Q3 Infrastructure Upgrade',
        status: 'Negotiating',
        createdAt: new Date('2024-07-20T10:00:00Z'),
        updatedAt: new Date('2024-07-25T14:30:00Z'),
        lineItems: [
            {
                id: 'li1',
                productId: 'prod_smac3',
                name: 'Social Media Ad Campaign T3',
                basePrice: 4500.00,
                billingType: 'Monthly',
                commissionRate: 0.30,
                negotiatedCommissionRate: 0.28,
                discountRate: 0.05, // 5% discount
            },
            {
                id: 'li2',
                productId: 'prod_smm_launch',
                name: 'SMM Launch Plan',
                basePrice: 1800.00,
                billingType: 'Monthly',
                commissionRate: 0.25,
                // No negotiated rates, uses product default
            }
        ]
    }
];