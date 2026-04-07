import React from 'react';
import { Search, SlidersHorizontal, Plus, X } from 'lucide-react';
import type { CompanyFilters } from '../../../types/companyAdmin';
import { MOCK_INDUSTRIES, MOCK_LOCATIONS } from '../../../data/mock/adminCompaniesData';
import { useAuth } from '../../../contexts/AuthContext';
import { hasPermission } from '../../../utils/admin/rbac';

interface CompanyFiltersBarProps {
    filters: CompanyFilters;
    updateFilter: <K extends keyof CompanyFilters>(key: K, value: CompanyFilters[K]) => void;
    resetFilters: () => void;
    onAddCompany: () => void;
    totalResults: number;
}

export const CompanyFiltersBar: React.FC<CompanyFiltersBarProps> = ({
    filters,
    updateFilter,
    resetFilters,
    onAddCompany,
    totalResults
}) => {
    const { user } = useAuth();
    // Only Placement Officers and System Admins should add companies typically
    const canManageCompanies = hasPermission(user, 'manage_companies');

    return (
        <div className="bg-secondary/50 border border-border/50 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm shadow-black/10">

            {/* Top Row: Search and Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">

                {/* Search Bar */}
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search companies, HR names, emails..."
                        value={filters.searchQuery}
                        onChange={(e) => updateFilter('searchQuery', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-card/50 border border-border/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all font-medium"
                    />
                    {filters.searchQuery && (
                        <button
                            onClick={() => updateFilter('searchQuery', '')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-200 p-1"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full sm:w-auto self-end">
                    <div className="text-sm font-medium text-muted-foreground mr-2 whitespace-nowrap">
                        {totalResults} <span className="hidden sm:inline">Records Found</span>
                    </div>
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary rounded-lg border border-slate-600/50 transition-colors"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span className="hidden sm:inline">Reset</span>
                    </button>

                    {canManageCompanies && (
                        <button
                            onClick={onAddCompany}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-foreground bg-primary hover:bg-brand-500 rounded-lg shadow-lg shadow-brand-500/20 transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Company</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Bottom Row: Deep Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-border/50">

                {/* Status */}
                <select
                    value={filters.status}
                    onChange={(e) => updateFilter('status', e.target.value as any)}
                    className="bg-card/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors appearance-none font-medium"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.2em' }}
                >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Partners</option>
                    <option value="upcoming">Upcoming Drives</option>
                    <option value="inactive">Inactive</option>
                    <option value="blacklisted">Blacklisted</option>
                </select>

                {/* Industry */}
                <select
                    value={filters.industry}
                    onChange={(e) => updateFilter('industry', e.target.value)}
                    className="bg-card/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors appearance-none font-medium"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.2em' }}
                >
                    <option value="all">All Industries</option>
                    {MOCK_INDUSTRIES.map(ind => (
                        <option key={ind} value={ind}>{ind}</option>
                    ))}
                </select>

                {/* Location */}
                <select
                    value={filters.location}
                    onChange={(e) => updateFilter('location', e.target.value)}
                    className="bg-card/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors appearance-none font-medium"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.2em' }}
                >
                    <option value="all">All Locations</option>
                    {MOCK_LOCATIONS.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                    ))}
                </select>

                {/* Hiring Mode */}
                <select
                    value={filters.hiringMode}
                    onChange={(e) => updateFilter('hiringMode', e.target.value as any)}
                    className="bg-card/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors appearance-none font-medium"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.2em' }}
                >
                    <option value="all">All Hiring Modes</option>
                    <option value="on-campus">On Campus</option>
                    <option value="pool-campus">Pool Campus</option>
                    <option value="off-campus">Off Campus</option>
                </select>
            </div>
        </div>
    );
};
