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
import type { AdminOffer, OfferFormData } from '../../types/offerAdmin';

const COLLECTION_NAME = 'offers';

export const offersService = {

    async getAllOffers(): Promise<AdminOffer[]> {
        const offersRef = collection(db, COLLECTION_NAME);
        const q = query(offersRef, orderBy('updatedAt', 'desc'));

        const snapshot = await getDocs(q);

        return snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                joiningDate: data.joiningDate ? data.joiningDate.toDate() : null,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            } as AdminOffer;
        });
    },

    async createOffer(data: OfferFormData): Promise<AdminOffer> {
        const offersRef = collection(db, COLLECTION_NAME);
        const newOfferRef = doc(offersRef);

        const now = new Date();
        const documentData = {
            ...data,
            joiningDate: data.joiningDate ? Timestamp.fromDate(new Date(data.joiningDate)) : null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        await setDoc(newOfferRef, documentData);

        return {
            id: newOfferRef.id,
            ...data,
            joiningDate: data.joiningDate ? new Date(data.joiningDate) : null,
            createdAt: now,
            updatedAt: now
        };
    },

    async updateOffer(id: string, data: Partial<OfferFormData>): Promise<void> {
        const offerRef = doc(db, COLLECTION_NAME, id);

        const updateData: any = {
            ...data,
            updatedAt: serverTimestamp()
        };

        if (data.joiningDate !== undefined) {
            updateData.joiningDate = data.joiningDate ? Timestamp.fromDate(new Date(data.joiningDate)) : null;
        }

        await updateDoc(offerRef, updateData);
    }
};
