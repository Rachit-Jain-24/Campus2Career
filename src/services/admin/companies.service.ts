import { companiesDb } from '../db/database.service';
import type { AdminCompanyProfile, CompanyFormData } from '../../types/companyAdmin';

/**
 * Service to handle fetching raw company data.
 * This automatically uses the active provider (Firestore or Supabase).
 */
export const fetchAllCompanies = async (): Promise<AdminCompanyProfile[]> => {
    try {
        return await companiesDb.fetchAllCompanies();
    } catch (error) {
        console.error('Error fetching companies:', error);
        throw new Error('Failed to fetch company directory data');
    }
};

export const createCompany = async (data: CompanyFormData): Promise<AdminCompanyProfile> => {
    try {
        return await companiesDb.createCompany(data);
    } catch (error) {
        console.error('Error creating company:', error);
        throw new Error('Failed to create company profile');
    }
};

export const updateCompany = async (id: string, data: Partial<CompanyFormData>): Promise<void> => {
    try {
        await companiesDb.updateCompany(id, data);
    } catch (error) {
        console.error('Error updating company:', error);
        throw new Error('Failed to update company profile');
    }
};
