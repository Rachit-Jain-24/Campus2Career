export type DriveStatus = 'draft' | 'upcoming' | 'registration_open' | 'ongoing' | 'completed' | 'cancelled';
export type DriveHiringMode = 'on-campus' | 'off-campus' | 'pool-campus';

export interface DriveStage {
    id: string; // e.g. "stage_1"
    name: string; // e.g. "Aptitude Test"
    date: Date | null;
    status: 'pending' | 'active' | 'completed';
    description?: string;
}

export interface DriveEligibility {
    minCGPA?: number; // e.g., 7.5
    allowedDepartments: string[]; // e.g., ["Computer Eng", "IT Eng"]
    allowedYears: string[]; // e.g., ["Final Year"]
    maxActiveBacklogs?: number; // e.g., 0
    maxHistoryBacklogs?: number; // e.g., 2
    requiresResumeApproval: boolean;
    mandatoryInternship: boolean;
    requiredSkills: string[];
}

export interface AdminDriveProfile {
    id: string;

    // Linked Company
    companyId: string;
    companyName: string;
    companyLogoUrl?: string;

    // Drive Core
    title: string;
    jobRole: string;
    packageRange: string;
    location: string;
    mode: DriveHiringMode;
    description: string;

    // Rules & Timeline
    eligibilityRules: DriveEligibility;
    registrationStart: Date;
    registrationEnd: Date;
    stages: DriveStage[];

    // Metrics
    applicantCount: number;
    shortlistedCount: number;

    status: DriveStatus;

    createdAt: Date;
    updatedAt: Date;
}

// Creation payload omitting generated/stat fields
export type DriveFormData = Omit<AdminDriveProfile, 'id' | 'applicantCount' | 'shortlistedCount' | 'createdAt' | 'updatedAt' | 'companyLogoUrl'>;

export interface DriveFilters {
    searchQuery: string;
    status: DriveStatus | 'all';
    companyId: string | 'all'; // Used to filter drives by a specific company
    jobRole: string | 'all';
    location: string | 'all';
    mode: DriveHiringMode | 'all';
}

export type DriveSortField = 'title' | 'companyName' | 'packageRange' | 'status' | 'registrationStart' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';

export interface DriveSortConfig {
    field: DriveSortField;
    order: SortOrder;
}
