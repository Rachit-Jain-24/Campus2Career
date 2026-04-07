import React from 'react';
import { Search, Filter, RotateCcw, UserPlus } from 'lucide-react';
import type { UserFilters } from '../../../types/userAdmin';
import type { AdminRole } from '../../../types/auth';

interface UserFiltersBarProps {
    filters: UserFilters;
    updateFilter: <K extends keyof UserFilters>(key: K, value: UserFilters[K]) => void;
    resetFilters: () => void;
    onAddUser: () => void;
    totalUsers: number;
    departments: string[];
}

const ROLE_OPTIONS: AdminRole[] = ['system_admin', 'dean', 'director', 'program_chair', 'placement_officer', 'faculty'];
const STATUS_OPTIONS = ['active', 'inactive', 'suspended'];

export const UserFiltersBar: React.FC<UserFiltersBarProps> = ({
    filters, updateFilter, resetFilters, onAddUser, totalUsers, departments
}) => {
    return (
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-4">

            {/* Top row */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={filters.searchQuery}
                        onChange={(e) => updateFilter('searchQuery', e.target.value)}
                        placeholder="Search name, email, or UID…"
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium">{totalUsers} users</span>
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-1.5 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg text-sm font-medium transition-colors"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset
                    </button>
                    <button
                        onClick={onAddUser}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add User
                    </button>
                </div>
            </div>

            {/* Filter row */}
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                <Filter className="w-3.5 h-3.5 text-indigo-500" />
                Filters
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                    title="Role"
                    value={filters.role}
                    onChange={(e) => updateFilter('role', e.target.value as any)}
                    className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500"
                >
                    <option value="all">All Roles</option>
                    {ROLE_OPTIONS.map(r => (
                        <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                    ))}
                </select>

                <select
                    title="Department"
                    value={filters.department}
                    onChange={(e) => updateFilter('department', e.target.value)}
                    className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500"
                >
                    <option value="all">All Departments</option>
                    {departments.map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>

                <select
                    title="Status"
                    value={filters.status}
                    onChange={(e) => updateFilter('status', e.target.value as any)}
                    className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500"
                >
                    <option value="all">All Statuses</option>
                    {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};
