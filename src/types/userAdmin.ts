// ─────────────────────────────────────────────────────────────
// Admin Users Management — Type Definitions
// ─────────────────────────────────────────────────────────────

import type { AdminRole } from './auth';

// ── User Status ──────────────────────────────────────────────

export type UserStatus = 'active' | 'inactive' | 'suspended';

// ── Admin User Profile (Firestore document) ──────────────────

export interface AdminUserProfile {
    id: string;         // Firestore doc ID (may match Firebase Auth uid)
    uid?: string;       // Firebase Auth UID if provisioned
    name: string;
    email: string;
    role: AdminRole;
    department: string;
    status: UserStatus;
    phone?: string;
    avatarUrl?: string;
    createdAt: Date;
    lastLogin?: Date;
    notes?: string;
}

// ── Form Data ────────────────────────────────────────────────

export interface UserFormData {
    name: string;
    email: string;
    role: AdminRole;
    department: string;
    status: UserStatus;
    phone?: string;
    notes?: string;
}

// ── Filters ──────────────────────────────────────────────────

export interface UserFilters {
    searchQuery: string;
    role: AdminRole | 'all';
    department: string | 'all';
    status: UserStatus | 'all';
}

// ── Sort ─────────────────────────────────────────────────────

export type UserSortField = 'name' | 'email' | 'role' | 'department' | 'status' | 'createdAt' | 'lastLogin';
export type SortOrder = 'asc' | 'desc';

export interface UserSortConfig {
    field: UserSortField;
    order: SortOrder;
}
