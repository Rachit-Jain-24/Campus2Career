export type InterviewRoundType =
    | 'aptitude_test'
    | 'gd'
    | 'technical_interview'
    | 'hr_interview'
    | 'final_round';

export type InterviewStatus =
    | 'scheduled'
    | 'rescheduled'
    | 'completed'
    | 'cancelled'
    | 'no_show';

export type InterviewAttendanceStatus =
    | 'pending'
    | 'attended'
    | 'absent';

export type InterviewResultStatus =
    | 'pending'
    | 'selected'
    | 'rejected'
    | 'on_hold';

export type InterviewMode = 'online' | 'offline';

export interface AdminInterview {
    id: string;

    // References
    studentId: string;
    studentName: string;

    companyId: string;
    companyName: string;

    driveId: string;
    driveTitle: string;

    // Scheduling parameters
    roundType: InterviewRoundType;
    panelName?: string;
    panelMembers?: string[]; // Names or emails

    // Using string ISO or custom format for standardizing scheduling dates easily, will map to JS Dates via service
    scheduledDate: Date;
    scheduledTime: string; // e.g., "10:00 AM" or "14:30"

    mode: InterviewMode;
    location?: string; // Physical room
    meetingLink?: string; // Virtual link
    notes?: string;

    // Status tracking
    status: InterviewStatus;
    attendanceStatus: InterviewAttendanceStatus;
    resultStatus: InterviewResultStatus;

    createdAt: Date;
    updatedAt: Date;
}

export type InterviewFormData = Omit<AdminInterview, 'id' | 'createdAt' | 'updatedAt'>;

export interface InterviewFilters {
    searchQuery: string;
    date: Date | null;
    company: string | 'all';
    drive: string | 'all';
    roundType: InterviewRoundType | 'all';
    mode: InterviewMode | 'all';
    status: InterviewStatus | 'all';
}

export type InterviewSortField = 'studentName' | 'companyName' | 'scheduledDate' | 'scheduledTime' | 'roundType' | 'status' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';

export interface InterviewSortConfig {
    field: InterviewSortField;
    order: SortOrder;
}
