import { fixAllStudentIssues } from '../utils/fixAllStudentIssues';

/**
 * Runner script to fix all student issues:
 * - Remove duplicates
 * - Fix missing data (certifications, internships, achievements)
 * - Create auth accounts
 */

async function main() {
    try {
        console.log('Starting comprehensive student data fix...\n');
        
        const result = await fixAllStudentIssues();
        
        if (result.success) {
            console.log('✅ All operations completed successfully!');
            process.exit(0);
        } else {
            console.error('⚠️  Some operations may have failed. Check logs above.');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

main();
