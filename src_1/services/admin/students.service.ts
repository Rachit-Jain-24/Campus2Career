import { studentsDb } from '../db/database.service';
import type { AdminStudentProfile } from '../../types/studentAdmin';
import type { PaginationParams, PaginatedResult } from '../db/types';

const STUDENT_DIRECTORY_ERROR =
    'Unable to load students. Please check your connection and try again. If the problem persists, contact support.';

/**
 * Service to handle fetching raw student data.
 * This automatically uses the active provider (Firestore or Supabase).
 */
export const fetchAllStudents = async (): Promise<AdminStudentProfile[]> => {
    try {
        return await studentsDb.fetchAllStudents();
    } catch (error) {
        console.error('Error fetching students:', error);
        throw new Error(STUDENT_DIRECTORY_ERROR);
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
        throw new Error(STUDENT_DIRECTORY_ERROR);
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
