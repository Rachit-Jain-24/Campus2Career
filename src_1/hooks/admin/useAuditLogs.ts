// ─────────────────────────────────────────────────────────────
// useAuditLogs Hook — Full state management for the Audit Logs module
// ─────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect, useMemo } from 'react';
import type {
    AuditLogEntry,
    AuditLogFilters,
    AuditSortConfig,
    AuditSortField
} from '../../types/auditAdmin';
import { auditService } from '../../services/admin/audit.service';

const ITEMS_PER_PAGE = 15;

export const useAuditLogs = () => {
    // ── Loading / Error ──────────────────────────────────────
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ── Raw Data ─────────────────────────────────────────────
    const [allLogs, setAllLogs] = useState<AuditLogEntry[]>([]);

    // ── Filter State ─────────────────────────────────────────
    const [filters, setFilters] = useState<AuditLogFilters>({
        searchQuery: '',
        actorRole: 'all',
        action: 'all',
        module: 'all',
        severity: 'all',
        dateRange: { start: null, end: null }
    });

    // ── Sort State ───────────────────────────────────────────
    const [sort, setSort] = useState<AuditSortConfig>({
        field: 'timestamp',
        order: 'desc'
    });

    // ── Pagination ───────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);

    // ── Selected Log / Drawer State ──────────────────────────
    const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // ── Fetch ────────────────────────────────────────────────
    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await auditService.getAllLogs();
            setAllLogs(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch audit logs.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    // ── Filtered & Sorted ────────────────────────────────────
    const processedLogs = useMemo(() => {
        let result = [...allLogs];

        // Search
        if (filters.searchQuery) {
            const q = filters.searchQuery.toLowerCase();
            result = result.filter(log =>
                log.actorName.toLowerCase().includes(q) ||
                log.summary.toLowerCase().includes(q) ||
                log.action.toLowerCase().includes(q) ||
                log.module.toLowerCase().includes(q) ||
                (log.targetId && log.targetId.toLowerCase().includes(q))
            );
        }

        // Filter by role
        if (filters.actorRole !== 'all') {
            result = result.filter(log => log.actorRole === filters.actorRole);
        }

        // Filter by action
        if (filters.action !== 'all') {
            result = result.filter(log => log.action === filters.action);
        }

        // Filter by module
        if (filters.module !== 'all') {
            result = result.filter(log => log.module === filters.module);
        }

        // Filter by severity
        if (filters.severity !== 'all') {
            result = result.filter(log => log.severity === filters.severity);
        }

        // Filter by date range
        if (filters.dateRange.start) {
            const start = new Date(filters.dateRange.start);
            result = result.filter(log => log.timestamp >= start);
        }
        if (filters.dateRange.end) {
            const end = new Date(filters.dateRange.end);
            result = result.filter(log => log.timestamp <= end);
        }

        // Sort
        result.sort((a, b) => {
            const field = sort.field;
            let cmp = 0;
            if (field === 'timestamp') {
                cmp = a.timestamp.getTime() - b.timestamp.getTime();
            } else {
                const aVal = String(a[field] || '').toLowerCase();
                const bVal = String(b[field] || '').toLowerCase();
                cmp = aVal.localeCompare(bVal);
            }
            return sort.order === 'asc' ? cmp : -cmp;
        });

        return result;
    }, [allLogs, filters, sort]);

    // ── Paginated ────────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(processedLogs.length / ITEMS_PER_PAGE));
    const paginatedLogs = processedLogs.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // ── Filter Helpers ───────────────────────────────────────
    const updateFilter = useCallback(<K extends keyof AuditLogFilters>(key: K, value: AuditLogFilters[K]) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({
            searchQuery: '',
            actorRole: 'all',
            action: 'all',
            module: 'all',
            severity: 'all',
            dateRange: { start: null, end: null }
        });
        setCurrentPage(1);
    }, []);

    // ── Sort Helper ──────────────────────────────────────────
    const toggleSort = useCallback((field: AuditSortField) => {
        setSort(prev => ({
            field,
            order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc'
        }));
    }, []);

    // ── Drawer Helpers ───────────────────────────────────────
    const openDrawer = useCallback((log: AuditLogEntry) => {
        setSelectedLog(log);
        setIsDrawerOpen(true);
    }, []);

    const closeDrawer = useCallback(() => {
        setIsDrawerOpen(false);
        setSelectedLog(null);
    }, []);

    // ── Export CSV ────────────────────────────────────────────
    const handleExportCSV = useCallback(() => {
        const lines: string[] = [];
        lines.push('Timestamp,Actor,Role,Action,Module,Severity,Target ID,Summary');
        processedLogs.forEach(log => {
            lines.push([
                log.timestamp.toISOString(),
                log.actorName,
                log.actorRole,
                log.action,
                log.module,
                log.severity,
                log.targetId || '',
                `"${log.summary.replace(/"/g, '""')}"`
            ].join(','));
        });

        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }, [processedLogs]);

    // ── Return ───────────────────────────────────────────────
    return {
        // State
        isLoading,
        error,

        // Data
        logs: paginatedLogs,
        totalLogs: processedLogs.length,

        // Filters
        filters,
        updateFilter,
        resetFilters,

        // Sort
        sort,
        toggleSort,

        // Pagination
        currentPage,
        totalPages,
        setCurrentPage,

        // Drawer
        selectedLog,
        isDrawerOpen,
        openDrawer,
        closeDrawer,

        // Export
        handleExportCSV,

        // Refresh
        refresh: fetchLogs
    };
};
