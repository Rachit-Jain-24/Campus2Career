import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
    AdminEligibilityRule,
    EligibilityFilters,
    EligibilitySortConfig,
    EligibilityFormData
} from '../../types/eligibilityAdmin';
import { eligibilityService } from '../../services/admin/eligibility.service';
import { drivesService } from '../../services/admin/drives.service';
import { evaluateCohortEligibility } from '../../utils/admin/eligibilityEvaluator';
import type { RuleEvaluationResult } from '../../utils/admin/eligibilityEvaluator';
import type { AdminStudentProfile } from '../../types/studentAdmin';
import type { AdminDriveProfile } from '../../types/driveAdmin';

export const useEligibilityRules = () => {
    const [rules, setRules] = useState<AdminEligibilityRule[]>([]);
    const [availableDrives, setAvailableDrives] = useState<AdminDriveProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingDrives, setIsLoadingDrives] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Standard Filter States
    const [filters, setFilters] = useState<EligibilityFilters>({
        searchQuery: '',
        department: 'all',
        year: 'all',
        status: 'all'
    });

    // Standard Sort States
    const [sortConfig, setSortConfig] = useState<EligibilitySortConfig>({
        field: 'updatedAt',
        order: 'desc'
    });

    // Pagination
    const [page, setPage] = useState(1);
    const itemsPerPage = 8;

    // ----- UI Interaction States explicitly supporting all required dimensions -----
    const [selectedRule, setSelectedRule] = useState<AdminEligibilityRule | null>(null);
    const [isDrawerViewOpen, setIsDrawerViewOpen] = useState(false);

    // Add/Edit Modal
    const [formState, setFormState] = useState<{
        mode: 'add' | 'edit';
        initialData?: AdminEligibilityRule;
    } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Attach to Drive Modal State
    const [attachModalState, setAttachModalState] = useState<{
        isOpen: boolean;
        ruleToAttach: AdminEligibilityRule | null;
    }>({ isOpen: false, ruleToAttach: null });

    // Preview Evaluation State
    const [previewState, setPreviewState] = useState<{
        isEvaluating: boolean;
        results: RuleEvaluationResult | null;
        evaluatedRuleId: string | null;
    }>({ isEvaluating: false, results: null, evaluatedRuleId: null });

    const fetchRules = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await eligibilityService.getAllRules();
            setRules(data);
            if (data.length === 0) {
                console.info('Firestore eligibility_rules collection is empty.');
            }
        } catch (err: any) {
            console.error('Error fetching eligibility rules:', err);
            setError(err.message || 'Failed to connect to active rule database.');
            setRules([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRules();
    }, [fetchRules]);

    // Derived states (Filtering & Sorting)
    const processedRules = useMemo(() => {
        let result = [...rules];

        // 1. Array search via query string
        if (filters.searchQuery) {
            const q = filters.searchQuery.toLowerCase();
            result = result.filter(r =>
                r.ruleName.toLowerCase().includes(q) ||
                r.description.toLowerCase().includes(q) ||
                r.allowedDepartments.some(d => d.toLowerCase().includes(q))
            );
        }

        // 2. Department filter
        if (filters.department !== 'all') {
            result = result.filter(r =>
                r.allowedDepartments.includes(filters.department) || r.allowedDepartments.length === 0
            );
        }

        // 3. Year filter
        if (filters.year !== 'all') {
            result = result.filter(r => r.allowedYears.includes(filters.year));
        }

        // 4. Status filter
        if (filters.status !== 'all') {
            const isActiveFilter = filters.status === 'active';
            result = result.filter(r => r.active === isActiveFilter);
        }

        // 5. Sorting handler
        result.sort((a, b) => {
            let aValue: any = (a as any)[sortConfig.field];
            let bValue: any = (b as any)[sortConfig.field];

            // Sub-field derivations explicitly linking allowedYears sizing to the sort order if needed
            if (sortConfig.field === 'allowedYear') {
                aValue = a.allowedYears.length > 0 ? a.allowedYears[0] : '';
                bValue = b.allowedYears.length > 0 ? b.allowedYears[0] : '';
            }

            if (sortConfig.field === 'ruleName') {
                aValue = (aValue as string).toLowerCase();
                bValue = (bValue as string).toLowerCase();
            }

            if (aValue < bValue) return sortConfig.order === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.order === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [rules, filters, sortConfig]);

    // Pagination metrics
    const totalItems = processedRules.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    const paginatedRules = useMemo(() => {
        const start = (page - 1) * itemsPerPage;
        return processedRules.slice(start, start + itemsPerPage);
    }, [processedRules, page]);

    // Effect to prevent empty pages when filtering shrinks result size
    useEffect(() => {
        if (page > totalPages) {
            setPage(1);
        }
    }, [totalPages, page]);

    // External Handlers
    const updateFilter = useCallback(<K extends keyof EligibilityFilters>(key: K, value: EligibilityFilters[K]) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({
            searchQuery: '',
            department: 'all',
            year: 'all',
            status: 'all'
        });
        setPage(1);
    }, []);

    const handleSaveRule = async (formData: EligibilityFormData) => {
        setIsSaving(true);
        try {
            if (formState?.mode === 'edit' && formState.initialData) {
                await eligibilityService.updateRule(formState.initialData.id, formData);

                setRules(prev => prev.map(r =>
                    r.id === formState.initialData!.id
                        ? { ...r, ...formData, updatedAt: new Date() }
                        : r
                ));
            } else {
                const newRule = await eligibilityService.createRule(formData);
                setRules(prev => [newRule, ...prev]);
            }
            setFormState(null);
        } catch (err: any) {
            console.error('Save failed:', err);
            setError('Failed to save eligibility rule. Ensure write permissions are granted.');
        } finally {
            setIsSaving(false);
        }
    };

    const triggerPreviewEvaluation = useCallback((rule: AdminEligibilityRule, students: AdminStudentProfile[]) => {
        setPreviewState(prev => ({ ...prev, isEvaluating: true }));

        // Minor simulated delay for heavy cohort analysis
        setTimeout(() => {
            const results = evaluateCohortEligibility(students, rule);
            setPreviewState({
                isEvaluating: false,
                results,
                evaluatedRuleId: rule.id
            });
        }, 300);
    }, []);

    const openAttachModal = useCallback((rule: AdminEligibilityRule) => {
        setAttachModalState({ isOpen: true, ruleToAttach: rule });
    }, []);

    const closeAttachModal = useCallback(() => {
        setAttachModalState({ isOpen: false, ruleToAttach: null });
    }, []);

    const fetchAttachableDrives = useCallback(async () => {
        setIsLoadingDrives(true);
        try {
            const drives = await drivesService.fetchAllDrives();
            setAvailableDrives(
                drives.filter(drive => !['completed', 'cancelled'].includes(drive.status))
            );
        } catch (err: any) {
            console.error('Error fetching drives for eligibility attachment:', err);
            setError(err.message || 'Failed to load drives for rule attachment.');
            setAvailableDrives([]);
        } finally {
            setIsLoadingDrives(false);
        }
    }, []);

    useEffect(() => {
        if (attachModalState.isOpen) {
            fetchAttachableDrives();
        }
    }, [attachModalState.isOpen, fetchAttachableDrives]);

    const attachRuleToDrive = useCallback(async (rule: AdminEligibilityRule, driveId: string) => {
        setIsSaving(true);
        setError(null);
        try {
            await drivesService.updateDrive(driveId, {
                eligibilityRules: {
                    minCGPA: rule.minCGPA,
                    allowedDepartments: rule.allowedDepartments,
                    allowedYears: rule.allowedYears,
                    maxActiveBacklogs: rule.maxActiveBacklogs,
                    maxHistoryBacklogs: rule.maxHistoryBacklogs,
                    requiresResumeApproval: rule.requiresResumeApproval,
                    mandatoryInternship: rule.mandatoryInternship,
                    requiredSkills: rule.requiredSkills,
                }
            });

            const linkedDriveIds = Array.from(new Set([...(rule.linkedDriveIds || []), driveId]));
            await eligibilityService.updateRule(rule.id, { linkedDriveIds });
            setRules(prev => prev.map(r =>
                r.id === rule.id ? { ...r, linkedDriveIds, updatedAt: new Date() } : r
            ));
            closeAttachModal();
        } catch (err: any) {
            console.error('Attach to drive failed:', err);
            setError(err.message || 'Failed to attach eligibility rule to drive.');
        } finally {
            setIsSaving(false);
        }
    }, [closeAttachModal]);

    return {
        // Data & Processed State
        rules: paginatedRules,
        totalItems,
        availableDrives,
        isLoading,
        isLoadingDrives,
        error,

        filters,
        updateFilter,
        resetFilters,

        sortConfig,
        setSortConfig,

        page,
        totalPages,
        setPage,

        // Common State
        selectedRule,
        setSelectedRule,

        // Drawer View State
        isDrawerViewOpen,
        setIsDrawerViewOpen,

        // Add/Edit Form Config
        formState,
        setFormState,
        isSaving,
        handleSaveRule,

        // Attach to Drive State
        attachModalState,
        openAttachModal,
        closeAttachModal,
        attachRuleToDrive,

        // Preview State & Mutator
        previewState,
        triggerPreviewEvaluation,

        refresh: fetchRules
    };
};
