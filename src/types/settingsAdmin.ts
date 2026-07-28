// ─────────────────────────────────────────────────────────────
// Admin Settings — Type Definitions
// ─────────────────────────────────────────────────────────────

// ── General Platform Settings ────────────────────────────────

export interface GeneralSettings {
    platformName: string;
    instituteName: string;
    supportEmail: string;
    brandLogoUrl: string;
    brandFaviconUrl: string;
    currentAcademicYear: string;
    activePlacementSeason: boolean;
}

// ── Department Master ────────────────────────────────────────

export interface DepartmentEntry {
    id: string;
    code: string;
    displayName: string;
    isActive: boolean;
}

// ── Academic Configuration ───────────────────────────────────

export interface AcademicSettings {
    availableBatches: string[];          // e.g. ['Final Year', '3rd Year', '2nd Year', '1st Year']
    availableYears: string[];            // e.g. ['2023-24', '2024-25', '2025-26']
    semesterLabels: string[];            // e.g. ['Semester 1', 'Semester 2', ...]
    defaultProgressionYear: string;      // e.g. 'Final Year'
}

// ── Placement Configuration ──────────────────────────────────

export interface PlacementSettings {
    eligibilityLabels: string[];          // e.g. ['eligible', 'not_eligible', 'pending_review']
    driveStatusLabels: string[];          // e.g. ['draft', 'upcoming', 'registration_open', ...]
    offerStatusLabels: string[];          // e.g. ['issued', 'accepted', 'rejected', ...]
    interviewRoundLabels: string[];       // e.g. ['aptitude_test', 'gd', 'technical_interview', ...]
    minReadinessThreshold: number;        // e.g. 60
    minResumeScoreThreshold: number;      // e.g. 70
    warningCGPAThreshold: number;         // e.g. 6.0
}

// ── Notification Settings ────────────────────────────────────

export interface NotificationSettings {
    emailNotificationsEnabled: boolean;
    inAppNotificationsEnabled: boolean;
    driveReminderDaysBefore: number;       // e.g. 2
    interviewReminderHoursBefore: number;  // e.g. 24
    adminAlertOnNewDrive: boolean;
    adminAlertOnOfferUpdate: boolean;
    adminAlertOnLowReadiness: boolean;
}

// ── Security Settings ────────────────────────────────────────

export interface SecuritySettings {
    sessionTimeoutMinutes: number;         // e.g. 60
    auditLoggingEnabled: boolean;
    requireConfirmOnDelete: boolean;
    requireConfirmOnStatusChange: boolean;
}

// ── Combined Platform Settings Document ──────────────────────

export interface PlatformSettings {
    general: GeneralSettings;
    departments: DepartmentEntry[];
    academic: AcademicSettings;
    placement: PlacementSettings;
    notifications: NotificationSettings;
    security: SecuritySettings;
    updatedAt?: Date;
    updatedBy?: string;
}

// ── Settings Section Keys ────────────────────────────────────

export type SettingsSection = 'general' | 'departments' | 'academic' | 'placement' | 'notifications' | 'security';
