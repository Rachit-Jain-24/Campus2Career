import { eligibilityDb } from '../db/database.service';
import type { AdminEligibilityRule, EligibilityFormData } from '../../types/eligibilityAdmin';

export const eligibilityService = {

    async getAllRules(): Promise<AdminEligibilityRule[]> {
        const rules = await eligibilityDb.fetchAllRules();

        return rules.map(data => {
            return {
                ...data,
                // Handle both Firestore Timestamps and Supabase Date strings
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
            } as AdminEligibilityRule;
        });
    },

    async createRule(data: EligibilityFormData): Promise<AdminEligibilityRule> {
        const now = new Date();
        const ruleData = {
            ...data,
            linkedDriveIds: [], // default empty arrays on new
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
        };

        const newRule = await eligibilityDb.createRule(ruleData);

        return {
            ...newRule,
            createdAt: now,
            updatedAt: now
        } as AdminEligibilityRule;
    },

    async updateRule(id: string, data: Partial<EligibilityFormData>): Promise<void> {
        await eligibilityDb.updateRule(id, data);
    },

    async deleteRule(id: string): Promise<void> {
        await eligibilityDb.deleteRule(id);
    }
};
