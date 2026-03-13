import {
    collection,
    getDocs,
    doc,
    setDoc,
    updateDoc,
    query,
    orderBy,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { AdminInterview, InterviewFormData } from '../../types/interviewAdmin';

const COLLECTION_NAME = 'interviews';

export const interviewsService = {

    async getAllInterviews(): Promise<AdminInterview[]> {
        const interviewsRef = collection(db, COLLECTION_NAME);
        const q = query(interviewsRef, orderBy('updatedAt', 'desc'));

        const snapshot = await getDocs(q);

        return snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                scheduledDate: data.scheduledDate?.toDate() || new Date(),
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            } as AdminInterview;
        });
    },

    async createInterview(data: InterviewFormData): Promise<AdminInterview> {
        const interviewsRef = collection(db, COLLECTION_NAME);
        const newInterviewRef = doc(interviewsRef);

        const now = new Date();
        const documentData = {
            ...data,
            scheduledDate: Timestamp.fromDate(new Date(data.scheduledDate)),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        await setDoc(newInterviewRef, documentData);

        return {
            id: newInterviewRef.id,
            ...data,
            scheduledDate: new Date(data.scheduledDate), // Ensure JS Date locally
            createdAt: now,
            updatedAt: now
        };
    },

    async updateInterview(id: string, data: Partial<InterviewFormData>): Promise<void> {
        const interviewRef = doc(db, COLLECTION_NAME, id);

        const updateData: any = {
            ...data,
            updatedAt: serverTimestamp()
        };

        if (data.scheduledDate) {
            updateData.scheduledDate = Timestamp.fromDate(new Date(data.scheduledDate));
        }

        await updateDoc(interviewRef, updateData);
    }
};
