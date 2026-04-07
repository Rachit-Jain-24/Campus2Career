export type CompanyStatus = 'active' | 'inactive' | 'blacklisted' | 'upcoming';
export type HiringMode = 'on-campus' | 'off-campus' | 'pool-campus';

export interface AdminCompanyProfile {
    id: string; // The Firestore Document ID
    companyName: string;
    industry: string;
    website?: string;
    hrName: string;
    hrEmail: string;
    hrPhone?: string;

    // Placement specifics
    packageRange: string; // e.g. "4.5 - 6.0 LPA"
    eligibleDepartments: string[];
    location: string;
    hiringMode: HiringMode;
    jobRoles: string[]; // e.g., ["SDE", "Data Analyst"]

    status: CompanyStatus;
    notes?: string;
    logoUrl?: string; // Future image upload

    createdAt: Date;
    updatedAt: Date;
}

// Omit generated/id fields for the creation payload
export type CompanyFormData = Omit<AdminCompanyProfile, 'id' | 'createdAt' | 'updatedAt'>;

export interface CompanyFilters {
    searchQuery: string;
    status: CompanyStatus | 'all';
    industry: string | 'all';
    location: string | 'all';
    hiringMode: HiringMode | 'all';
}

export type CompanySortField = 'companyName' | 'packageRange' | 'status' | 'industry' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';

export interface CompanySortConfig {
    field: CompanySortField;
    order: SortOrder;
}
