import React from 'react';
import { ArrowUpDown, Eye, Edit2, UserCheck, UserX, Ban } from 'lucide-react';
import type { AdminUserProfile, UserSortConfig, UserSortField, UserStatus } from '../../../types/userAdmin';

interface UserTableProps {
    users: AdminUserProfile[];
    sort: UserSortConfig;
    toggleSort: (field: UserSortField) => void;
    onViewDetails: (user: AdminUserProfile) => void;
    onEdit: (user: AdminUserProfile) => void;
    onStatusChange: (user: AdminUserProfile, newStatus: UserStatus) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const statusStyle = (s: string) => {
    switch (s) {
        case 'active': return 'text-emerald-400 bg-emerald-500/10';
        case 'inactive': return 'text-slate-400 bg-slate-700/50';
        case 'suspended': return 'text-rose-400 bg-rose-500/10';
        default: return 'text-slate-400 bg-slate-700/50';
    }
};

const roleStyle = (r: string) => {
    switch (r) {
        case 'system_admin': return 'text-fuchsia-400 bg-fuchsia-500/10';
        case 'dean': return 'text-amber-400 bg-amber-500/10';
        case 'director': return 'text-cyan-400 bg-cyan-500/10';
        case 'program_chair': return 'text-blue-400 bg-blue-500/10';
        case 'placement_officer': return 'text-emerald-400 bg-emerald-500/10';
        case 'faculty': return 'text-indigo-400 bg-indigo-500/10';
        default: return 'text-slate-400 bg-slate-700/50';
    }
};

const SortHeader: React.FC<{
    label: string; field: UserSortField; sort: UserSortConfig; toggleSort: (f: UserSortField) => void;
}> = ({ label, field, sort, toggleSort }) => (
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

export const UserTable: React.FC<UserTableProps> = ({
    users, sort, toggleSort, onViewDetails, onEdit, onStatusChange,
    currentPage, totalPages, onPageChange
}) => {
    const formatDate = (date?: Date) => {
        if (!date) return '—';
        return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
    };

    const formatRelative = (date?: Date) => {
        if (!date) return '—';
        const diff = Date.now() - date.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                        <tr className="bg-slate-900/60 text-slate-400 border-b border-slate-800/50">
                            <SortHeader label="Name" field="name" sort={sort} toggleSort={toggleSort} />
                            <SortHeader label="Email" field="email" sort={sort} toggleSort={toggleSort} />
                            <SortHeader label="Role" field="role" sort={sort} toggleSort={toggleSort} />
                            <SortHeader label="Department" field="department" sort={sort} toggleSort={toggleSort} />
                            <SortHeader label="Status" field="status" sort={sort} toggleSort={toggleSort} />
                            <SortHeader label="Created" field="createdAt" sort={sort} toggleSort={toggleSort} />
                            <SortHeader label="Last Login" field="lastLogin" sort={sort} toggleSort={toggleSort} />
                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-800/30 transition-colors group">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                            {u.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                        </div>
                                        <span className="font-medium text-white">{u.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-slate-400 text-xs font-mono">{u.email}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold capitalize ${roleStyle(u.role)}`}>
                                        {u.role.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-300 text-xs max-w-[160px] truncate">{u.department}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${statusStyle(u.status)}`}>
                                        {u.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(u.createdAt)}</td>
                                <td className="px-4 py-3 text-slate-500 text-xs">{formatRelative(u.lastLogin)}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => onViewDetails(u)} title="View Details" className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => onEdit(u)} title="Edit User" className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        {u.status === 'active' ? (
                                            <button onClick={() => onStatusChange(u, 'inactive')} title="Deactivate" className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                                                <UserX className="w-4 h-4" />
                                            </button>
                                        ) : u.status === 'suspended' ? (
                                            <button onClick={() => onStatusChange(u, 'active')} title="Reactivate" className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors">
                                                <UserCheck className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <>
                                                <button onClick={() => onStatusChange(u, 'active')} title="Activate" className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors">
                                                    <UserCheck className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => onStatusChange(u, 'suspended')} title="Suspend" className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                                                    <Ban className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                                    No users match the current filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-slate-800/50 flex justify-between items-center">
                    <span className="text-xs text-slate-500">Page {currentPage} of {totalPages}</span>
                    <div className="flex items-center gap-1">
                        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}
                            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >Previous</button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                            const page = start + i;
                            if (page > totalPages) return null;
                            return (
                                <button key={page} onClick={() => onPageChange(page)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${page === currentPage ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                                >{page}</button>
                            );
                        })}
                        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}
                            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >Next</button>
                    </div>
                </div>
            )}
        </div>
    );
};
