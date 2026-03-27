import { useState, useEffect, useMemo, useCallback } from 'react';
import type { AdminStudentProfile, StudentFilters, SortConfig } from '../../types/studentAdmin';
import { fetchAllStudents } from '../../services/admin/students.service';

export const useStudents = () => {
    const [students, setStudents] = useState<AdminStudentProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Default filters
    const [filters, setFilters] = useState<StudentFilters>({
        searchQuery: '',
        department: 'all',
        year: 'all',
        careerGoal: 'all',
        placementStatus: 'all',
        eligibilityStatus: 'all',
        resumeStatus: 'all',
        cgpaRange: [0, 10],
        readinessRange: [0, 100]
    });

    const [sortConfig, setSortConfig] = useState<SortConfig>({
        field: 'fullName',
        order: 'asc'
    });

    // Simple client-side pagination
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await fetchAllStudents();
                setStudents(data);
                if (data.length === 0) {
                    console.info('Firestore students collection is empty.');
                }
            } catch (err: unknown) {
                console.error('Failed fetching students', err);
                setError(err instanceof Error ? err.message : 'Error communicating with database');
                setStudents([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Memoize the deeply filtered and sorted result
    const processedStudents = useMemo(() => {
        let result = [...students];

        // 1. FILTERING
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            result = result.filter(s =>
                s.fullName.toLowerCase().includes(query) ||
                s.email.toLowerCase().includes(query) ||
                s.sapId.includes(query)
            );
        }

        if (filters.department !== 'all') {
            result = result.filter(s => s.department === filters.department);
        }
        if (filters.year !== 'all') {
            result = result.filter(s => s.currentYear === filters.year);
        }
        if (filters.careerGoal !== 'all') {
            result = result.filter(s => s.careerGoal === filters.careerGoal);
        }
        if (filters.placementStatus !== 'all') {
            result = result.filter(s => s.placementStatus === filters.placementStatus);
        }
        if (filters.eligibilityStatus !== 'all') {
            result = result.filter(s => s.eligibilityStatus === filters.eligibilityStatus);
        }
        if (filters.resumeStatus !== 'all') {
            result = result.filter(s => s.resumeStatus === filters.resumeStatus);
        }

        result = result.filter(s => s.cgpa >= filters.cgpaRange[0] && s.cgpa <= filters.cgpaRange[1]);
        result = result.filter(s => s.readinessScore >= filters.readinessRange[0] && s.readinessScore <= filters.readinessRange[1]);

        // 2. SORTING
        result.sort((a, b) => {
            const fieldA = a[sortConfig.field];
            const fieldB = b[sortConfig.field];

            if (fieldA === fieldB) return 0;

            const comparison = fieldA < fieldB ? -1 : 1;
            return sortConfig.order === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [students, filters, sortConfig]);

    // Derived states
    const totalItems = processedStudents.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Safety check if dynamic filtering pushes us past available pages
    useEffect(() => {
        if (page > totalPages && totalPages > 0) {
            setPage(1);
        }
    }, [totalPages, page]);

    const currentStudents = useMemo(() => {
        const startIndex = (page - 1) * itemsPerPage;
        return processedStudents.slice(startIndex, startIndex + itemsPerPage);
    }, [processedStudents, page, itemsPerPage]);

    // Helpers
    const updateFilter = useCallback(<K extends keyof StudentFilters>(key: K, value: StudentFilters[K]) => {
        setFilters((prev: StudentFilters) => ({ ...prev, [key]: value }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({
            searchQuery: '',
            department: 'all',
            year: 'all',
            careerGoal: 'all',
            placementStatus: 'all',
            eligibilityStatus: 'all',
            resumeStatus: 'all',
            cgpaRange: [0, 10],
            readinessRange: [0, 100]
        });
        setSortConfig({ field: 'fullName', order: 'asc' });
        setPage(1);
    }, []);

    const exportToCSV = useCallback(() => {
        if (processedStudents.length === 0) return;

        const headers = [
            'SAP ID', 'Full Name', 'Email', 'Contact', 'Department', 'Year', 
            'CGPA', 'Readiness Score', 'Career Goal', 'Placement Status', 
            'Eligibility', 'Resume', 'Internship Status', 'LeetCode Solved',
            'Projects', 'Offers', 'Bio', 'Skills', 'Certifications', 'Achievements'
        ];

        const csvRows = processedStudents.map(s => {
            const skills = (s.skills || []).map(skill => typeof skill === 'string' ? skill : (skill as any).name || '').join('; ');
            const certs = (s.certifications || []).map(cert => typeof cert !== 'string' ? cert.name : cert).join('; ');
            const achs = (s.achievements || []).map(ach => ach.title).join('; ');

            return [
                s.sapId,
                `"${s.fullName}"`, 
                s.email,
                s.contact || 'N/A',
                `"${s.department}"`,
                s.currentYear,
                s.cgpa,
                `${s.readinessScore}%`,
                `"${s.careerGoal}"`,
                s.placementStatus,
                s.eligibilityStatus,
                s.resumeStatus,
                s.internshipCompleted ? 'Completed' : 'Pending',
                s.leetcodeStats?.totalSolved || 0,
                s.projectsCount || 0,
                s.offersCount || 0,
                `"${(s.bio || '').replace(/"/g, '""')}"`, // Handle quotes in bio
                `"${skills}"`,
                `"${certs}"`,
                `"${achs}"`
            ].join(',');
        });

        const csvString = [headers.join(','), ...csvRows].join('\n');

        // Trigger download
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `student_directory_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [processedStudents]);

    return {
        // Data
        students: currentStudents,
        totalItems,
        isLoading,
        error,

        // Filters & Sorting state
        filters,
        sortConfig,

        // Pagination state
        page,
        totalPages,

        // Actions
        setFilters,
        updateFilter,
        resetFilters,
        setSortConfig,
        setPage,
        exportToCSV
    };
};
