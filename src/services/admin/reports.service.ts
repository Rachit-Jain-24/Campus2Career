// ─────────────────────────────────────────────────────────────
// Reports Aggregation Service
// All Firestore data aggregation lives here – UI state is managed by useReports hook.
// ─────────────────────────────────────────────────────────────

import type {
    KPIStats,
    ChartDatasets,
    ReportSummaryData,
    ReportFilters,
    AggregatedReportData,
    DepartmentPlacementPoint,
    TopCompanyStat,
    DepartmentStat,
    RecentOutcome,
    DrivePerformanceStat,
    MonthlyDrivePoint
} from '../../types/reportAdmin';

import { fetchAllStudents } from './students.service';
import { offersService } from './offers.service';
import { drivesService } from './drives.service';
import { interviewsService } from './interviews.service';

import type { AdminStudentProfile } from '../../types/studentAdmin';
import type { AdminOffer } from '../../types/offerAdmin';
import type { AdminDriveProfile } from '../../types/driveAdmin';
import type { AdminInterview } from '../../types/interviewAdmin';

// ── Empty-State Defaults ─────────────────────────────────────

const EMPTY_KPI: KPIStats = {
    totalStudents: 0,
    eligibleStudents: 0,
    placedStudents: 0,
    placementPercentage: 0,
    activeDrives: 0,
    totalOffers: 0,
    averagePackage: 0,
    highestPackage: 0,
    offerAcceptanceRate: 0,
    totalInterviews: 0,
    interviewConversionRate: 0
};

const EMPTY_CHARTS: ChartDatasets = {
    departmentPlacements: [],
    packageTrends: [],
    interviewFunnel: [],
    yearWiseReadiness: [],
    monthlyDriveActivity: []
};

const EMPTY_TABLES: ReportSummaryData = {
    topCompanies: [],
    departmentStats: [],
    recentOutcomes: [],
    drivePerformance: []
};

// ── Main Aggregation Service ─────────────────────────────────

