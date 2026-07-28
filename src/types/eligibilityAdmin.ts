export interface AdminEligibilityRule {
    id: string;
    ruleName: string;
    description: string;

    // Core parameters mapping directly to drive/student logic 
    minCGPA: number;
    allowedDepartments: string[];
    allowedYears: string[];
    maxActiveBacklogs: number; // e.g. 0
    maxHistoryBacklogs: number; // e.g. 2

    requiresResumeApproval: boolean;
    mandatoryInternship: boolean;
    requiredSkills: string[];

    // Meta properties
    active: boolean;
    linkedDriveIds: string[]; // references drives using this rule exactly

    createdAt: Date;
    updatedAt: Date;
}

export type EligibilityFormData = Omit<AdminEligibilityRule, 'id' | 'linkedDriveIds' | 'createdAt' | 'updatedAt'>;

export interface EligibilityFilters {
    searchQuery: string;
    department: string | 'all';
    year: string | 'all';
    status: 'active' | 'inactive' | 'all';
}

export type EligibilitySortField = 'ruleName' | 'minCGPA' | 'updatedAt' | 'active' | 'allowedYear';
export type SortOrder = 'asc' | 'desc';

export interface EligibilitySortConfig {
    field: EligibilitySortField;
    order: SortOrder;
}
