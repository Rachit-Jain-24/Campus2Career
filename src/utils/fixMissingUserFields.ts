/**
 * One-time fix: adds missing required fields to all student user documents
 * that were created without role, careerDiscoveryCompleted, profileCompleted, assessmentCompleted.
 *
 * Run by navigating to /fix-user-fields in the browser (route added temporarily).
 * Safe to run multiple times — uses merge:true so existing fields are not overwritten.
 */

import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export async function fixMissingUserFields(): Promise<{ fixed: number; skipped: number; errors: string[] }> {
    const usersRef = collection(db, 'students');
    const snapshot = await getDocs(usersRef);

    let fixed = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const userDoc of snapshot.docs) {
        const data = userDoc.data();
        
        // Decide if this is a student document to process
        const existingRole = data.role;
        const adminRoles = ['dean', 'director', 'program_chair', 'faculty', 'placement_officer', 'system_admin'];
        const isStudentDoc = existingRole === 'student' || (!existingRole && !adminRoles.includes(existingRole as string));
        
        if (!isStudentDoc) {
            skipped++;
            continue;
        }

        // Build the patch — only add fields that are missing
        const patch: Record<string, any> = {};

        if (!existingRole) {
            patch.role = 'student';
        }

        // Mark onboarding as complete so users land on dashboard
        if (data.careerDiscoveryCompleted === undefined || data.careerDiscoveryCompleted === null) {
            patch.careerDiscoveryCompleted = true;
        }
        if (data.profileCompleted === undefined || data.profileCompleted === null) {
            patch.profileCompleted = true;
        }
        if (data.assessmentCompleted === undefined || data.assessmentCompleted === null) {
            patch.assessmentCompleted = true;
        }

        // Ensure onboardingStep is set
        if (data.onboardingStep === undefined || data.onboardingStep === null) {
            patch.onboardingStep = 3;
        }

        // Nothing to patch
        if (Object.keys(patch).length === 0) {
            skipped++;
            continue;
        }

        try {
            await setDoc(doc(db, 'users', userDoc.id), patch, { merge: true });
            console.log(`✓ Fixed user ${userDoc.id} (${data.name || data.email}):`, patch);
            fixed++;
        } catch (err: any) {
            const msg = `✗ Failed to fix ${userDoc.id}: ${err.message}`;
            console.error(msg);
            errors.push(msg);
        }
    }

    return { fixed, skipped, errors };
}
