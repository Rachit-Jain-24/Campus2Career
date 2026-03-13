import { useState, useEffect, useMemo, useCallback } from 'react';
import type { AdminCompanyProfile, CompanyFilters, CompanySortConfig, CompanyFormData } from '../../types/companyAdmin';
import { fetchAllCompanies, createCompany, updateCompany } from '../../services/admin/companies.service';

export const useCompanies = () => {
    const [companies, setCompanies] = useState<AdminCompanyProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Modal and Drawer State
    const [selectedCompany, setSelectedCompany] = useState<AdminCompanyProfile | null>(null);
    const [isDrawerViewOpen, setIsDrawerViewOpen] = useState(false);

    // Form State (null meaning closed, {} or populated object meaning open)
    const [formState, setFormState] = useState<{ mode: 'add' | 'edit', initialData?: AdminCompanyProfile } | null>(null);

    // Filters
    const [filters, setFilters] = useState<CompanyFilters>({
        searchQuery: '',
        status: 'all',
        industry: 'all',
        location: 'all',
        hiringMode: 'all'
    });

    const [sortConfig, setSortConfig] = useState<CompanySortConfig>({
        field: 'updatedAt',
        order: 'desc'
    });

    // Pagination
    const [page, setPage] = useState(1);
    const itemsPerPage = 8;

    // Load Data
    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchAllCompanies();
            setCompanies(data);
            if (data.length === 0) {
                console.info('Firestore companies collection is empty.');
            }
        } catch (err: unknown) {
            console.error('Failed fetching companies', err);
            setError(err instanceof Error ? err.message : 'Database error');
            setCompanies([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);


    // Mutations
    const handleSaveCompany = async (data: CompanyFormData) => {
        setIsSaving(true);
        setError(null);
        try {
            if (formState?.mode === 'edit' && formState.initialData) {
                await updateCompany(formState.initialData.id, data);
            } else {
                await createCompany(data);
            }
            await loadData(); // Reload latest truth
            setFormState(null); // Close modal on success
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to save company record');
            alert('Save failed. See error banner.');
        } finally {
            setIsSaving(false);
        }
    };

    // Memoized Sorting and Filtering
    const processedCompanies = useMemo(() => {
        let result = [...companies];

        // 1. FILTERING
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            result = result.filter(c =>
                c.companyName.toLowerCase().includes(query) ||
                c.hrName.toLowerCase().includes(query) ||
                c.hrEmail.toLowerCase().includes(query) ||
                c.industry.toLowerCase().includes(query)
            );
        }

        if (filters.status !== 'all') result = result.filter(c => c.status === filters.status);
        if (filters.industry !== 'all') result = result.filter(c => c.industry === filters.industry);
        if (filters.hiringMode !== 'all') result = result.filter(c => c.hiringMode === filters.hiringMode);

        // Location exact or partial match depending on strictness. Let's do a loose includes matching for arrays/comma strings
        if (filters.location !== 'all') {
            const locQ = filters.location.toLowerCase();
            result = result.filter(c => c.location.toLowerCase().includes(locQ));
        }

        // 2. SORTING
        result.sort((a, b) => {
            let fieldA = a[sortConfig.field];
            let fieldB = b[sortConfig.field];

            // Normalize strings for comparison
            if (typeof fieldA === 'string') fieldA = fieldA.toLowerCase();
            if (typeof fieldB === 'string') fieldB = fieldB.toLowerCase();

            // Handle Dates
            if (fieldA instanceof Date && fieldB instanceof Date) {
                fieldA = fieldA.getTime() as any;
                fieldB = fieldB.getTime() as any;
            }

            if (fieldA === fieldB) return 0;
            const comparison = fieldA < fieldB ? -1 : 1;
            return sortConfig.order === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [companies, filters, sortConfig]);

    // Derived pagination states
    const totalItems = processedCompanies.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    useEffect(() => {
        if (page > totalPages && totalPages > 0) setPage(1);
    }, [totalPages, page]);

    const currentCompanies = useMemo(() => {
        const startIndex = (page - 1) * itemsPerPage;
        return processedCompanies.slice(startIndex, startIndex + itemsPerPage);
    }, [processedCompanies, page, itemsPerPage]);

    const updateFilter = useCallback(<K extends keyof CompanyFilters>(key: K, value: CompanyFilters[K]) => {
        setFilters((prev: CompanyFilters) => ({ ...prev, [key]: value }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({ searchQuery: '', status: 'all', industry: 'all', location: 'all', hiringMode: 'all' });
        setSortConfig({ field: 'updatedAt', order: 'desc' });
        setPage(1);
    }, []);

    return {
        // Data List State
        companies: currentCompanies,
        totalItems,
        isLoading,
        error,

        // Filter/Sort Configuration
        filters,
        sortConfig,
        updateFilter,
        resetFilters,
        setSortConfig,

        // Pagination
        page,
        totalPages,
        setPage,

        // UI View State (Drawer)
        selectedCompany,
        setSelectedCompany,
        isDrawerViewOpen,
        setIsDrawerViewOpen,

        // Mutative Form State
        formState,
        setFormState,
        isSaving,
        handleSaveCompany,

        // Expose manual reload just in case
        forceReload: loadData
    };
};
