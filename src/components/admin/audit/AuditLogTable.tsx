import React from 'react';
import { ArrowUpDown, Eye } from 'lucide-react';
import type { AuditLogEntry, AuditSortConfig, AuditSortField } from '../../../types/auditAdmin';

interface AuditLogTableProps {
    logs: AuditLogEntry[];
    sort: AuditSortConfig;
    toggleSort: (field: AuditSortField) => void;
    onViewDetails: (log: AuditLogEntry) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const severityColor = (s: string) => {
    switch (s) {
        case 'critical': return 'text-rose-400 bg-rose-500/10';
        case 'high': return 'text-amber-400 bg-amber-500/10';
        case 'medium': return 'text-blue-400 bg-blue-500/10';
        case 'low': return 'text-slate-400 bg-slate-700/50';
        default: return 'text-slate-400 bg-slate-700/50';
    }
};

const actionColor = (a: string) => {
    switch (a) {
        case 'create': return 'text-emerald-400';
        case 'update': return 'text-blue-400';
        case 'delete': return 'text-rose-400';
        case 'login': return 'text-cyan-400';
        case 'logout': return 'text-slate-400';
        case 'status_change': return 'text-amber-400';
        case 'permission_change': return 'text-fuchsia-400';
        case 'settings_update': return 'text-indigo-400';
        case 'export': return 'text-teal-400';
        case 'schedule': return 'text-blue-400';
        case 'reschedule': return 'text-amber-400';
        default: return 'text-slate-400';
    }
};

const SortHeader: React.FC<{ label: string; field: AuditSortField; sort: AuditSortConfig; toggleSort: (f: AuditSortField) => void }> = ({ label, field, sort, toggleSort }) => (
    <th
        className="px-4 py-3 font-medium cursor-pointer hover:text-white transition-colors select-none"
        onClick={() => toggleSort(field)}
    >
        <span className="flex items-center gap-1">
            {label}
            <ArrowUpDown className={`w-3 h-3 ${sort.field === field ? 'text-indigo-400' : 'text-slate-600'}`} />
        </span>
    </th>
);

export const AuditLogTable: React.FC<AuditLogTableProps> = ({
    logs, sort, toggleSort, onViewDetails, currentPage, totalPages, onPageChange
}) => {
    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-IN', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true
        }).format(date);
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                        <tr className="bg-slate-900/60 text-slate-400 border-b border-slate-800/50">
                            <SortHeader label="Timestamp" field="timestamp" sort={sort} toggleSort={toggleSort} />
                            <SortHeader label="Actor" field="actorName" sort={sort} toggleSort={toggleSort} />
                            <th className="px-4 py-3 font-medium">Role</th>
                            <SortHeader label="Action" field="action" sort={sort} toggleSort={toggleSort} />
                            <SortHeader label="Module" field="module" sort={sort} toggleSort={toggleSort} />
                            <th className="px-4 py-3 font-medium">Target</th>
                            <th className="px-4 py-3 font-medium">Summary</th>
                            <SortHeader label="Severity" field="severity" sort={sort} toggleSort={toggleSort} />
                            <th className="px-4 py-3 font-medium text-right">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-800/30 transition-colors group">
                                <td className="px-4 py-3 text-slate-400 text-xs font-mono">
                                    {formatTime(log.timestamp)}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-medium text-white">{log.actorName}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-xs font-medium">
                                        {log.actorRole.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`font-semibold capitalize ${actionColor(log.action)}`}>
                                        {log.action.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-xs font-medium capitalize">
                                        {log.module}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                                    {log.targetId ? log.targetId.substring(0, 16) : '—'}
                                </td>
                                <td className="px-4 py-3 text-slate-300 max-w-[200px] truncate">
                                    {log.summary}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${severityColor(log.severity)}`}>
                                        {log.severity}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() => onViewDetails(log)}
                                        className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                                    No audit events match the current filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-slate-800/50 flex justify-between items-center">
                    <span className="text-xs text-slate-500">
                        Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                            const page = start + i;
                            if (page > totalPages) return null;
                            return (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${page === currentPage
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};
