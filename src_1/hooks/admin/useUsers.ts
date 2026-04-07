// ─────────────────────────────────────────────────────────────
// useUsers Hook — Full state management for the Users module
// ─────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect, useMemo } from 'react';
import type {
    AdminUserProfile,
    UserFormData,
    UserFilters,
    UserSortConfig,
    UserSortField,
    UserStatus
} from '../../types/userAdmin';
import { usersService } from '../../services/admin/users.service';
import { useAuth } from '../../contexts/AuthContext';
import type { AdminRole } from '../../types/auth';
import { canViewRole, canManageRole, getManageableRoles } from '../../config/admin/roleHierarchy';

const ITEMS_PER_PAGE = 12;

export const useUsers = () => {
    const { user: currentUser } = useAuth();

    // ── Loading / Error / Success ────────────────────────────
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // ── Raw Data ─────────────────────────────────────────────
    const [allUsers, setAllUsers] = useState<AdminUserProfile[]>([]);

    // ── Filter State ─────────────────────────────────────────
    const [filters, setFilters] = useState<UserFilters>({
        searchQuery: '',
        role: 'all',
        department: 'all',
        status: 'all',
    });

    // ── Sort State ───────────────────────────────────────────
    const [sort, setSort] = useState<UserSortConfig>({
        field: 'createdAt',
        order: 'desc',
    });

    // ── Pagination ───────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);

    // ── Selected User / Drawer State ─────────────────────────
    const [selectedUser, setSelectedUser] = useState<AdminUserProfile | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // ── Form Modal State ─────────────────────────────────────
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUserProfile | null>(null);

    // ── Confirm Modal State ──────────────────────────────────
    const [confirmAction, setConfirmAction] = useState<{ user: AdminUserProfile; newStatus: UserStatus } | null>(null);

    // ── Fetch ────────────────────────────────────────────────
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await usersService.getAllUsers();
            setAllUsers(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch users.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    // ── Auto-clear success ───────────────────────────────────
    useEffect(() => {
        if (successMessage) {
            const t = setTimeout(() => setSuccessMessage(null), 3000);
            return () => clearTimeout(t);
        }
    }, [successMessage]);

    // ── Hierarchy-aware helpers ────────────────────────────────
    const currentAdminRole = (currentUser?.role || 'faculty') as AdminRole;
    const manageableRoles = useMemo(() => getManageableRoles(currentAdminRole), [currentAdminRole]);
    const canManage = useCallback((targetRole: string) => canManageRole(currentAdminRole, targetRole as AdminRole), [currentAdminRole]);

    // ── Processed (filtered + sorted + hierarchy-filtered) ───
    const processedUsers = useMemo(() => {
        // Only show users whose role the current user can view
        let result = allUsers.filter(u => canViewRole(currentAdminRole, u.role as AdminRole));

        if (filters.searchQuery) {
            const q = filters.searchQuery.toLowerCase();
            result = result.filter(u =>
                u.name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                u.id.toLowerCase().includes(q)
            );
        }

        if (filters.role !== 'all') {
            result = result.filter(u => u.role === filters.role);
        }
        if (filters.department !== 'all') {
            result = result.filter(u => u.department === filters.department);
        }
        if (filters.status !== 'all') {
            result = result.filter(u => u.status === filters.status);
        }

        result.sort((a, b) => {
            const field = sort.field;
            let cmp = 0;
            if (field === 'createdAt' || field === 'lastLogin') {
                const aTime = (a[field] as Date | undefined)?.getTime() || 0;
                const bTime = (b[field] as Date | undefined)?.getTime() || 0;
                cmp = aTime - bTime;
            } else {
                const aVal = String(a[field] || '').toLowerCase();
                const bVal = String(b[field] || '').toLowerCase();
                cmp = aVal.localeCompare(bVal);
            }
            return sort.order === 'asc' ? cmp : -cmp;
        });

        return result;
    }, [allUsers, filters, sort]);

    // ── Paginated ────────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(processedUsers.length / ITEMS_PER_PAGE));
    const paginatedUsers = processedUsers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // ── Unique departments (for filter dropdown) ─────────────
    const departments = useMemo(() => {
        const deptSet = new Set(allUsers.map(u => u.department));
        return Array.from(deptSet).sort();
    }, [allUsers]);

    // ── Filter Helpers ───────────────────────────────────────
    const updateFilter = useCallback(<K extends keyof UserFilters>(key: K, value: UserFilters[K]) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({ searchQuery: '', role: 'all', department: 'all', status: 'all' });
        setCurrentPage(1);
    }, []);

    // ── Sort Helper ──────────────────────────────────────────
    const toggleSort = useCallback((field: UserSortField) => {
        setSort(prev => ({
            field,
            order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc',
        }));
    }, []);

    // ── Drawer ───────────────────────────────────────────────
    const openDrawer = useCallback((u: AdminUserProfile) => {
        setSelectedUser(u);
        setIsDrawerOpen(true);
    }, []);

    const closeDrawer = useCallback(() => {
        setIsDrawerOpen(false);
        setSelectedUser(null);
    }, []);

    // ── Form Modal ───────────────────────────────────────────
    const openAddForm = useCallback(() => {
        setEditingUser(null);
        setIsFormOpen(true);
    }, []);

    const openEditForm = useCallback((u: AdminUserProfile) => {
        setEditingUser(u);
        setIsFormOpen(true);
    }, []);

    const closeForm = useCallback(() => {
        setIsFormOpen(false);
        setEditingUser(null);
    }, []);

    // ── CRUD ─────────────────────────────────────────────────
    const handleSaveUser = useCallback(async (data: UserFormData) => {
        setError(null);
        try {
            if (editingUser) {
                await usersService.updateUser(editingUser.id, data, currentUser?.email || undefined);
                setAllUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...data } : u));
                setSuccessMessage(`User "${data.name}" updated successfully.`);
            } else {
                const newUser = await usersService.createUser(data, currentUser?.email || undefined);
                setAllUsers(prev => [newUser, ...prev]);
                setSuccessMessage(`User "${data.name}" created successfully.`);
            }
            closeForm();
        } catch (err: any) {
            setError(err.message || 'Failed to save user.');
        }
    }, [editingUser, currentUser, closeForm]);

    // ── Activate / Deactivate ────────────────────────────────
    const requestStatusChange = useCallback((u: AdminUserProfile, newStatus: UserStatus) => {
        setConfirmAction({ user: u, newStatus });
    }, []);

    const confirmStatusChange = useCallback(async () => {
        if (!confirmAction) return;
        setError(null);
        try {
            await usersService.changeStatus(
                confirmAction.user.id,
                confirmAction.user.name,
                confirmAction.newStatus,
                currentUser?.email || undefined
            );
            setAllUsers(prev =>
                prev.map(u => u.id === confirmAction.user.id ? { ...u, status: confirmAction.newStatus } : u)
            );
            setSuccessMessage(`Status changed to "${confirmAction.newStatus}" for ${confirmAction.user.name}.`);
        } catch (err: any) {
            setError(err.message || 'Failed to change status.');
        } finally {
            setConfirmAction(null);
        }
    }, [confirmAction, currentUser]);

    const cancelStatusChange = useCallback(() => {
        setConfirmAction(null);
    }, []);

    // ── Return ───────────────────────────────────────────────
    return {
        // Hierarchy
        manageableRoles,
        canManage,

        isLoading,
        error,
        successMessage,

        users: paginatedUsers,
        totalUsers: processedUsers.length,
        departments,

        filters,
        updateFilter,
        resetFilters,

        sort,
        toggleSort,

        currentPage,
        totalPages,
        setCurrentPage,

        selectedUser,
        isDrawerOpen,
        openDrawer,
        closeDrawer,

        isFormOpen,
        editingUser,
        openAddForm,
        openEditForm,
        closeForm,
        handleSaveUser,

        confirmAction,
        requestStatusChange,
        confirmStatusChange,
        cancelStatusChange,

        refresh: fetchUsers,
    };
};
