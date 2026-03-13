// ─────────────────────────────────────────────────────────────
// Audit Log Firestore Service
// Read/write logic separated from UI. Includes reusable logAuditEvent helper.
// ─────────────────────────────────────────────────────────────

import {
    collection,
    getDocs,
    addDoc,
    query,
    orderBy,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { AuditLogEntry, AuditLogWritePayload } from '../../types/auditAdmin';

const COLLECTION_NAME = 'auditLogs';

// ── Service ──────────────────────────────────────────────────

export const auditService = {

    /**
     * Fetch all audit log entries, newest first.
     * Falls back to mock data when Firestore returns empty or fails.
     */
    async getAllLogs(): Promise<AuditLogEntry[]> {
        try {
            const logsRef = collection(db, COLLECTION_NAME);
            const q = query(logsRef, orderBy('timestamp', 'desc'));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                console.info('Firestore auditLogs collection is empty.');
                return [];
            }

            return snapshot.docs.map(docSnap => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    ...data,
                    timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(data.timestamp)
                } as AuditLogEntry;
            });
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
            throw new Error('Failed to load audit logs from database.');
        }
    },

    /**
     * Reusable audit event writer.
     * Call from any admin module to log an action:
     *
     *   await auditService.logAuditEvent({
     *       actorId: user.uid,
     *       actorName: user.displayName,
     *       actorEmail: user.email,
     *       actorRole: user.role,
     *       action: 'create',
     *       module: 'drives',
     *       severity: 'medium',
     *       summary: 'Created drive "…"',
     *       targetId: drive.id,
     *       targetType: 'drive'
     *   });
     */
    async logAuditEvent(payload: AuditLogWritePayload): Promise<string> {
        const logsRef = collection(db, COLLECTION_NAME);

        const docData = {
            ...payload,
            timestamp: serverTimestamp()
        };

        const docRef = await addDoc(logsRef, docData);
        return docRef.id;
    }
};
