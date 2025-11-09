import type { View, RolePermissions, PermissionAction } from '../types';

export const allViews: View[] = [
    'Dashboard', 
    'Email Inbox', 
    'Prospects', 
    'Campaigns', 
    'Workflows',
    'Lead Generation', 
    'Playbooks',
    'AI Generator',
    'Products', 
    'Analytics', 
    'Live Call', 
    'Integrations', 
    'Settings',
    // Granular settings views
    'Settings - Team', 'Settings - AI Provider', 'Settings - Roles', 'Settings - Billing'
];

const fullAccess: PermissionAction = { view: true, create: true, edit: true, delete: true };
const readOnly: PermissionAction = { view: true, create: false, edit: false, delete: false };
const noAccess: PermissionAction = { view: false, create: false, edit: false, delete: false };

const createPermissionsFromViews = (
    views: View[], 
    defaultAccess: PermissionAction = fullAccess
): { [key in View]?: Partial<PermissionAction> } => {
    const permissions: { [key in View]?: Partial<PermissionAction> } = {};
    for (const view of allViews) {
        if (views.includes(view)) {
            // Apply read-only for specific views, otherwise use the default
            permissions[view] = (view === 'Dashboard' || view === 'Analytics' || view === 'Playbooks') ? readOnly : defaultAccess;
        } else {
            permissions[view] = noAccess;
        }
    }
    // Every role must be able to see the main Settings page to access their profile
    permissions['Settings'] = { view: true };
    return permissions;
};

export const initialRolePermissions: RolePermissions = {
    'Super Admin': createPermissionsFromViews(allViews),
    'Admin': createPermissionsFromViews(allViews),
    'Manager': createPermissionsFromViews([
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
        'Playbooks',
        'AI Generator',
        'Settings',
        'Settings - Team', // Manager can view team by default
    ]),
    'Member': createPermissionsFromViews(
        [
            'Dashboard', 
            'Email Inbox', 
            'Prospects', 
            'Campaigns', 
            'Workflows',
            'Live Call',
            'Playbooks',
            'AI Generator',
            'Settings',
        ],
        // Members get read-only access to most things by default
        { view: true, create: false, edit: false, delete: false } 
    ),
};