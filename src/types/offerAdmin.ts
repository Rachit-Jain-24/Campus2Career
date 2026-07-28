export type OfferStatus = 'issued' | 'accepted' | 'rejected' | 'expired' | 'on_hold';

export interface AdminOffer {
    id: string;

    // References
    studentId: string;
    studentName: string;
    studentDepartment?: string; // Optional for quick filtering
    studentYear?: string; // Optional for quick filtering

    companyId: string;
    companyName: string;

    driveId: string;
    driveTitle: string;

    // Offer Details
    role: string;
    ctc: number; // Storing as raw number (LPA or exact, we will assume LPA for consistency like 4.5, 12.0)
    joiningDate: Date | null;
    location: string;
    bondDuration?: string; // e.g., "1 Year", "None"

    // Assets & Metadata
    offerLetterUrl?: string; // Link to stored PDF/Image
    notes?: string;

    status: OfferStatus;

    createdAt: Date;
    updatedAt: Date;
}

export type OfferFormData = Omit<AdminOffer, 'id' | 'createdAt' | 'updatedAt' | 'studentDepartment' | 'studentYear'>;

export interface OfferFilters {
    searchQuery: string;
    status: OfferStatus | 'all';
    companyId: string | 'all';
    driveId: string | 'all';
    department: string | 'all';
    year: string | 'all';
}

export type OfferSortField = 'studentName' | 'companyName' | 'role' | 'ctc' | 'joiningDate' | 'status' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';

export interface OfferSortConfig {
    field: OfferSortField;
    order: SortOrder;
}
