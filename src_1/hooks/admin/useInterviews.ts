import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
    AdminInterview,
    InterviewFilters,
    InterviewSortConfig,
    InterviewFormData
} from '../../types/interviewAdmin';
import { interviewsService } from '../../services/admin/interviews.service';

export const useInterviews = () => {
    const [interviews, setInterviews] = useState<AdminInterview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter States
    const [filters, setFilters] = useState<InterviewFilters>({
        searchQuery: '',
        date: null,
        company: 'all',
        drive: 'all',
        roundType: 'all',
        mode: 'all',
        status: 'all'
    });

    // Sort States
    const [sortConfig, setSortConfig] = useState<InterviewSortConfig>({
        field: 'scheduledDate',
        order: 'asc' // often we want closest upcoming first
    });

    // Pagination
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    // View / Modify trackers
    const [selectedInterview, setSelectedInterview] = useState<AdminInterview | null>(null);
    const [isDrawerViewOpen, setIsDrawerViewOpen] = useState(false);

    // Add/Edit Modal
    const [formState, setFormState] = useState<{
        mode: 'add' | 'edit';
        initialData?: AdminInterview;
    } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const fetchInterviews = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await interviewsService.getAllInterviews();
            setInterviews(data);
            if (data.length === 0) {
                console.info('Firestore interviews collection is empty.');
            }
        } catch (err: any) {
            console.error('Error fetching interview schedules:', err);
            setError(err.message || 'Failed to connect to active scheduling database.');
            setInterviews([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInterviews();
    }, [fetchInterviews]);

    // Derived filtering/sorting logic
    const processedInterviews = useMemo(() => {
        let result = [...interviews];

        // Search text
        if (filters.searchQuery) {
            const q = filters.searchQuery.toLowerCase();
            result = result.filter(i =>
                i.studentName.toLowerCase().includes(q) ||
                i.companyName.toLowerCase().includes(q) ||
                i.driveTitle.toLowerCase().includes(q) ||
                (i.panelName && i.panelName.toLowerCase().includes(q))
            );
        }

        // Date match (exact or range as needed, for simplicity we match same day)
        if (filters.date) {
            const filterTime = filters.date.getTime();
            result = result.filter(i => {
                const iTime = new Date(i.scheduledDate).setHours(0, 0, 0, 0);
                return Math.abs(iTime - filterTime) < 86400000; // Same day roughly
            });
        }

        if (filters.company !== 'all') {
            result = result.filter(i => i.companyName === filters.company); // Typically match by ID, using Name for simplicity in mock setups
        }

        if (filters.drive !== 'all') {
            result = result.filter(i => i.driveId === filters.drive);
        }

        if (filters.roundType !== 'all') {
            result = result.filter(i => i.roundType === filters.roundType);
        }

        if (filters.mode !== 'all') {
            result = result.filter(i => i.mode === filters.mode);
        }

        if (filters.status !== 'all') {
            result = result.filter(i => i.status === filters.status);
        }

        // Sorting
        result.sort((a, b) => {
            let aValue: any = a[sortConfig.field];
            let bValue: any = b[sortConfig.field];

            if (sortConfig.field === 'studentName' || sortConfig.field === 'companyName') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) return sortConfig.order === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.order === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [interviews, filters, sortConfig]);

    const totalItems = processedInterviews.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    const paginatedInterviews = useMemo(() => {
        const start = (page - 1) * itemsPerPage;
        return processedInterviews.slice(start, start + itemsPerPage);
    }, [processedInterviews, page]);

    useEffect(() => {
        if (page > totalPages) {
            setPage(1);
        }
    }, [totalPages, page]);

    const updateFilter = useCallback(<K extends keyof InterviewFilters>(key: K, value: InterviewFilters[K]) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({
            searchQuery: '',
            date: null,
            company: 'all',
            drive: 'all',
            roundType: 'all',
            mode: 'all',
            status: 'all'
        });
        setPage(1);
    }, []);

    const handleSaveInterview = async (formData: InterviewFormData) => {
        setIsSaving(true);
        try {
            if (formState?.mode === 'edit' && formState.initialData) {
                await interviewsService.updateInterview(formState.initialData.id, formData);

                setInterviews(prev => prev.map(i =>
                    i.id === formState.initialData!.id
                        ? { ...i, ...formData, updatedAt: new Date(), scheduledDate: new Date(formData.scheduledDate) }
                        : i
                ));
            } else {
                const newInt = await interviewsService.createInterview(formData);
                setInterviews(prev => [newInt, ...prev]);
            }
            setFormState(null);
        } catch (err: any) {
            console.error('Save failed:', err);
            setError('Failed to save interview schedule.');
        } finally {
            setIsSaving(false);
        }
    };

    return {
        interviews: paginatedInterviews,
        totalItems,
        isLoading,
        error,

        filters,
        updateFilter,
        resetFilters,

        sortConfig,
        setSortConfig,

        page,
        totalPages,
        setPage,

        selectedInterview,
        setSelectedInterview,
        isDrawerViewOpen,
        setIsDrawerViewOpen,

        formState,
        setFormState,
        isSaving,
        handleSaveInterview,

        refresh: fetchInterviews
    };
};
