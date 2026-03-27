import React from 'react';
import { Filter, RotateCcw, Download, Calendar, GraduationCap, Briefcase, Printer } from 'lucide-react';
import type { ReportFilters } from '../../../types/reportAdmin';
import { useAuth } from '../../../contexts/AuthContext';
import { hasRole } from '../../../utils/admin/rbac';

interface ReportFiltersBarProps {
    filters: ReportFilters;
    updateFilter: <K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) => void;
    resetFilters: () => void;
    onExportCSV: () => void;
    onPrint: () => void;
}

export const ReportFiltersBar: React.FC<ReportFiltersBarProps> = ({
    filters,
    updateFilter,
    resetFilters,
    onExportCSV,
    onPrint
}) => {
    const { user } = useAuth();
    const canExport = hasRole(user, ['system_admin', 'placement_officer', 'dean', 'director']);

    return (
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-4 print:hidden">

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pb-4 border-b border-border/50">
                <div className="flex items-center gap-2 text-foreground">
                    <Filter className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-bold text-foreground text-base">Analytical Filters</h3>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-1.5 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg text-sm font-medium transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset All
                    </button>

                    {canExport && (
                        <>
                            <button
                                onClick={onPrint}
                                className="flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary text-foreground hover:text-foreground rounded-lg text-sm font-medium transition-colors"
                            >
                                <Printer className="w-4 h-4" />
                                <span className="hidden sm:inline">Print</span>
                            </button>
                            <button
                                onClick={onExportCSV}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Export CSV</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

                {/* Department Filter */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" /> Department
                    </label>
                    <select
                        value={filters.department}
                        onChange={(e) => updateFilter('department', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500"
                    >
                        <option value="all">All Departments</option>
                        <option value="B.Tech - Computer Engineering">B.Tech - Computer Eng</option>
                        <option value="B.Tech - Information Technology">B.Tech - IT Eng</option>
                        <option value="MBA - Finance">MBA - Finance</option>
                        <option value="MBA - Marketing">MBA - Marketing</option>
                    </select>
                </div>

                {/* Batch Filter */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5" /> Batch
                    </label>
                    <select
                        value={filters.batchYear}
                        onChange={(e) => updateFilter('batchYear', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500"
                    >
                        <option value="all">All Batches</option>
                        <option value="Final Year">Final Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="2nd Year">2nd Year</option>
                    </select>
                </div>

                {/* Academic Year */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Academic Year
                    </label>
                    <select
                        value={filters.academicYear}
                        onChange={(e) => updateFilter('academicYear', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500"
                    >
                        <option value="all">All Years</option>
                        <option value="2023-24">2023-2024</option>
                        <option value="2024-25">2024-2025</option>
                        <option value="2025-26">2025-2026</option>
                    </select>
                </div>

                {/* Date From */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Date From
                    </label>
                    <input
                        type="date"
                        title="Start Date"
                        value={filters.dateRange.start ? new Date(filters.dateRange.start).toISOString().split('T')[0] : ''}
                        onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value ? new Date(e.target.value) : null })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500 appearance-none"
                    />
                </div>

                {/* Date To */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Date To
                    </label>
                    <input
                        type="date"
                        title="End Date"
                        value={filters.dateRange.end ? new Date(filters.dateRange.end).toISOString().split('T')[0] : ''}
                        onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, end: e.target.value ? new Date(e.target.value) : null })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500 appearance-none"
                    />
                </div>

            </div>

        </div>
    );
};
