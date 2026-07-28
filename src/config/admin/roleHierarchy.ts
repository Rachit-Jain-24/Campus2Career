// ─────────────────────────────────────────────────────────────
// Role Hierarchy Configuration
// Extends existing flat RBAC with hierarchical admin control
// ─────────────────────────────────────────────────────────────

import type { AdminRole } from '../../types/auth';

/**
 * Hierarchy Levels
 * 
 * Dean (5)
 *  └── Director (4)
 *       ├── Program Chair (3)
 *       │    └── Faculty (1)
 *       ├── Placement Officer (2)
 *       └── System Admin (2)
 */
export const ROLE_HIERARCHY: Record<AdminRole, number> = {
    dean: 5,
    director: 4,
    program_chair: 3,
    system_admin: 2,
    placement_officer: 2,
    faculty: 1,
};

/** Direct subordinates each role can manage */
export const ROLE_SUBORDINATES: Record<AdminRole, AdminRole[]> = {
    dean: ['director', 'program_chair', 'placement_officer', 'system_admin', 'faculty'],
    director: ['program_chair', 'placement_officer', 'system_admin', 'faculty'],
    program_chair: ['faculty'],
    placement_officer: [],
    faculty: [],
    system_admin: [],
};

/** Display-friendly role labels */
export const ROLE_LABELS: Record<AdminRole, string> = {
    dean: 'Dean',
    director: 'Director',
    program_chair: 'Program Chair',
    faculty: 'Faculty',
    placement_officer: 'Placement Officer',
    system_admin: 'System Admin',
};

/** Get numerical hierarchy level for a role */
export const getRoleLevel = (role: AdminRole): number => {
    return ROLE_HIERARCHY[role] ?? 0;
};

/** Check if currentRole can manage (create/edit/deactivate) targetRole */
export const canManageRole = (currentRole: AdminRole, targetRole: AdminRole): boolean => {
    if (currentRole === targetRole) return false; // Cannot manage own role level
    return ROLE_SUBORDINATES[currentRole]?.includes(targetRole) ?? false;
};

/** Check if currentRole can view records of targetRole */
export const canViewRole = (currentRole: AdminRole, targetRole: AdminRole): boolean => {
    if (currentRole === targetRole) return true; // Can always view peers
    return getRoleLevel(currentRole) >= getRoleLevel(targetRole);
};

/** Check if currentRole can assign targetRole to a new user */
export const canAssignRole = (currentRole: AdminRole, targetRole: AdminRole): boolean => {
    // Same as canManageRole — can only assign subordinate roles
    return canManageRole(currentRole, targetRole);
};

/** Get all roles that a given role can manage */
export const getManageableRoles = (role: AdminRole): AdminRole[] => {
    return ROLE_SUBORDINATES[role] || [];
};

/** Get all roles sorted by hierarchy level (highest first) */
export const getRolesSortedByHierarchy = (): AdminRole[] => {
    return (Object.keys(ROLE_HIERARCHY) as AdminRole[]).sort(
        (a, b) => ROLE_HIERARCHY[b] - ROLE_HIERARCHY[a]
    );
};
