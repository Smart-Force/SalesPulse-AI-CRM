import React, { createContext, useContext } from 'react';
import type { User, RolePermissions, View, PermissionAction } from '../types';

interface PermissionContextType {
    user: User | null;
    permissions: RolePermissions;
}

export const PermissionContext = createContext<PermissionContextType>({ user: null, permissions: {} as RolePermissions });

const defaultPermissions: PermissionAction = {
    view: false,
    create: false,
    edit: false,
    delete: false,
};

export const usePermissions = (view: View): PermissionAction => {
    const context = useContext(PermissionContext);
    if (!context || !context.user) {
        // Default to no permissions if context is not available (e.g., during login)
        return defaultPermissions;
    }

    const userPermissions = context.permissions[context.user.role];
    if (!userPermissions) {
        return defaultPermissions;
    }

    // Get specific permissions for the view, or an empty object if not defined
    const specificPermissions = userPermissions[view] || {};

    // Merge specific permissions with defaults to ensure all keys are present
    return {
        ...defaultPermissions,
        ...specificPermissions,
    };
};

// A simpler hook just to check for view permission, useful for navigation
export const useHasPermission = (view: View) => {
    const { view: canView } = usePermissions(view);
    return canView;
}