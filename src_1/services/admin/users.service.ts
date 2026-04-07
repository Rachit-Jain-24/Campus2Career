import { adminUsersDb } from '../db/database.service';
import type { AdminUserProfile, UserFormData } from '../../types/userAdmin';
import { auditService } from './audit.service';

export const usersService = {

    async getAllUsers(): Promise<AdminUserProfile[]> {
        try {
            const admins = await adminUsersDb.fetchAllAdmins();

            return admins.map(data => {
                return {
                    ...data,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
                    lastLogin: data.lastLogin ? (data.lastLogin.toDate ? data.lastLogin.toDate() : new Date(data.lastLogin)) : undefined,
                } as AdminUserProfile;
            });
        } catch (err) {
            console.error('Failed to fetch admin users:', err);
            throw new Error('Failed to load admin users from database.');
        }
    },

    async createUser(data: UserFormData, actorEmail?: string): Promise<AdminUserProfile> {
        const now = new Date();
        const documentData = {
            ...data,
            createdAt: now.toISOString(),
        };

        const newAdmin = await adminUsersDb.createAdmin(documentData);

        // Audit log (non-blocking)
        auditService.logAuditEvent({
            actorId: actorEmail || 'system',
            actorName: actorEmail || 'System',
            actorEmail: actorEmail || 'system@admin',
            actorRole: 'system_admin',
            action: 'create',
            module: 'users',
            severity: 'high',
            targetId: data.email,
            targetType: 'user',
            summary: `Created user "${data.name}" with role ${data.role}`,
            metadata: { role: data.role, department: data.department },
        }).catch(() => {});

        return {
            ...newAdmin,
            id: data.email,
            createdAt: now,
        } as AdminUserProfile;
    },

    async updateUser(id: string, data: Partial<UserFormData>, actorEmail?: string): Promise<void> {
        await adminUsersDb.updateAdmin(id, data);

        // Audit log (non-blocking)
        auditService.logAuditEvent({
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
        }).catch(() => {});
    },

    async changeStatus(id: string, name: string, newStatus: string, actorEmail?: string): Promise<void> {
        await adminUsersDb.updateAdmin(id, { status: newStatus });

        // Audit log (non-blocking)
        auditService.logAuditEvent({
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
        }).catch(() => {});
    },
};
