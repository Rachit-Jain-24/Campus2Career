import React from 'react';
import { History, RefreshCw } from 'lucide-react';
import { useAuditLogs } from '../../hooks/admin/useAuditLogs';

import { AuditFiltersBar } from '../../components/admin/audit/AuditFiltersBar';
import { AuditLogTable } from '../../components/admin/audit/AuditLogTable';
import { AuditDetailDrawer } from '../../components/admin/audit/AuditDetailDrawer';

export const AuditLogsPage: React.FC = () => {
    const {
        isLoading,
        error,
        logs,
        totalLogs,
        filters,
        updateFilter,
        resetFilters,
        sort,
        toggleSort,
        currentPage,
        totalPages,
        setCurrentPage,
        selectedLog,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        handleExportCSV,
        refresh
    } = useAuditLogs();

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in-up pb-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                            <History className="w-6 h-6 text-primary" />
                        </div>
                        Audit Logs
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Track all administrative actions, security events, and system changes.
                    </p>
                </div>
                <button
                    onClick={refresh}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary rounded-lg transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-2 font-medium">
                    <span className="font-bold">Error:</span> {error}
                </div>
            )}

            {/* Filters */}
            <AuditFiltersBar
                filters={filters}
                updateFilter={updateFilter}
                resetFilters={resetFilters}
                onExportCSV={handleExportCSV}
                totalLogs={totalLogs}
            />

            {/* Content */}
            {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-3 border border-border border-dashed rounded-xl">
                    <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <p>Loading audit trail…</p>
                </div>
            ) : (
                <AuditLogTable
                    logs={logs}
                    sort={sort}
                    toggleSort={toggleSort}
                    onViewDetails={openDrawer}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}

            {/* Detail Drawer */}
            <AuditDetailDrawer
                log={selectedLog}
                isOpen={isDrawerOpen}
                onClose={closeDrawer}
            />

        </div>
    );
};
