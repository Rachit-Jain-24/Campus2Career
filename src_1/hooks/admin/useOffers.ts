import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
    AdminOffer,
    OfferFilters,
    OfferSortConfig,
    OfferFormData
} from '../../types/offerAdmin';
import { offersService } from '../../services/admin/offers.service';

export const useOffers = () => {
    const [offers, setOffers] = useState<AdminOffer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter States
    const [filters, setFilters] = useState<OfferFilters>({
        searchQuery: '',
        status: 'all',
        companyId: 'all',
        driveId: 'all',
        department: 'all',
        year: 'all'
    });

    // Sort States
    const [sortConfig, setSortConfig] = useState<OfferSortConfig>({
        field: 'updatedAt',
        order: 'desc'
    });

    // Pagination
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    // View / Modify trackers
    const [selectedOffer, setSelectedOffer] = useState<AdminOffer | null>(null);
    const [isDrawerViewOpen, setIsDrawerViewOpen] = useState(false);

    // Feature trackers
    const [compareOffers, setCompareOffers] = useState<AdminOffer[]>([]);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

    // Add/Edit Modal
    const [formState, setFormState] = useState<{
        mode: 'add' | 'edit';
        initialData?: AdminOffer;
    } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const fetchOffers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await offersService.getAllOffers();
            setOffers(data);
            if (data.length === 0) {
                console.info('Firestore offers collection is empty.');
            }
        } catch (err: any) {
            console.error('Error fetching offers:', err);
            setError(err.message || 'Failed to connect to active offers database.');
            setOffers([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOffers();
    }, [fetchOffers]);

    // Derived filtering/sorting logic
    const processedOffers = useMemo(() => {
        let result = [...offers];

        // Search text
        if (filters.searchQuery) {
            const q = filters.searchQuery.toLowerCase();
            result = result.filter(o =>
                o.studentName.toLowerCase().includes(q) ||
                o.companyName.toLowerCase().includes(q) ||
                o.driveTitle.toLowerCase().includes(q) ||
                o.role.toLowerCase().includes(q)
            );
        }

        if (filters.status !== 'all') {
            result = result.filter(o => o.status === filters.status);
        }

        if (filters.companyId !== 'all') {
            result = result.filter(o => o.companyId === filters.companyId);
        }

        if (filters.driveId !== 'all') {
            result = result.filter(o => o.driveId === filters.driveId);
        }

        if (filters.department !== 'all') {
            result = result.filter(o => o.studentDepartment && o.studentDepartment.includes(filters.department));
        }

        if (filters.year !== 'all') {
            result = result.filter(o => o.studentYear === filters.year);
        }

        // Sorting
        result.sort((a, b) => {
            let aValue: any = a[sortConfig.field];
            let bValue: any = b[sortConfig.field];

            if (sortConfig.field === 'studentName' || sortConfig.field === 'companyName' || sortConfig.field === 'role') {
                aValue = (aValue || '').toLowerCase();
                bValue = (bValue || '').toLowerCase();
            }

            if (aValue < bValue) return sortConfig.order === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.order === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [offers, filters, sortConfig]);

    const totalItems = processedOffers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    const paginatedOffers = useMemo(() => {
        const start = (page - 1) * itemsPerPage;
        return processedOffers.slice(start, start + itemsPerPage);
    }, [processedOffers, page]);

    useEffect(() => {
        if (page > totalPages) {
            setPage(1);
        }
    }, [totalPages, page]);

    const updateFilter = useCallback(<K extends keyof OfferFilters>(key: K, value: OfferFilters[K]) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({
            searchQuery: '',
            status: 'all',
            companyId: 'all',
            driveId: 'all',
            department: 'all',
            year: 'all'
        });
        setPage(1);
    }, []);

    const toggleCompareOffer = useCallback((offer: AdminOffer) => {
        setCompareOffers(prev => {
            if (prev.find(o => o.id === offer.id)) {
                return prev.filter(o => o.id !== offer.id);
            }
            if (prev.length >= 3) {
                // max 3 items to compare
                const newArray = prev.slice(1);
                return [...newArray, offer];
            }
            return [...prev, offer];
        });
    }, []);

    const handleSaveOffer = async (formData: OfferFormData, targetStudentMeta?: { department: string; year: string }) => {
        setIsSaving(true);
        try {
            if (formState?.mode === 'edit' && formState.initialData) {
                await offersService.updateOffer(formState.initialData.id, formData);

                setOffers(prev => prev.map(o =>
                    o.id === formState.initialData!.id
                        ? {
                            ...o,
                            ...formData,
                            updatedAt: new Date(),
                            studentDepartment: targetStudentMeta?.department || o.studentDepartment,
                            studentYear: targetStudentMeta?.year || o.studentYear
                        }
                        : o
                ));
            } else {
                const newOff = await offersService.createOffer(formData);
                setOffers(prev => [{
                    ...newOff,
                    studentDepartment: targetStudentMeta?.department,
                    studentYear: targetStudentMeta?.year
                }, ...prev]);
            }
            setFormState(null);
        } catch (err: any) {
            console.error('Save failed:', err);
            setError('Failed to save offer record.');
        } finally {
            setIsSaving(false);
        }
    };

    return {
        offers: paginatedOffers,
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

        selectedOffer,
        setSelectedOffer,
        isDrawerViewOpen,
        setIsDrawerViewOpen,

        compareOffers,
        setCompareOffers,
        isCompareModalOpen,
        setIsCompareModalOpen,
        toggleCompareOffer,

        formState,
        setFormState,
        isSaving,
        handleSaveOffer,

        refresh: fetchOffers
    };
};
