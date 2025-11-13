import type { View, RolePermissions, PermissionAction } from '../types';

export const allViews: View[] = [
    'Dashboard', 
    'Email Inbox', 
    'Prospects', 
    'Campaigns', 
    'Workflows',
    'Lead Generation', 
    'Playbooks',
    'Training Center',
    'AI Generator',
    'Products', 
    'Analytics', 
    'Live Call', 
    'Integrations', 
    'Settings',
    // Granular settings views
    'Settings - Team', 'Settings - AI Provider', 'Settings - Roles', 'Settings - Billing', 'Settings - Certificates'
];

const fullAccess: PermissionAction = { view: true, create: true, edit: true, delete: true };
const readOnly: PermissionAction = { view: true, create: false, edit: false, delete: false };
const noAccess: PermissionAction = { view: false, create: false, edit: false, delete: false };

const createPermissionsFromViews = (
    views: View[], 
    defaultAccess: Partial<PermissionAction> = fullAccess
): { [key in View]?: Partial<PermissionAction> } => {
    const permissions: { [key in View]?: Partial<PermissionAction> } = {};
    for (const view of allViews) {
        if (views.includes(view)) {
            // Apply read-only for specific views, otherwise use the default
            const isReadOnlyView = ['Dashboard', 'Analytics', 'Playbooks', 'Training Center'].includes(view);
            permissions[view] = isReadOnlyView ? readOnly : { ...fullAccess, ...defaultAccess };
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
        'Training Center',
        'AI Generator',
        'Settings',
        'Settings - Team', // Manager can view team by default
        'Settings - Certificates',
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
            'Training Center',
            'AI Generator',
            'Settings',
        ],
        // Members get read-only access to most things by default, but can create/edit some.
        { view: true, create: true, edit: true, delete: false } 
    ),
};