import React from 'react';
import { Search, SlidersHorizontal, Download, X } from 'lucide-react';
import type { StudentFilters } from '../../../types/studentAdmin';

interface StudentFiltersBarProps {
    filters: StudentFilters;
    updateFilter: <K extends keyof StudentFilters>(key: K, value: StudentFilters[K]) => void;
    resetFilters: () => void;
    onExport: () => void;
    totalResults: number;
}

export const StudentFiltersBar: React.FC<StudentFiltersBarProps> = ({
    filters,
    updateFilter,
    resetFilters,
    onExport,
    totalResults
}) => {
    return (
        <div className="bg-secondary/50 border border-border/50 rounded-xl p-4 sm:p-5 space-y-4">

            {/* Top Row: Search and Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">

                {/* Search Bar */}
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by name, SAP ID, or email..."
                        value={filters.searchQuery}
                        onChange={(e) => updateFilter('searchQuery', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-card/50 border border-border/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                    />
                    {filters.searchQuery && (
                        <button
                            onClick={() => updateFilter('searchQuery', '')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-200"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full sm:w-auto self-end">
                    <div className="text-sm font-medium text-muted-foreground mr-2">
                        {totalResults} <span className="hidden sm:inline">Students Found</span>
                    </div>
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary rounded-lg border border-slate-600/50 transition-colors"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span className="hidden sm:inline">Reset</span>
                    </button>
                    <button
                        onClick={onExport}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-primary hover:bg-brand-500 rounded-lg shadow-lg shadow-brand-500/20 transition-all active:scale-95"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Bottom Row: Deep Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2 border-t border-border/50">
                {/* Department (Branch) */}
                <select
                    value={filters.department}
                    onChange={(e) => updateFilter('department', e.target.value)}
                    className="bg-card/50 border border-border/50 rounded-xl px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.2em' }}
                >
                    <option value="all">All Branches</option>
                    <option value="B.Tech CSDS">B.Tech CSDS</option>
                    <option value="B.Tech AI/ML">B.Tech AI/ML</option>
                    <option value="B.Tech Cyber Security">Cyber Security</option>
                    <option value="B.Tech CSBS">B.Tech CSBS</option>
                    <option value="MBA Tech">MBA Tech</option>
                </select>

                {/* Year */}
                <select
                    value={filters.year}
                    onChange={(e) => updateFilter('year', e.target.value)}
                    className="bg-card/50 border border-border/50 rounded-xl px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.2em' }}
                >
                    <option value="all">All Years</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year (Final)</option>
                </select>

                {/* Career Goal */}
                <select
                    value={filters.careerGoal}
                    onChange={(e) => updateFilter('careerGoal', e.target.value)}
                    className="bg-card/50 border border-border/50 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.2em' }}
                >
                    <option value="all">All Career Goals</option>
                    <option value="Corporate Placement">Corporate Placement</option>
                    <option value="Higher Education">Higher Education</option>
                    <option value="Entrepreneurship">Entrepreneurship</option>
                    <option value="Undecided">Undecided</option>
                </select>

                {/* Placement Status */}
                <select
                    value={filters.placementStatus}
                    onChange={(e) => updateFilter('placementStatus', e.target.value as any)}
                    className="bg-card/50 border border-border/50 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.2em' }}
                >
                    <option value="all">All Placement Statuses</option>
                    <option value="placed">Placed</option>
                    <option value="unplaced">Unplaced</option>
                    <option value="opted_out">Opted Out</option>
                    <option value="higher_studies">Higher Studies</option>
                    <option value="not_eligible">Not Eligible</option>
                </select>

                {/* Eligibility Status */}
                <select
                    value={filters.eligibilityStatus}
                    onChange={(e) => updateFilter('eligibilityStatus', e.target.value as any)}
                    className="bg-card/50 border border-border/50 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.2em' }}
                >
                    <option value="all">All Eligibility</option>
                    <option value="eligible">Eligible</option>
                    <option value="not_eligible">Not Eligible</option>
                    <option value="pending_review">Pending Review</option>
                </select>

                {/* Resume Status */}
                <select
                    value={filters.resumeStatus}
                    onChange={(e) => updateFilter('resumeStatus', e.target.value as any)}
                    className="bg-card/50 border border-border/50 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.2em' }}
                >
                    <option value="all">All Resume Statuses</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                    <option value="not_uploaded">Not Uploaded</option>
                </select>
            </div>
        </div>
    );
};
