import React from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import { useReports } from '../../hooks/admin/useReports';
import { ReportFiltersBar } from '../../components/admin/reports/ReportFiltersBar';
import { KPICards } from '../../components/admin/reports/KPICards';
import { PlacementCharts } from '../../components/admin/reports/PlacementCharts';
import { TopPerformersTable } from '../../components/admin/reports/TopPerformersTable';

export const ReportsPage: React.FC = () => {
    const {
        isLoading,
        error,
        filters,
        updateFilter,
        resetFilters,
        kpi,
        charts,
        tables,
        handleExportCSV,
        handlePrintReport,
        refresh
    } = useReports();

    return (
        <div className="space-y-6 animate-fade-in-up pb-10">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-brand-500/20 rounded-lg border border-brand-500/30">
                            <BarChart3 className="w-6 h-6 text-brand-400" />
                        </div>
                        Reports & Analytics
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Real-time placement intelligence and performance tracking.
                    </p>
                </div>
                <button
                    onClick={refresh}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh Data
                </button>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-400">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Filters */}
            <ReportFiltersBar
                filters={filters}
                updateFilter={updateFilter}
                resetFilters={resetFilters}
                onExportCSV={handleExportCSV}
                onPrint={handlePrintReport}
            />

            {/* Content */}
            {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-3 border border-slate-800 border-dashed rounded-xl">
                    <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <p>Aggregating data from students, offers, drives, and interviews...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Print Header (only visible when printing) */}
                    <div className="hidden print:block text-center mb-8">
                        <h1 className="text-2xl font-bold">Placement Report</h1>
                        <p className="text-sm text-slate-500">Generated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>

                    <KPICards stats={kpi} />
                    <PlacementCharts datasets={charts} />
                    <TopPerformersTable tables={tables} />
                </div>
            )}

        </div>
    );
};
