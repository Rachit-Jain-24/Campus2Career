import { drivesDb } from '../db/database.service';
import type { AdminDriveProfile, DriveFormData } from '../../types/driveAdmin';

/**
 * Service to handle fetching and managing recruitment drives.
 * This automatically uses the active provider (Firestore or Supabase).
 */
export const drivesService = {

    async fetchAllDrives(): Promise<AdminDriveProfile[]> {
        try {
            return await drivesDb.fetchAllDrives();
        } catch (error) {
            console.error('Error fetching drives:', error);
            throw new Error('Failed to fetch drive directory data');
        }
    },

    async createDrive(data: DriveFormData): Promise<string> {
        try {
            return await drivesDb.createDrive(data);
        } catch (error) {
            console.error('Error creating drive:', error);
            throw new Error('Failed to create drive profile');
        }
    },

    async updateDrive(id: string, data: Partial<DriveFormData>): Promise<void> {
        try {
            await drivesDb.updateDrive(id, data);
        } catch (error) {
            console.error('Error updating drive:', error);
            throw new Error('Failed to update drive profile');
        }
    }
};
