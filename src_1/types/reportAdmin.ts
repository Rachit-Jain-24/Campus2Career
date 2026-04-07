// ─────────────────────────────────────────────────────────────
// Report & Analytics — Strict Type Definitions
// ─────────────────────────────────────────────────────────────

// ── KPI Metrics ──────────────────────────────────────────────

export interface KPIStats {
    totalStudents: number;
    eligibleStudents: number;
    placedStudents: number;
    placementPercentage: number;
    activeDrives: number;
    totalOffers: number;
    averagePackage: number;   // LPA
    highestPackage: number;   // LPA
    offerAcceptanceRate: number; // Percentage
    totalInterviews: number;
    interviewConversionRate: number; // Percentage
}

// ── Chart Data Series ────────────────────────────────────────

export interface ChartDataPoint {
    name: string;
    value?: number;
    [key: string]: any; // Multiple series for stacked/composed charts
}

export interface DepartmentPlacementPoint {
    name: string;
    placed: number;
    unplaced: number;
    percentage: string | number;
}

export interface PackageTrendPoint {
    name: string;
    avg: number;
    highest: number;
}

export interface FunnelPoint {
    name: string;
    value: number;
}

export interface ReadinessPoint {
    name: string;
    score: number;
}

export interface MonthlyDrivePoint {
    name: string;
    drives: number;
    offers: number;
}

export interface ChartDatasets {
    departmentPlacements: DepartmentPlacementPoint[];
    packageTrends: PackageTrendPoint[];
    interviewFunnel: FunnelPoint[];
    yearWiseReadiness: ReadinessPoint[];
    monthlyDriveActivity: MonthlyDrivePoint[];
}

// ── Table Summaries ──────────────────────────────────────────

export interface TopCompanyStat {
    id: string;
    companyName: string;
    offersCount: number;
    highestPackage: number;
    avgPackage: number;
    industry: string;
}

export interface DepartmentStat {
    department: string;
    totalStudents: number;
    placedStudents: number;
    placementPercentage: number;
    averagePackage: number;
}

export interface RecentOutcome {
    id: string;
    studentName: string;
    companyName: string;
    role: string;
    ctc: number;
    date: Date;
    status: 'accepted' | 'issued' | 'rejected' | 'on_hold' | 'expired';
}

export interface DrivePerformanceStat {
    id: string;
    driveTitle: string;
    companyName: string;
    applicants: number;
    shortlisted: number;
    offersIssued: number;
    status: string;
}

export interface ReportSummaryData {
    topCompanies: TopCompanyStat[];
    departmentStats: DepartmentStat[];
    recentOutcomes: RecentOutcome[];
    drivePerformance: DrivePerformanceStat[];
}

// ── Filter Values ────────────────────────────────────────────

export interface ReportFilters {
    academicYear: string | 'all';
    batchYear: string | 'all';
    department: string | 'all';
    dateRange: { start: Date | null; end: Date | null };
}

// ── Funnel Metrics (detailed) ────────────────────────────────

export interface FunnelMetrics {
    totalRegistrations: number;
    aptitudeCleared: number;
    technicalCleared: number;
    hrCleared: number;
    offersExtended: number;
}

// ── Aggregated Report Payload ────────────────────────────────

export interface AggregatedReportData {
    kpi: KPIStats;
    charts: ChartDatasets;
    tables: ReportSummaryData;
}
