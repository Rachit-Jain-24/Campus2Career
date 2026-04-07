import { interviewsDb } from '../db/database.service';
import type { AdminInterview, InterviewFormData } from '../../types/interviewAdmin';

/**
 * Service to handle fetching and managing student interviews.
 * This automatically uses the active provider (Firestore or Supabase).
 */
export const interviewsService = {

    async getAllInterviews(): Promise<AdminInterview[]> {
        try {
            return await interviewsDb.getAllInterviews();
        } catch (error) {
            console.error('Error fetching interviews:', error);
            throw new Error('Failed to fetch interview directory data');
        }
    },

    async createInterview(data: InterviewFormData): Promise<AdminInterview> {
        try {
            return await interviewsDb.createInterview(data);
        } catch (error) {
            console.error('Error creating interview:', error);
            throw new Error('Failed to create interview profile');
        }
    },

    async updateInterview(id: string, data: Partial<InterviewFormData>): Promise<void> {
        try {
            await interviewsDb.updateInterview(id, data);
        } catch (error) {
            console.error('Error updating interview:', error);
            throw new Error('Failed to update interview profile');
        }
    }
};
