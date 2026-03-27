import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { completeBatchStudentsData, newBatchStudentsData } from '../data/completeBatchStudentsData';

/**
 * Preview what will be fixed without making any changes
 * Shows duplicates, missing data, and missing auth accounts
 */

interface StudentEntry {
    id: string;
    sapId?: string;
    email: string;
    name: string;
    createdAt: number;
    certifications?: any[];
    internships?: any[];
    achievements?: any[];
    projects?: any[];
}

function generateSapId(srNo: number): string {
    return `705722${srNo.toString().padStart(5, '0')}`;
}

export async function previewStudentFixes() {
    console.log('\n' + '='.repeat(70));
    console.log('🔍 PREVIEW: What Will Be Fixed');
    console.log('='.repeat(70) + '\n');
    
    try {
        // Fetch all current entries
        const usersRef = collection(db, 'students');
        const querySnapshot = await getDocs(usersRef);
        
        console.log(`📊 Current Database Status:`);
        console.log(`   Total entries: ${querySnapshot.size}`);
        
        // Group by email to find duplicates
        const studentMap = new Map<string, StudentEntry[]>();
        
        querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const entry: StudentEntry = {
                id: docSnapshot.id,
                sapId: data.sapId,
                email: data.email,
                name: data.name,
                createdAt: data.createdAt || 0,
                certifications: data.certifications || [],
                internships: data.internships || [],
                achievements: data.achievements || [],
                projects: data.projects || []
            };
            
            const key = entry.email || entry.sapId || entry.id;
            
            if (!studentMap.has(key)) {
                studentMap.set(key, []);
            }
            studentMap.get(key)!.push(entry);
        });
        
        console.log(`   Unique students: ${studentMap.size}\n`);
        
        // 1. Preview Duplicates
        console.log('🗑️  DUPLICATES TO BE REMOVED:\n');
        let duplicateCount = 0;
        
        for (const [key, entries] of studentMap.entries()) {
            if (entries.length > 1) {
                duplicateCount += entries.length - 1;
                entries.sort((a, b) => b.createdAt - a.createdAt);
                
                console.log(`   📧 ${key}`);
                console.log(`      ✅ KEEP: ${entries[0].name} (Created: ${new Date(entries[0].createdAt).toLocaleString()})`);
                
                for (let i = 1; i < entries.length; i++) {
                    console.log(`      ❌ DELETE: ${entries[i].name} (Created: ${new Date(entries[i].createdAt).toLocaleString()})`);
                }
                console.log('');
            }
        }
        
        if (duplicateCount === 0) {
            console.log('   ✅ No duplicates found!\n');
        } else {
            console.log(`   Total duplicates to remove: ${duplicateCount}\n`);
        }
        
        // 2. Preview Missing Data
        console.log('📝 STUDENTS WITH MISSING DATA:\n');
        
        const allStudentsData = [...completeBatchStudentsData, ...newBatchStudentsData];
        let missingDataCount = 0;
        
        for (const student of allStudentsData) {
            const sapId = generateSapId(student.srNo);
            
            // Find this student in current database
            let currentEntry: StudentEntry | undefined;
            for (const entries of studentMap.values()) {
                const found = entries.find(e => e.sapId === sapId || e.email === student.email);
                if (found) {
                    currentEntry = entries[0]; // Use the latest one
                    break;
                }
            }
            
            if (currentEntry) {
                const missing: string[] = [];
                
                if (!currentEntry.certifications || currentEntry.certifications.length === 0) {
                    if (student.certifications.length > 0) {
                        missing.push(`${student.certifications.length} certifications`);
                    }
                }
                
                if (!currentEntry.internships || currentEntry.internships.length === 0) {
                    if (student.internships.hasInternship) {
                        missing.push(`${student.internships.count} internship(s)`);
                    }
                }
                
                if (!currentEntry.achievements || currentEntry.achievements.length === 0) {
                    const totalAchievements = student.achievements.length + 
                                            student.hackathons.count + 
                                            student.publications.count;
                    if (totalAchievements > 0) {
                        missing.push(`${totalAchievements} achievements`);
                    }
                }
                
                if (!currentEntry.projects || currentEntry.projects.length < 2) {
                    missing.push(`${student.githubProjects} projects`);
                }
                
                if (missing.length > 0) {
                    missingDataCount++;
                    console.log(`   ${student.srNo}. ${student.fullName}`);
                    console.log(`      Missing: ${missing.join(', ')}`);
                    console.log(`      Will add:`);
                    
                    if (student.certifications.length > 0) {
                        console.log(`         • Certifications: ${student.certifications.join(', ')}`);
                    }
                    if (student.internships.hasInternship) {
                        console.log(`         • Internships: ${student.internships.companies.join(', ')}`);
                    }
                    if (student.achievements.length > 0) {
                        console.log(`         • Achievements: ${student.achievements.slice(0, 2).join(', ')}${student.achievements.length > 2 ? '...' : ''}`);
                    }
                    if (student.hackathons.count > 0) {
                        console.log(`         • Hackathons: ${student.hackathons.details.slice(0, 2).join(', ')}${student.hackathons.count > 2 ? '...' : ''}`);
                    }
                    if (student.publications.count > 0) {
                        console.log(`         • Publications: ${student.publications.details.slice(0, 2).join(', ')}${student.publications.count > 2 ? '...' : ''}`);
                    }
                    console.log('');
                }
            }
        }
        
        if (missingDataCount === 0) {
            console.log('   ✅ All students have complete data!\n');
        } else {
            console.log(`   Total students with missing data: ${missingDataCount}\n`);
        }
        
        // 3. Summary
        console.log('='.repeat(70));
        console.log('📊 PREVIEW SUMMARY');
        console.log('='.repeat(70));
        console.log(`Current entries: ${querySnapshot.size}`);
        console.log(`Unique students: ${studentMap.size}`);
        console.log(`Duplicates to remove: ${duplicateCount}`);
        console.log(`Students with missing data: ${missingDataCount}`);
        console.log(`Final count after fix: ${studentMap.size}`);
        console.log('='.repeat(70) + '\n');
        
        console.log('💡 To apply these fixes, run: npm run fix-students\n');
        
        return {
            currentEntries: querySnapshot.size,
            uniqueStudents: studentMap.size,
            duplicatesToRemove: duplicateCount,
            studentsWithMissingData: missingDataCount
        };
        
    } catch (error) {
        console.error('❌ Error during preview:', error);
        throw error;
    }
}
