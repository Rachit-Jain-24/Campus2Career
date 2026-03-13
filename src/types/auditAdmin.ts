// ─────────────────────────────────────────────────────────────
// Audit Logs — Type Definitions
// ─────────────────────────────────────────────────────────────

// ── Action Types ─────────────────────────────────────────────

export type AuditActionType =
    | 'create'
    | 'update'
    | 'delete'
    | 'login'
    | 'logout'
    | 'status_change'
    | 'permission_change'
    | 'settings_update'
    | 'export'
    | 'schedule'
    | 'reschedule';

// ── Severity Levels ──────────────────────────────────────────

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';

// ── Module Names ─────────────────────────────────────────────

export type AuditModule =
    | 'auth'
    | 'students'
    | 'companies'
    | 'drives'
    | 'eligibility'
    | 'interviews'
    | 'offers'
    | 'reports'
    | 'settings'
    | 'users'
    | 'system';

// ── Audit Log Entry ──────────────────────────────────────────

export interface AuditLogEntry {
    id: string;
    timestamp: Date;

    // Actor
    actorId: string;
    actorName: string;
    actorEmail: string;
    actorRole: string;

    // Action
    action: AuditActionType;
    module: AuditModule;
    severity: AuditSeverity;

    // Target
    targetId?: string;
    targetType?: string;  // e.g. 'student', 'drive', 'offer'

    // Details
    summary: string;
    metadata?: Record<string, any>;  // JSON payload
    beforeSnapshot?: Record<string, any>;
    afterSnapshot?: Record<string, any>;

    // Context
    ipAddress?: string;
    userAgent?: string;
}

// ── Write Payload (for logAuditEvent) ────────────────────────

export type AuditLogWritePayload = Omit<AuditLogEntry, 'id' | 'timestamp'>;

// ── Filters ──────────────────────────────────────────────────

export interface AuditLogFilters {
    searchQuery: string;
    actorRole: string | 'all';
    action: AuditActionType | 'all';
    module: AuditModule | 'all';
    severity: AuditSeverity | 'all';
    dateRange: { start: Date | null; end: Date | null };
}

// ── Sort ─────────────────────────────────────────────────────

export type AuditSortField = 'timestamp' | 'actorName' | 'action' | 'module' | 'severity';
export type SortOrder = 'asc' | 'desc';

export interface AuditSortConfig {
    field: AuditSortField;
    order: SortOrder;
}
