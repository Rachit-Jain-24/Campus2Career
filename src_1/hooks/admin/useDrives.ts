// @ts-nocheck
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { AdminDriveProfile, DriveFilters, DriveSortConfig, DriveFormData } from '../../types/driveAdmin';
import { drivesService } from '../../services/admin/drives.service';

export const useDrives = () => {

    // Core State
    const [drives, setDrives] = useState<AdminDriveProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Presentation State
    const [selectedDrive, setSelectedDrive] = useState<AdminDriveProfile | null>(null);
    const [isDrawerViewOpen, setIsDrawerViewOpen] = useState(false);

    // Form Modal State (null = closed, { mode: 'add' } = create, { mode: 'edit' } = update )
    const [formState, setFormState] = useState<{ mode: 'add' | 'edit', initialData?: AdminDriveProfile } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Filtering & Sorting State
    const [filters, setFilters] = useState<DriveFilters>({
        searchQuery: '',
        status: 'all',
        companyId: 'all',
        jobRole: 'all',
        location: 'all',
        mode: 'all'
    });

    const [sortConfig, setSortConfig] = useState<DriveSortConfig>({
        field: 'updatedAt',
        order: 'desc'
    });

    const [page, setPage] = useState(1);
    const itemsPerPage = 8;

    // Fetch Initial Data
    const fetchDrives = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await drivesService.fetchAllDrives();
            setDrives(data);
            if (data.length === 0) {
                console.info('Firestore drives collection is empty.');
            }
        } catch (err: any) {
            console.error('Failed to fetch drives from Firestore:', err.message);
            setError(err.message || 'Failed to load drives');
            setDrives([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDrives();
    }, [fetchDrives]);

    // Apply Filters and Sorting
    const filteredAndSortedDrives = useMemo(() => {
        let result = [...drives];

        // 1. Text Search (Matches title, company name, job role, and location)
        if (filters.searchQuery.trim()) {
            const lowerQuery = filters.searchQuery.toLowerCase();
            result = result.filter(d =>
                d.title.toLowerCase().includes(lowerQuery) ||
                d.companyName.toLowerCase().includes(lowerQuery) ||
                d.jobRole.toLowerCase().includes(lowerQuery) ||
                d.location.toLowerCase().includes(lowerQuery)
            );
        }

        // 2. Exact Match Filters
        if (filters.status !== 'all') {
            result = result.filter(d => d.status === filters.status);
        }
        if (filters.companyId !== 'all') {
            result = result.filter(d => d.companyId === filters.companyId);
        }
        if (filters.jobRole !== 'all') {
            result = result.filter(d => d.jobRole === filters.jobRole);
        }
        if (filters.location !== 'all') {
            result = result.filter(d => d.location === filters.location);
        }
        if (filters.mode !== 'all') {
            result = result.filter(d => d.mode === filters.mode);
        }

        // 3. Sorting
        result.sort((a, b) => {
            let aVal: any = a[sortConfig.field];
            let bVal: any = b[sortConfig.field];

            // Specific type handling for text mapping
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = (bVal as string).toLowerCase();
            }

            if (aVal < bVal) return sortConfig.order === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.order === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [drives, filters, sortConfig]);

    // Pagination Derivation
    const paginatedDrives = useMemo(() => {
        const startIndex = (page - 1) * itemsPerPage;
        return filteredAndSortedDrives.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAndSortedDrives, page]);

    const totalPages = Math.ceil(filteredAndSortedDrives.length / itemsPerPage);

    // Helpers
    const updateFilter = <K extends keyof DriveFilters>(key: K, value: DriveFilters[K]) => {
        setFilters((prev: any) => ({ ...prev, [key]: value }));
        setPage(1); // Reset page on filter change
    };

    const resetFilters = () => {
        setFilters({
            searchQuery: '',
            status: 'all',
            companyId: 'all',
            jobRole: 'all',
            location: 'all',
            mode: 'all'
        });
        setPage(1);
    };

    // Actions
    const handleSaveDrive = async (formData: DriveFormData) => {
        setIsSaving(true);
        setError(null);
        try {
            if (formState?.mode === 'edit' && formState.initialData?.id) {
                // Update specific record
                await drivesService.updateDrive(formState.initialData.id, formData);

                // Optimistic Local Update
                setDrives((prev: any) => prev.map(d =>
                    d.id === formState.initialData!.id
                        ? { ...d, ...formData, updatedAt: new Date() }
                        : d
                ));

                // If currently viewing details, update the drawer data too
                if (selectedDrive?.id === formState.initialData.id) {
                    setSelectedDrive((prev: any) => prev ? { ...prev, ...formData, updatedAt: new Date() } : null);
                }

            } else {
                // Create
                const newId = await drivesService.createDrive(formData);

                // Optimistic Addition
                const newProfile: AdminDriveProfile = {
                    ...formData,
                    id: newId,
                    applicantCount: 0,
                    shortlistedCount: 0,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                setDrives((prev: any) => [newProfile, ...prev]);
            }

            // Close modal on success
            setFormState(null);

        } catch (err: any) {
            console.error("Failed to save drive:", err);
            setError(err.message || 'Failed to save drive parameters');
        } finally {
            setIsSaving(false);
        }
    };

    return {
        // Data
        drives: paginatedDrives,
        totalItems: filteredAndSortedDrives.length,
        isLoading,
        error,

        // State
        filters,
        sortConfig,
        page,
        totalPages,
        selectedDrive,
        isDrawerViewOpen,
        formState,
        isSaving,

        // Updaters
        updateFilter,
        resetFilters,
        setSortConfig,
        setPage,
        setSelectedDrive,
        setIsDrawerViewOpen,
        setFormState,

        // Handlers
        handleSaveDrive,
        refreshDrives: fetchDrives
    };
};
