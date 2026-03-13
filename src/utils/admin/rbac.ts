import type { AppUser, AdminRole } from '../../types/auth';
import { isAdminUser } from '../../types/auth';
import { ROLE_PERMISSIONS } from '../../config/admin/permissions';
import type { AdminPermission } from '../../config/admin/permissions';

/**
 * Checks if the current user possesses one of the explicitly allowed roles.
 * System Admins bypass this check and always return true if allowedRoles is not empty.
 */
export const hasRole = (user: AppUser | null | undefined, allowedRoles?: AdminRole[]): boolean => {
    if (!user || !isAdminUser(user)) return false;

    // If no specific roles are required, any admin can access
    if (!allowedRoles || allowedRoles.length === 0) return true;

    // System Admins implicitly have access to all role-gated areas
    if (user.role === 'system_admin') return true;

    return allowedRoles.includes(user.role as AdminRole);
};

/**
 * Checks if the current user's role has the explicitly requested functional permission.
 */
export const hasPermission = (user: AppUser | null | undefined, permission: AdminPermission): boolean => {
    if (!user || !isAdminUser(user)) return false;

    // System Admins possess all permissions implicitly
    if (user.role === 'system_admin') return true;

    const userPermissions = ROLE_PERMISSIONS[user.role as AdminRole] || [];
    return userPermissions.includes(permission);
};

/**
 * Determines if a user can access a specific route based on their role and the allowed roles for the route.
 * Currently, this is a semantic wrapper around hasRole.
 */
export const canAccessRoute = (user: AppUser | null | undefined, allowedRoles?: AdminRole[]): boolean => {
    return hasRole(user, allowedRoles);
};
