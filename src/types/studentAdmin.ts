export type PlacementStatus = 'placed' | 'unplaced' | 'opted_out' | 'higher_studies' | 'not_eligible';
export type EligibilityStatus = 'eligible' | 'not_eligible' | 'pending_review';
export type ResumeStatus = 'approved' | 'pending' | 'rejected' | 'not_uploaded';

export interface AdminStudentProfile {
    id: string; // The Firestore Document ID (often same as UID)
    sapId: string;
    fullName: string;
    email: string;
    department: string;
    currentYear: string;
    cgpa: number;
    readinessScore: number; // 0-100 percentage
    careerGoal: 'Corporate Placement' | 'Higher Education' | 'Entrepreneurship' | 'Undecided';

    // Academic deep details
    activeBacklogs?: number;
    historyBacklogs?: number;

    // Status Trackers
    placementStatus: PlacementStatus;
    eligibilityStatus: EligibilityStatus;
    resumeStatus: ResumeStatus;
    internshipCompleted: boolean;

    // Deep profile details for the Drawer
    contact?: string;
    skills?: string[];
    certifications?: string[];
    projectsCount?: number;
    offersCount?: number;
    lastUpdated?: Date;
}

export interface StudentFilters {
    searchQuery: string;
    department: string | 'all';
    year: string | 'all';
    careerGoal: string | 'all';
    placementStatus: PlacementStatus | 'all';
    eligibilityStatus: EligibilityStatus | 'all';
    resumeStatus: ResumeStatus | 'all';
    cgpaRange: [number, number]; // e.g. [0, 10]
    readinessRange: [number, number]; // e.g. [0, 100]
}

export type SortField = 'fullName' | 'sapId' | 'cgpa' | 'readinessScore' | 'currentYear' | 'placementStatus';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
    field: SortField;
    order: SortOrder;
}
