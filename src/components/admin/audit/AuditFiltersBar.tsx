import React from 'react';
import { Search, Filter, RotateCcw, Download, Calendar } from 'lucide-react';
import type { AuditLogFilters, AuditActionType, AuditModule, AuditSeverity } from '../../../types/auditAdmin';

interface AuditFiltersBarProps {
    filters: AuditLogFilters;
    updateFilter: <K extends keyof AuditLogFilters>(key: K, value: AuditLogFilters[K]) => void;
    resetFilters: () => void;
    onExportCSV: () => void;
    totalLogs: number;
}

const ACTION_OPTIONS: AuditActionType[] = ['create', 'update', 'delete', 'login', 'logout', 'status_change', 'permission_change', 'settings_update', 'export', 'schedule', 'reschedule'];
const MODULE_OPTIONS: AuditModule[] = ['auth', 'students', 'companies', 'drives', 'eligibility', 'interviews', 'offers', 'reports', 'settings', 'users', 'system'];
const SEVERITY_OPTIONS: AuditSeverity[] = ['low', 'medium', 'high', 'critical'];
const ROLE_OPTIONS = ['system_admin', 'dean', 'director', 'program_chair', 'placement_officer', 'faculty'];

export const AuditFiltersBar: React.FC<AuditFiltersBarProps> = ({
    filters, updateFilter, resetFilters, onExportCSV, totalLogs
}) => {
    return (
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-4">

            {/* Top row: Search + Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={filters.searchQuery}
                        onChange={(e) => updateFilter('searchQuery', e.target.value)}
                        placeholder="Search actor, action, module, target…"
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium">{totalLogs} events</span>
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-1.5 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg text-sm font-medium transition-colors"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset
                    </button>
                    <button
                        onClick={onExportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                </div>
            </div>

            {/* Filter row */}
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                <Filter className="w-3.5 h-3.5 text-indigo-500" />
                Filters
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">

                <select
                    title="Actor Role"
                    value={filters.actorRole}
                    onChange={(e) => updateFilter('actorRole', e.target.value)}
                    className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500"
                >
                    <option value="all">All Roles</option>
                    {ROLE_OPTIONS.map(r => (
                        <option key={r} value={r}>{r.replace('_', ' ')}</option>
                    ))}
                </select>

                <select
                    title="Action Type"
                    value={filters.action}
                    onChange={(e) => updateFilter('action', e.target.value as any)}
                    className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500"
                >
                    <option value="all">All Actions</option>
                    {ACTION_OPTIONS.map(a => (
                        <option key={a} value={a}>{a.replace('_', ' ')}</option>
                    ))}
                </select>

                <select
                    title="Module"
                    value={filters.module}
                    onChange={(e) => updateFilter('module', e.target.value as any)}
                    className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500"
                >
                    <option value="all">All Modules</option>
                    {MODULE_OPTIONS.map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>

                <select
                    title="Severity"
                    value={filters.severity}
                    onChange={(e) => updateFilter('severity', e.target.value as any)}
                    className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500"
                >
                    <option value="all">All Severities</option>
                    {SEVERITY_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>

                <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <input
                        type="date"
                        title="From Date"
                        value={filters.dateRange.start ? new Date(filters.dateRange.start).toISOString().split('T')[0] : ''}
                        onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value ? new Date(e.target.value) : null })}
                        className="w-full px-2 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500 appearance-none"
                    />
                </div>

                <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <input
                        type="date"
                        title="To Date"
                        value={filters.dateRange.end ? new Date(filters.dateRange.end).toISOString().split('T')[0] : ''}
                        onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, end: e.target.value ? new Date(e.target.value) : null })}
                        className="w-full px-2 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500 appearance-none"
                    />
                </div>

            </div>
        </div>
    );
};
