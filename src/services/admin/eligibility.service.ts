import {
    collection,
    getDocs,
    doc,
    setDoc,
    updateDoc,
    query,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { AdminEligibilityRule, EligibilityFormData } from '../../types/eligibilityAdmin';

const COLLECTION_NAME = 'eligibility_rules';

export const eligibilityService = {

    async getAllRules(): Promise<AdminEligibilityRule[]> {
        const rulesRef = collection(db, COLLECTION_NAME);
        const q = query(rulesRef, orderBy('updatedAt', 'desc'));

        const snapshot = await getDocs(q);

        return snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                // Explicit JS Date instantiation from Firestore Timestamps
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            } as AdminEligibilityRule;
        });
    },

    async createRule(data: EligibilityFormData): Promise<AdminEligibilityRule> {
        const rulesRef = collection(db, COLLECTION_NAME);
        const newRuleRef = doc(rulesRef);

        const now = new Date();
        const ruleDocument = {
            ...data,
            linkedDriveIds: [], // default empty arrays on new
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        await setDoc(newRuleRef, ruleDocument);

        return {
            id: newRuleRef.id,
            ...data,
            linkedDriveIds: [],
            createdAt: now,
            updatedAt: now
        };
    },

    async updateRule(id: string, data: Partial<EligibilityFormData>): Promise<void> {
        const ruleRef = doc(db, COLLECTION_NAME, id);

        const updateData = {
            ...data,
            updatedAt: serverTimestamp()
        };

        await updateDoc(ruleRef, updateData);
    }
};
