// ─────────────────────────────────────────────────────────────
// useReports Hook — Manages all Reports & Analytics UI state
// ─────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect } from 'react';
import type {
    KPIStats,
    ChartDatasets,
    ReportSummaryData,
    ReportFilters
} from '../../types/reportAdmin';
import { reportsService } from '../../services/admin/reports.service';

export const useReports = () => {
    // ── Loading / Error ──────────────────────────────────────
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ── Filter State ─────────────────────────────────────────
    const [filters, setFilters] = useState<ReportFilters>({
        academicYear: 'all',
        batchYear: 'all',
        department: 'all',
        dateRange: { start: null, end: null }
    });

    // ── Derived KPI State ────────────────────────────────────
    const [kpi, setKpi] = useState<KPIStats | null>(null);

    // ── Chart Dataset State ──────────────────────────────────
    const [charts, setCharts] = useState<ChartDatasets | null>(null);

    // ── Table Summary State ──────────────────────────────────
    const [tables, setTables] = useState<ReportSummaryData | null>(null);

    // ── Data Fetcher ─────────────────────────────────────────
    const fetchAnalytics = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await reportsService.getAggregatedData(filters);
            setKpi(data.kpi);
            setCharts(data.charts);
            setTables(data.tables);
        } catch (err: any) {
            console.error('Failed to aggregate reports data:', err);
            setError(err.message || 'Failed to aggregate analytical data.');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    // ── Filter Updaters ──────────────────────────────────────
    const updateFilter = useCallback(<K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({
            academicYear: 'all',
            batchYear: 'all',
            department: 'all',
            dateRange: { start: null, end: null }
        });
    }, []);

    // ── Export Helpers ────────────────────────────────────────

    const handleExportCSV = useCallback(() => {
        if (!tables) return;

        // Build CSV content from table summary data
        const lines: string[] = [];

        // Section 1: Top Companies
        lines.push('=== Top Hiring Companies ===');
        lines.push('Company,Offers,Highest CTC (LPA),Avg CTC (LPA)');
        tables.topCompanies.forEach(c => {
            lines.push(`${c.companyName},${c.offersCount},${c.highestPackage},${c.avgPackage}`);
        });
        lines.push('');

        // Section 2: Department Stats
        lines.push('=== Department Statistics ===');
        lines.push('Department,Total Students,Placed,Placement %,Avg Package (LPA)');
        tables.departmentStats.forEach(d => {
            lines.push(`${d.department},${d.totalStudents},${d.placedStudents},${d.placementPercentage}%,${d.averagePackage}`);
        });
        lines.push('');

        // Section 3: Drive Performance
        lines.push('=== Drive Performance ===');
        lines.push('Drive,Company,Applicants,Shortlisted,Offers,Status');
        tables.drivePerformance.forEach(d => {
            lines.push(`${d.driveTitle},${d.companyName},${d.applicants},${d.shortlisted},${d.offersIssued},${d.status}`);
        });
        lines.push('');

        // Section 4: Recent Outcomes
        lines.push('=== Recent Placement Outcomes ===');
        lines.push('Student,Company,Role,CTC (LPA),Status');
        tables.recentOutcomes.forEach(o => {
            lines.push(`${o.studentName},${o.companyName},${o.role},${o.ctc},${o.status}`);
        });

        // Download
        const csvContent = lines.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `placement_report_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }, [tables]);

    const handlePrintReport = useCallback(() => {
        window.print();
    }, []);

    // ── Return ───────────────────────────────────────────────
    return {
        // State
        isLoading,
        error,

        // Filter state
        filters,
        updateFilter,
        resetFilters,

        // Derived KPI state
        kpi,

        // Chart dataset state
        charts,

        // Table summary state
        tables,

        // Export helper triggers
        handleExportCSV,
        handlePrintReport,

        // Refresh
        refresh: fetchAnalytics
    };
};
