import { collection, getDocs, doc, setDoc, updateDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { AdminDriveProfile, DriveFormData } from '../../types/driveAdmin';

const COLLECTION_NAME = 'drives';

export const drivesService = {

    async fetchAllDrives(): Promise<AdminDriveProfile[]> {
        const drivesRef = collection(db, COLLECTION_NAME);
        const q = query(drivesRef, orderBy('createdAt', 'desc'));

        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => {
            const data = doc.data();

            return {
                id: doc.id,
                ...data,
                // Convert Firestore Timestamps back to JS Dates
                registrationStart: data.registrationStart?.toDate() || new Date(),
                registrationEnd: data.registrationEnd?.toDate() || new Date(),
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
                // Convert arrays of stages dates if extending
                stages: (data.stages || []).map((stage: any) => ({
                    ...stage,
                    date: stage.date ? stage.date.toDate() : null
                }))
            } as AdminDriveProfile;
        });
    },

    async createDrive(data: DriveFormData): Promise<string> {
        const newDriveRef = doc(collection(db, COLLECTION_NAME));

        // Clean up undefined/null values that Firestore rejects
        const cleanData = JSON.parse(JSON.stringify(data));

        await setDoc(newDriveRef, {
            ...cleanData,

            // Initial counts
            applicantCount: 0,
            shortlistedCount: 0,

            // Convert JS Dates to Firestore Timestamps
            registrationStart: Timestamp.fromDate(data.registrationStart),
            registrationEnd: Timestamp.fromDate(data.registrationEnd),
            stages: data.stages.map((stage: any) => ({
                ...stage,
                date: stage.date ? Timestamp.fromDate(stage.date) : null
            })),

            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });

        return newDriveRef.id;
    },

    async updateDrive(id: string, data: Partial<DriveFormData>): Promise<void> {
        const driveRef = doc(db, COLLECTION_NAME, id);

        const cleanData = JSON.parse(JSON.stringify(data));
        const updatePayload: any = {
            ...cleanData,
            updatedAt: Timestamp.now()
        };

        // Handle specific timestamp conversions if present in partial update
        if (data.registrationStart) updatePayload.registrationStart = Timestamp.fromDate(data.registrationStart);
        if (data.registrationEnd) updatePayload.registrationEnd = Timestamp.fromDate(data.registrationEnd);
        if (data.stages) {
            updatePayload.stages = data.stages.map((stage: any) => ({
                ...stage,
                date: stage.date ? Timestamp.fromDate(stage.date) : null
            }));
        }

        await updateDoc(driveRef, updatePayload);
    }
};
