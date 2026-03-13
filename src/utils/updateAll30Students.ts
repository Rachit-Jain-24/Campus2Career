import { db } from '../lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

// Import all student data
import batch1 from '../data/all30StudentsData.json';
import batch2 from '../data/remaining20StudentsData.json';
import batch3 from '../data/students17to25.json';
import batch4 from '../data/students22to32.json';
import batch5 from '../data/students30to32.json';

// Combine all batches
const allStudents = [...batch1, ...batch2, ...batch3, ...batch4, ...batch5];

// Remove duplicates based on sapId
const uniqueStudents = Array.from(
    new Map(allStudents.map(student => [student.sapId, student])).values()
);

console.log(`Total unique students to update: ${uniqueStudents.length}`);

export async function updateAll30Students() {
    const results = {
        success: [] as string[],
        notFound: [] as string[],
        failed: [] as { name: string; error: string }[],
        total: uniqueStudents.length
    };

    console.log(`\n🔄 Starting update for ${uniqueStudents.length} students...\n`);

    for (const student of uniqueStudents) {
        try {
            const userRef = doc(db, 'users', student.sapId);
            const docSnap = await getDoc(userRef);

            if (!docSnap.exists()) {
                console.log(`⚠ ${student.fullName} (${student.sapId}) not found`);
                results.notFound.push(student.fullName);
                continue;
            }

            // Update the document
            await updateDoc(userRef, {
                leetcode: student.leetcode,
                leetcodeStats: null, // Reset to fetch fresh
                projects: student.projects,
                updatedAt: Date.now()
            });

            console.log(`✓ Updated ${student.fullName} (${student.sapId})`);
            results.success.push(student.fullName);

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 300));

        } catch (error: any) {
            console.error(`✗ Failed ${student.fullName}:`, error.message);
            results.failed.push({
                name: student.fullName,
                error: error.message
            });
        }
    }

    // Print summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 UPDATE SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successfully updated: ${results.success.length}/${results.total}`);
    console.log(`⚠️  Not found in database: ${results.notFound.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log('='.repeat(70) + '\n');

    if (results.notFound.length > 0) {
        console.log('⚠️  Students not found (need to be seeded first):');
        results.notFound.forEach(name => console.log(`   - ${name}`));
        console.log('');
    }

    if (results.failed.length > 0) {
        console.log('❌ Failed updates:');
        results.failed.forEach(({ name, error }) => console.log(`   - ${name}: ${error}`));
        console.log('');
    }

    return results;
}

// Export student count for reference
export const totalStudentsToUpdate = uniqueStudents.length;
export { uniqueStudents };
