// ─────────────────────────────────────────────────────────────
// Admin Users Firestore Service
// All persistence logic lives here. UI state in useUsers hook.
// ─────────────────────────────────────────────────────────────

import {
    collection,
    getDocs,
    doc,
    setDoc,
    updateDoc,
    query,
    orderBy,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { AdminUserProfile, UserFormData } from '../../types/userAdmin';
import { auditService } from './audit.service';

const COLLECTION_NAME = 'admins';

// ── Service ──────────────────────────────────────────────────

export const usersService = {

    async getAllUsers(): Promise<AdminUserProfile[]> {
        try {
            const usersRef = collection(db, COLLECTION_NAME);
            const q = query(usersRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                console.info('Firestore adminUsers collection is empty.');
                return [];
            }

            return snapshot.docs.map(docSnap => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    lastLogin: data.lastLogin?.toDate() || undefined,
                } as AdminUserProfile;
            });
        } catch (err) {
            console.error('Failed to fetch admin users:', err);
            throw new Error('Failed to load admin users from database.');
        }
    },

    async createUser(data: UserFormData, actorEmail?: string): Promise<AdminUserProfile> {
        const usersRef = collection(db, COLLECTION_NAME);
        const newUserRef = doc(usersRef, data.email);
        const now = new Date();

        const documentData = {
            ...data,
            createdAt: serverTimestamp(),
        };

        await setDoc(newUserRef, documentData);

        // Audit log
        try {
            await auditService.logAuditEvent({
                actorId: actorEmail || 'system',
                actorName: actorEmail || 'System',
                actorEmail: actorEmail || 'system@admin',
                actorRole: 'system_admin',
                action: 'create',
                module: 'users',
                severity: 'high',
                targetId: newUserRef.id,
                targetType: 'user',
                summary: `Created user "${data.name}" with role ${data.role}`,
                metadata: { role: data.role, department: data.department },
            });
        } catch { /* audit logging is non-blocking */ }

        return {
            id: newUserRef.id,
            ...data,
            createdAt: now,
        };
    },

    async updateUser(id: string, data: Partial<UserFormData>, actorEmail?: string): Promise<void> {
        const userRef = doc(db, COLLECTION_NAME, id);

        await updateDoc(userRef, {
            ...data,
        });

        // Audit log
        try {
            await auditService.logAuditEvent({
                actorId: actorEmail || 'system',
                actorName: actorEmail || 'System',
                actorEmail: actorEmail || 'system@admin',
                actorRole: 'system_admin',
                action: 'update',
                module: 'users',
                severity: 'medium',
                targetId: id,
                targetType: 'user',
                summary: `Updated user profile (${Object.keys(data).join(', ')})`,
                metadata: data as Record<string, any>,
            });
        } catch { /* non-blocking */ }
    },

    async changeStatus(id: string, name: string, newStatus: string, actorEmail?: string): Promise<void> {
        const userRef = doc(db, COLLECTION_NAME, id);

        await updateDoc(userRef, { status: newStatus });

        // Audit log
        try {
            await auditService.logAuditEvent({
                actorId: actorEmail || 'system',
                actorName: actorEmail || 'System',
                actorEmail: actorEmail || 'system@admin',
                actorRole: 'system_admin',
                action: 'status_change',
                module: 'users',
                severity: 'high',
                targetId: id,
                targetType: 'user',
                summary: `Changed status for "${name}" to ${newStatus}`,
                afterSnapshot: { status: newStatus },
            });
        } catch { /* non-blocking */ }
    },
};
