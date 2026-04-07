import { studentsDb } from '../db/database.service';
import type { AdminStudentProfile } from '../../types/studentAdmin';
import type { PaginationParams, PaginatedResult } from '../db/types';

/**
 * Service to handle fetching raw student data.
 * This automatically uses the active provider (Firestore or Supabase).
 */
export const fetchAllStudents = async (): Promise<AdminStudentProfile[]> => {
    try {
        return await studentsDb.fetchAllStudents();
    } catch (error) {
        console.error('Error fetching students:', error);
        throw new Error('Failed to fetch student directory data');
    }
};

/**
 * Fetch students with pagination, sorting, and filtering support.
 * This is the recommended method for admin student lists.
 */
export const fetchStudentsPaginated = async (
    params: PaginationParams
): Promise<PaginatedResult<AdminStudentProfile>> => {
    try {
        return await studentsDb.fetchStudentsPaginated(params);
    } catch (error) {
        console.error('Error fetching paginated students:', error);
        throw new Error('Failed to fetch student directory data');
    }
};

export const fetchStudentBySapId = async (sapId: string): Promise<AdminStudentProfile | null> => {
    try {
        return await studentsDb.getStudentBySapId(sapId);
    } catch (error) {
        console.error('Error fetching student by SAP ID:', error);
        return null;
    }
};
