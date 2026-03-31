import { offersDb } from '../db/database.service';
import type { AdminOffer, OfferFormData } from '../../types/offerAdmin';

/**
 * Service to handle fetching and managing student placement offers.
 * This automatically uses the active provider (Firestore or Supabase).
 */
export const offersService = {

    async getAllOffers(): Promise<AdminOffer[]> {
        try {
            return await offersDb.getAllOffers();
        } catch (error) {
            console.error('Error fetching offers:', error);
            throw new Error('Failed to fetch offer directory data');
        }
    },

    async createOffer(data: OfferFormData): Promise<AdminOffer> {
        try {
            return await offersDb.createOffer(data);
        } catch (error) {
            console.error('Error creating offer:', error);
            throw new Error('Failed to create offer profile');
        }
    },

    async updateOffer(id: string, data: Partial<OfferFormData>): Promise<void> {
        try {
            await offersDb.updateOffer(id, data);
        } catch (error) {
            console.error('Error updating offer:', error);
            throw new Error('Failed to update offer profile');
        }
    }
};
