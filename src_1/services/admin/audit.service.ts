import { auditDb } from '../db/database.service';
import type { AuditLogEntry, AuditLogWritePayload } from '../../types/auditAdmin';

// ── Service ──────────────────────────────────────────────────

/**
 * Service to handle fetching and writing audit logs.
 * This automatically uses the active provider (Firestore or Supabase).
 */
export const auditService = {

    /**
     * Fetch all audit log entries, newest first.
     */
    async getAllLogs(): Promise<AuditLogEntry[]> {
        try {
            return await auditDb.getAllLogs();
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
            throw new Error('Failed to load audit logs from database.');
        }
    },

    /**
     * Reusable audit event writer.
     */
    async logAuditEvent(payload: AuditLogWritePayload): Promise<string> {
        try {
            return await auditDb.logAuditEvent(payload);
        } catch (err) {
            console.error('Failed to write audit log:', err);
            return 'error_log_failed';
        }
    }
};
