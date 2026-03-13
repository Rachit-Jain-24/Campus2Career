import { collection, getDocs, doc, setDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { AdminCompanyProfile, CompanyFormData } from '../../types/companyAdmin';

// Using a dedicated 'companies' collection in Firestore
const COLLECTION_NAME = 'companies';

export const fetchAllCompanies = async (): Promise<AdminCompanyProfile[]> => {
    try {
        const companiesRef = collection(db, COLLECTION_NAME);
        const q = query(companiesRef, orderBy('updatedAt', 'desc'));
        const snapshot = await getDocs(q);

        const companies: AdminCompanyProfile[] = [];
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            companies.push({
                id: docSnap.id,
                companyName: data.companyName || '',
                industry: data.industry || '',
                website: data.website || '',
                hrName: data.hrName || '',
                hrEmail: data.hrEmail || '',
                hrPhone: data.hrPhone || '',
                packageRange: data.packageRange || '',
                eligibleDepartments: data.eligibleDepartments || [],
                location: data.location || '',
                hiringMode: data.hiringMode || 'on-campus',
                jobRoles: data.jobRoles || [],
                status: data.status || 'upcoming',
                notes: data.notes || '',
                logoUrl: data.logoUrl || '',
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            });
        });

        return companies;
    } catch (error) {
        console.error('Error fetching companies from Firestore:', error);
        throw new Error('Failed to fetch company directory data');
    }
};

export const createCompany = async (data: CompanyFormData): Promise<AdminCompanyProfile> => {
    try {
        const companiesRef = collection(db, COLLECTION_NAME);
        const newDocRef = doc(companiesRef); // Auto-generate ID

        const now = new Date();
        const newCompany: AdminCompanyProfile = {
            ...data,
            id: newDocRef.id,
            createdAt: now,
            updatedAt: now
        };

        await setDoc(newDocRef, newCompany);
        return newCompany;

    } catch (error) {
        console.error('Error creating company:', error);
        throw new Error('Failed to create company profile');
    }
};

export const updateCompany = async (id: string, data: Partial<CompanyFormData>): Promise<void> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: new Date()
        });
    } catch (error) {
        console.error('Error updating company:', error);
        throw new Error('Failed to update company profile');
    }
};