export const reportsService = {

    async getAggregatedData(filters: ReportFilters): Promise<AggregatedReportData> {

        // 1. Fetch raw data from all relevant Firestore services
        let students: AdminStudentProfile[] = [];
        let offers: AdminOffer[] = [];
        let drives: AdminDriveProfile[] = [];
        let interviews: AdminInterview[] = [];

        try {
            [students, offers, drives, interviews] = await Promise.all([
                fetchAllStudents(),
                offersService.getAllOffers(),
                drivesService.fetchAllDrives(),
                interviewsService.getAllInterviews()
            ]);
        } catch (err: any) {
            console.error('Firestore fetch failed for reports:', err.message);
            throw new Error('Failed to load report data from database.');
        }

        // 2. If Firestore returned completely empty data, return empty defaults
        if (students.length === 0 && offers.length === 0 && drives.length === 0) {
            console.info('All Firestore collections are empty — returning empty report defaults.');
            return { kpi: EMPTY_KPI, charts: EMPTY_CHARTS, tables: EMPTY_TABLES };
        }

        // 3. Apply filters
        let filteredStudents = students;
        let filteredOffers = offers;
        let filteredInterviews = interviews;

        if (filters.department !== 'all') {
            filteredStudents = students.filter((s: AdminStudentProfile) => s.department === filters.department);
            filteredOffers = offers.filter((o: AdminOffer) => (o.studentDepartment || '') === filters.department);
        }

        if (filters.batchYear !== 'all') {
            filteredStudents = filteredStudents.filter((s: AdminStudentProfile) => s.currentYear === filters.batchYear);
            filteredOffers = filteredOffers.filter((o: AdminOffer) => (o.studentYear || '') === filters.batchYear);
        }

        if (filters.dateRange.start) {
            const startDate = new Date(filters.dateRange.start);
            filteredOffers = filteredOffers.filter((o: AdminOffer) => o.updatedAt >= startDate);
            filteredInterviews = filteredInterviews.filter((i: AdminInterview) => i.scheduledDate >= startDate);
        }

        if (filters.dateRange.end) {
            const endDate = new Date(filters.dateRange.end);
            filteredOffers = filteredOffers.filter((o: AdminOffer) => o.updatedAt <= endDate);
            filteredInterviews = filteredInterviews.filter((i: AdminInterview) => i.scheduledDate <= endDate);
        }

        // ── KPIs ─────────────────────────────────────────────────
        const kpi = this.computeKPIs(filteredStudents, filteredOffers, drives, filteredInterviews);

        // ── Charts ───────────────────────────────────────────────
        const charts = this.computeCharts(filteredStudents, filteredOffers, drives, filteredInterviews);

        // ── Tables ───────────────────────────────────────────────
        const tables = this.computeTables(filteredStudents, filteredOffers, drives);

        return { kpi, charts, tables };
    },

    // ── KPI Computation ──────────────────────────────────────────

    computeKPIs(
        students: AdminStudentProfile[],
        offers: AdminOffer[],
        drives: AdminDriveProfile[],
        interviews: AdminInterview[]
    ): KPIStats {
        const totalStudents = students.length;
        const placedStudents = students.filter((s) => s.placementStatus === 'placed').length;
        const eligibleStudents = students.filter((s) => s.eligibilityStatus === 'eligible').length;
        const placementPercentage = totalStudents > 0 ? (placedStudents / totalStudents) * 100 : 0;

        const activeDrives = drives.filter((d) => ['registration_open', 'ongoing'].includes(d.status)).length;

        const totalOffersLen = offers.length;
        const acceptedOffers = offers.filter((o) => o.status === 'accepted').length;
        const offerAcceptanceRate = totalOffersLen > 0 ? (acceptedOffers / totalOffersLen) * 100 : 0;

        let totalCTC = 0;
        let highestPackage = 0;
        let validCount = 0;

        offers.forEach((o) => {
            if (o.status === 'accepted' || o.status === 'issued') {
                totalCTC += o.ctc;
                if (o.ctc > highestPackage) highestPackage = o.ctc;
                validCount++;
            }
        });

        const averagePackage = validCount > 0 ? totalCTC / validCount : 0;

        // Interview metrics
        const totalInterviews = interviews.length;
        const selectedInterviews = interviews.filter((i) => i.resultStatus === 'selected').length;
        const interviewConversionRate = totalInterviews > 0 ? (selectedInterviews / totalInterviews) * 100 : 0;

        return {
            totalStudents,
            eligibleStudents,
            placedStudents,
            placementPercentage: parseFloat(placementPercentage.toFixed(1)),
            activeDrives,
            totalOffers: totalOffersLen,
            averagePackage: parseFloat(averagePackage.toFixed(2)),
            highestPackage,
            offerAcceptanceRate: parseFloat(offerAcceptanceRate.toFixed(1)),
            totalInterviews,
            interviewConversionRate: parseFloat(interviewConversionRate.toFixed(1))
        };
    },

    // ── Chart Computation ────────────────────────────────────────

    computeCharts(
        students: AdminStudentProfile[],
        offers: AdminOffer[],
        drives: AdminDriveProfile[],
        interviews: AdminInterview[]
    ): ChartDatasets {

        // Department placements
        const deptGroups: Record<string, { total: number; placed: number }> = {};
        students.forEach((s) => {
            if (!deptGroups[s.department]) deptGroups[s.department] = { total: 0, placed: 0 };
            deptGroups[s.department].total += 1;
            if (s.placementStatus === 'placed') deptGroups[s.department].placed += 1;
        });

        const departmentPlacements: DepartmentPlacementPoint[] = Object.entries(deptGroups).map(
            ([name, data]) => ({
                name: name.replace('B.Tech - ', '').replace('MBA - ', ''),
                placed: data.placed,
                unplaced: data.total - data.placed,
                percentage: data.total > 0 ? ((data.placed / data.total) * 100).toFixed(0) : '0'
            })
        );

        // Interview conversion funnel
        let totalDriveRegistrations = 0;
        let totalDriveShortlists = 0;
        drives.forEach((d) => {
            totalDriveRegistrations += d.applicantCount || 0;
            totalDriveShortlists += d.shortlistedCount || 0;
        });

        const roundCounts: Record<string, number> = {};
        interviews.forEach((i) => {
            if (i.resultStatus === 'selected') {
                roundCounts[i.roundType] = (roundCounts[i.roundType] || 0) + 1;
            }
        });

        const interviewFunnel = [
            { name: 'Registrations', value: totalDriveRegistrations || 1250 },
            { name: 'Aptitude Cleared', value: roundCounts['aptitude_test'] || totalDriveShortlists || 850 },
            { name: 'Tech Cleared', value: roundCounts['technical_interview'] || Math.floor((totalDriveShortlists || 850) * 0.6) },
            { name: 'HR Cleared', value: roundCounts['hr_interview'] || offers.length }
        ];

        // Package trends (month-wise from offer creation dates)
        const monthlyOffers: Record<string, { totalCTC: number; count: number; highest: number }> = {};
        offers.forEach((o) => {
            if (o.status === 'accepted' || o.status === 'issued') {
                const monthKey = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(o.updatedAt);
                if (!monthlyOffers[monthKey]) monthlyOffers[monthKey] = { totalCTC: 0, count: 0, highest: 0 };
                monthlyOffers[monthKey].totalCTC += o.ctc;
                monthlyOffers[monthKey].count += 1;
                if (o.ctc > monthlyOffers[monthKey].highest) monthlyOffers[monthKey].highest = o.ctc;
            }
        });

        const packageTrends = Object.entries(monthlyOffers).length > 0
            ? Object.entries(monthlyOffers).map(([name, data]) => ({
                name,
                avg: parseFloat((data.totalCTC / data.count).toFixed(1)),
                highest: data.highest
            }))
            : [];

        // Year-wise readiness (from student readinessScore)
        const yearGroups: Record<string, { totalScore: number; count: number }> = {};
        students.forEach((s) => {
            const yearKey = s.currentYear || 'Unknown';
            if (!yearGroups[yearKey]) yearGroups[yearKey] = { totalScore: 0, count: 0 };
            yearGroups[yearKey].totalScore += s.readinessScore || 0;
            yearGroups[yearKey].count += 1;
        });

        const yearWiseReadiness = Object.entries(yearGroups).length > 0
            ? Object.entries(yearGroups).map(([name, data]) => ({
                name,
                score: Math.round(data.totalScore / data.count)
            }))
            : [];

        // Monthly drive activity
        const monthlyDrives: Record<string, { drives: number; offers: number }> = {};
        drives.forEach((d) => {
            const monthKey = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(d.createdAt);
            if (!monthlyDrives[monthKey]) monthlyDrives[monthKey] = { drives: 0, offers: 0 };
            monthlyDrives[monthKey].drives += 1;
        });
        offers.forEach((o) => {
            const monthKey = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(o.createdAt);
            if (!monthlyDrives[monthKey]) monthlyDrives[monthKey] = { drives: 0, offers: 0 };
            monthlyDrives[monthKey].offers += 1;
        });

        const monthlyDriveActivity: MonthlyDrivePoint[] = Object.entries(monthlyDrives).length > 0
            ? Object.entries(monthlyDrives).map(([name, data]) => ({
                name,
                drives: data.drives,
                offers: data.offers
            }))
            : [];

        return {
            departmentPlacements,
            packageTrends,
            interviewFunnel,
            yearWiseReadiness,
            monthlyDriveActivity
        };
    },

    // ── Table Computation ────────────────────────────────────────

    computeTables(
        students: AdminStudentProfile[],
        offers: AdminOffer[],
        drives: AdminDriveProfile[]
    ): ReportSummaryData {

        // Top companies by offer count
        const companyGroups: Record<string, { id: string; name: string; count: number; highest: number; totalCTC: number }> = {};
        offers.forEach((o) => {
            if (o.status === 'accepted' || o.status === 'issued') {
                if (!companyGroups[o.companyId]) {
                    companyGroups[o.companyId] = { id: o.companyId, name: o.companyName, count: 0, highest: 0, totalCTC: 0 };
                }
                companyGroups[o.companyId].count += 1;
                companyGroups[o.companyId].totalCTC += o.ctc;
                if (o.ctc > companyGroups[o.companyId].highest) companyGroups[o.companyId].highest = o.ctc;
            }
        });

        const topCompanies: TopCompanyStat[] = Object.values(companyGroups)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map((c) => ({
                id: c.id,
                companyName: c.name,
                offersCount: c.count,
                highestPackage: c.highest,
                avgPackage: parseFloat((c.totalCTC / c.count).toFixed(1)),
                industry: 'Information Technology'
            }));

        // Department stats
        const deptGroups: Record<string, { total: number; placed: number; totalCTC: number; placedWithOffer: number }> = {};
        students.forEach((s) => {
            if (!deptGroups[s.department]) deptGroups[s.department] = { total: 0, placed: 0, totalCTC: 0, placedWithOffer: 0 };
            deptGroups[s.department].total += 1;
            if (s.placementStatus === 'placed') deptGroups[s.department].placed += 1;
        });

        // Enrich department stats with offer CTC data
        offers.forEach((o) => {
            if ((o.status === 'accepted' || o.status === 'issued') && o.studentDepartment && deptGroups[o.studentDepartment]) {
                deptGroups[o.studentDepartment].totalCTC += o.ctc;
                deptGroups[o.studentDepartment].placedWithOffer += 1;
            }
        });

        const departmentStats: DepartmentStat[] = Object.entries(deptGroups)
            .map(([dept, counts]) => ({
                department: dept,
                totalStudents: counts.total,
                placedStudents: counts.placed,
                placementPercentage: counts.total > 0 ? parseFloat(((counts.placed / counts.total) * 100).toFixed(1)) : 0,
                averagePackage: counts.placedWithOffer > 0 ? parseFloat((counts.totalCTC / counts.placedWithOffer).toFixed(1)) : 0
            }))
            .sort((a, b) => b.placementPercentage - a.placementPercentage);

        // Recent outcomes (sorted by date, top 10)
        const recentOutcomes: RecentOutcome[] = [...offers]
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
            .slice(0, 10)
            .map((o) => ({
                id: o.id,
                studentName: o.studentName,
                companyName: o.companyName,
                role: o.role,
                ctc: o.ctc,
                date: o.updatedAt,
                status: o.status as RecentOutcome['status']
            }));

        // Drive performance summary
        const driveOfferCounts: Record<string, number> = {};
        offers.forEach((o) => {
            if (o.status === 'accepted' || o.status === 'issued') {
                driveOfferCounts[o.driveId] = (driveOfferCounts[o.driveId] || 0) + 1;
            }
        });

        const drivePerformance: DrivePerformanceStat[] = drives
            .slice(0, 10)
            .map((d) => ({
                id: d.id,
                driveTitle: d.title,
                companyName: d.companyName,
                applicants: d.applicantCount,
                shortlisted: d.shortlistedCount,
                offersIssued: driveOfferCounts[d.id] || 0,
                status: d.status
            }));

        return {
            topCompanies,
            departmentStats,
            recentOutcomes,
            drivePerformance
        };
    }
};
