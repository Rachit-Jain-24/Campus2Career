import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Utility to clean duplicate batch analytics entries
 * Keeps only the latest entry based on createdAt timestamp for each unique student
 */

interface StudentEntry {
    id: string;
    sapId?: string;
    email: string;
    name: string;
    createdAt: number;
    updatedAt: number;
}

export async function cleanDuplicateBatchAnalytics() {
    console.log('\n🧹 Starting duplicate cleanup for batch analytics...\n');
    
    try {
        // Fetch all student records
        const usersRef = collection(db, 'students');
        const querySnapshot = await getDocs(usersRef);
        
        console.log(`📊 Total entries found: ${querySnapshot.size}`);
        
        // Group students by unique identifier (email or sapId)
        const studentMap = new Map<string, StudentEntry[]>();
        
        querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const entry: StudentEntry = {
                id: docSnapshot.id,
                sapId: data.sapId,
                email: data.email,
                name: data.name,
                createdAt: data.createdAt || 0,
                updatedAt: data.updatedAt || 0
            };
            
            // Use email as the unique key (or sapId if email not available)
            const key = entry.email || entry.sapId || entry.id;
            
            if (!studentMap.has(key)) {
                studentMap.set(key, []);
            }
            studentMap.get(key)!.push(entry);
        });
        
        console.log(`👥 Unique students identified: ${studentMap.size}\n`);
        
        // Find and delete duplicates
        let duplicatesFound = 0;
        let duplicatesDeleted = 0;
        const deletionPromises: Promise<void>[] = [];
        
        for (const [key, entries] of studentMap.entries()) {
            if (entries.length > 1) {
                duplicatesFound += entries.length - 1;
                
                // Sort by createdAt descending (latest first)
                entries.sort((a, b) => b.createdAt - a.createdAt);
                
                const latest = entries[0];
                const duplicates = entries.slice(1);
                
                console.log(`🔍 Found ${entries.length} entries for: ${key}`);
                console.log(`   ✅ Keeping: ${latest.name} (ID: ${latest.id}, Created: ${new Date(latest.createdAt).toLocaleString()})`);
                
                // Delete all duplicates
                for (const duplicate of duplicates) {
                    console.log(`   ❌ Deleting: ${duplicate.name} (ID: ${duplicate.id}, Created: ${new Date(duplicate.createdAt).toLocaleString()})`);
                    deletionPromises.push(
                        deleteDoc(doc(db, 'users', duplicate.id))
                            .then(() => {
                                duplicatesDeleted++;
                            })
                            .catch((error) => {
                                console.error(`   ⚠️  Failed to delete ${duplicate.id}:`, error.message);
                            })
                    );
                }
                console.log('');
            }
        }
        
        // Wait for all deletions to complete
        await Promise.all(deletionPromises);
        
        console.log('='.repeat(70));
        console.log('📊 CLEANUP SUMMARY');
        console.log('='.repeat(70));
        console.log(`Total entries before: ${querySnapshot.size}`);
        console.log(`Unique students: ${studentMap.size}`);
        console.log(`Duplicates found: ${duplicatesFound}`);
        console.log(`Duplicates deleted: ${duplicatesDeleted}`);
        console.log(`Remaining entries: ${studentMap.size}`);
        console.log('='.repeat(70) + '\n');
        
        return {
            totalBefore: querySnapshot.size,
            uniqueStudents: studentMap.size,
            duplicatesFound,
            duplicatesDeleted,
            success: duplicatesDeleted === duplicatesFound
        };
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        throw error;
    }
}

// Function to preview duplicates without deleting
export async function previewDuplicates() {
    console.log('\n🔍 Previewing duplicate entries...\n');
    
    try {
        const usersRef = collection(db, 'students');
        const querySnapshot = await getDocs(usersRef);
        
        console.log(`📊 Total entries: ${querySnapshot.size}\n`);
        
        const studentMap = new Map<string, StudentEntry[]>();
        
        querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const entry: StudentEntry = {
                id: docSnapshot.id,
                sapId: data.sapId,
                email: data.email,
                name: data.name,
                createdAt: data.createdAt || 0,
                updatedAt: data.updatedAt || 0
            };
            
            const key = entry.email || entry.sapId || entry.id;
            
            if (!studentMap.has(key)) {
                studentMap.set(key, []);
            }
            studentMap.get(key)!.push(entry);
        });
        
        let duplicateCount = 0;
        
        for (const [key, entries] of studentMap.entries()) {
            if (entries.length > 1) {
                duplicateCount += entries.length - 1;
                entries.sort((a, b) => b.createdAt - a.createdAt);
                
                console.log(`📧 ${key}`);
                console.log(`   Found ${entries.length} entries:`);
                entries.forEach((entry, index) => {
                    const status = index === 0 ? '✅ KEEP' : '❌ DELETE';
                    console.log(`   ${status} - ${entry.name} (ID: ${entry.id}, Created: ${new Date(entry.createdAt).toLocaleString()})`);
                });
                console.log('');
            }
        }
        
        console.log('='.repeat(70));
        console.log(`Total entries: ${querySnapshot.size}`);
        console.log(`Unique students: ${studentMap.size}`);
        console.log(`Duplicates to remove: ${duplicateCount}`);
        console.log(`Final count after cleanup: ${studentMap.size}`);
        console.log('='.repeat(70) + '\n');
        
        return {
            totalEntries: querySnapshot.size,
            uniqueStudents: studentMap.size,
            duplicatesToRemove: duplicateCount
        };
        
    } catch (error) {
        console.error('❌ Error during preview:', error);
        throw error;
    }
}
