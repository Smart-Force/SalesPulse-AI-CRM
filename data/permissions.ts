import type { View, RolePermissions } from '../types';

export const allViews: View[] = [
    'Dashboard', 
    'Email Inbox', 
    'Prospects', 
    'Campaigns', 
    'Workflows',
    'Lead Generation', 
    'Products', 
    'Analytics', 
    'Live Call', 
    'Integrations', 
    'Settings',
];

export const initialRolePermissions: RolePermissions = {
    // FIX: Add 'Super Admin' role to the permissions object to resolve type error.
    'Super Admin': allViews,
    Admin: allViews,
    Manager: [
        'Dashboard', 
        'Email Inbox', 
        'Prospects', 
        'Campaigns', 
        'Workflows',
        'Lead Generation', 
        'Products', 
        'Analytics', 
        'Live Call', 
        'Integrations', 
        'Settings',
    ],
    Member: [
        'Dashboard', 
        'Email Inbox', 
        'Prospects', 
        'Campaigns', 
        'Workflows',
        'Live Call',
        'Settings',
    ],
};