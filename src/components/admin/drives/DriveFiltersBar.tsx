import React from 'react';
import { Search, SlidersHorizontal, Plus, X } from 'lucide-react';
import type { DriveFilters } from '../../../types/driveAdmin';
import { useAuth } from '../../../contexts/AuthContext';
import { hasPermission } from '../../../utils/admin/rbac';
import { MOCK_JOB_ROLES } from '../../../data/mock/adminDrivesData';

interface DriveFiltersBarProps {
    filters: DriveFilters;
    updateFilter: <K extends keyof DriveFilters>(key: K, value: DriveFilters[K]) => void;
    resetFilters: () => void;
    onAddDrive: () => void;
    totalResults: number;
}

export const DriveFiltersBar: React.FC<DriveFiltersBarProps> = ({
    filters,
    updateFilter,
    resetFilters,
    onAddDrive,
    totalResults
}) => {
    const { user } = useAuth();
    // Only System Admins, Placement Officers, and Directors should ideally create drives.
    const canManageDrives = hasPermission(user, 'manage_drives');

    return (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm shadow-black/10">

            {/* Top Row: Search and Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">

                {/* Search Bar */}
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search drives, companies, roles..."
                        value={filters.searchQuery}
                        onChange={(e) => updateFilter('searchQuery', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all font-medium"
                    />
                    {filters.searchQuery && (
                        <button
                            onClick={() => updateFilter('searchQuery', '')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full sm:w-auto self-end">
                    <div className="text-sm font-medium text-slate-400 mr-2 whitespace-nowrap">
                        {totalResults} <span className="hidden sm:inline">Drives</span>
                    </div>
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600/50 transition-colors"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span className="hidden sm:inline">Reset</span>
                    </button>

                    {canManageDrives && (
                        <button
                            onClick={onAddDrive}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-lg shadow-brand-500/20 transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create Drive</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Bottom Row: Deep Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-700/50">

                {/* Status */}
                <select
                    value={filters.status}
                    onChange={(e) => updateFilter('status', e.target.value as any)}
                    className="bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-brand-500/50 transition-colors appearance-none font-medium"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.2em' }}
                >
                    <option value="all">All Statuses</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="registration_open">Registration Open</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="draft">Drafts</option>
                </select>

                {/* Job Role */}
                <select
                    value={filters.jobRole}
                    onChange={(e) => updateFilter('jobRole', e.target.value)}
                    className="bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-brand-500/50 transition-colors appearance-none font-medium truncate"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.2em' }}
                >
                    <option value="all">All Roles</option>
                    {MOCK_JOB_ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                    ))}
                </select>

                {/* Hiring Mode */}
                <select
                    value={filters.mode}
                    onChange={(e) => updateFilter('mode', e.target.value as any)}
                    className="bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-brand-500/50 transition-colors appearance-none font-medium"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.2em' }}
                >
                    <option value="all">All Hiring Modes</option>
                    <option value="on-campus">On Campus</option>
                    <option value="pool-campus">Pool Campus</option>
                    <option value="off-campus">Off Campus</option>
                </select>

                {/* Date Sort Shortcut (Just visual indicator for filters bar, full sorting is at table level) */}
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-500 font-medium flex items-center justify-between cursor-not-allowed">
                    <span>Date Configured</span>
                    <SlidersHorizontal className="w-4 h-4 opacity-50" />
                </div>
            </div>
        </div>
    );
};
