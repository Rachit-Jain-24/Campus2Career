/**
 * Script to clean duplicate batch analytics entries
 * Run this to remove duplicates and keep only the latest entries
 */

import { cleanDuplicateBatchAnalytics, previewDuplicates } from '../utils/cleanDuplicateBatchAnalytics';

async function main() {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║     Batch Analytics Duplicate Cleanup Utility                 ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    
    try {
        // First, preview what will be deleted
        console.log('STEP 1: Previewing duplicates...\n');
        const preview = await previewDuplicates();
        
        if (preview.duplicatesToRemove === 0) {
            console.log('✅ No duplicates found! Database is clean.');
            return;
        }
        
        console.log(`\n⚠️  Found ${preview.duplicatesToRemove} duplicate entries to remove.\n`);
        console.log('STEP 2: Cleaning duplicates...\n');
        
        // Perform the cleanup
        const result = await cleanDuplicateBatchAnalytics();
        
        if (result.success) {
            console.log('✅ Cleanup completed successfully!');
            console.log(`   Removed ${result.duplicatesDeleted} duplicate entries.`);
            console.log(`   Database now has ${result.uniqueStudents} unique student records.\n`);
        } else {
            console.log('⚠️  Cleanup completed with some errors.');
            console.log(`   Deleted ${result.duplicatesDeleted} out of ${result.duplicatesFound} duplicates.\n`);
        }
        
    } catch (error) {
        console.error('❌ Fatal error during cleanup:', error);
        process.exit(1);
    }
}

// Run the script
main();
