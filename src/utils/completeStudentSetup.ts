import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';

const DEFAULT_PASSWORD = 'nmims2026';

/**
 * Complete student setup:
 * 1. Create Firebase Auth accounts for students without them
 * 2. Update all profiles with complete data (internships, achievements, skills, etc.)
 */

export async function completeStudentSetup() {
    console.log('\n🚀 Starting complete student setup...\n');
    
    const results = {
        authCreated: 0,
        authExists: 0,
        authFailed: [] as string[],
        profilesUpdated: 0,
        profilesFailed: [] as string[]
    };
    
    try {
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);
        
        for (const docSnapshot of querySnapshot.docs) {
            const data = docSnapshot.data();
            
            // Only process students
            if (data.role !== 'student') continue;
            
            const email = data.email;
            const name = data.name;
            
            console.log(`\n📝 Processing: ${name} (${email})`);
            
            // Step 1: Try to create Firebase Auth account
            try {
                await createUserWithEmailAndPassword(auth, email, DEFAULT_PASSWORD);
                results.authCreated++;
                console.log(`  ✓ Created Auth account`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
            } catch (authError: any) {
                if (authError.code === 'auth/email-already-in-use') {
                    results.authExists++;
                    console.log(`  ⚠ Auth account already exists`);
                } else {
                    results.authFailed.push(email);
                    console.log(`  ✗ Auth failed: ${authError.message}`);
                }
            }
            
            // Step 2: Update profile with complete data
            try {
                const updates: any = {
                    updatedAt: Date.now()
                };
                
                // Ensure techSkills array exists
                if (!data.techSkills || !Array.isArray(data.techSkills) || data.techSkills.length === 0) {
                    updates.techSkills = [
                        'Python', 'SQL', 'Machine Learning', 'Data Science', 
                        'Data Analysis', 'Python Programming'
                    ];
                }
                
                // Ensure certifications are properly formatted
                if (!data.certifications || !Array.isArray(data.certifications)) {
                    updates.certifications = [];
                } else if (data.certifications.length > 0 && typeof data.certifications[0] === 'string') {
                    updates.certifications = data.certifications.map((cert: string, index: number) => ({
                        id: index + 1,
                        name: cert,
                        issuer: 'Various',
                        year: '2024',
                        link: ''
                    }));
                }
                
                // Ensure internships array exists
                if (!data.internships || !Array.isArray(data.internships)) {
                    updates.internships = [];
                }
                
                // Ensure achievements array exists
                if (!data.achievements || !Array.isArray(data.achievements)) {
                    updates.achievements = [];
                }
                
                // Ensure projects array exists with at least 2 projects
                if (!data.projects || !Array.isArray(data.projects) || data.projects.length === 0) {
                    updates.projects = [
                        {
                            id: 1,
                            title: 'Machine Learning Classification Model',
                            tech: 'Python, Scikit-learn, Pandas',
                            description: 'Built ML model for classification tasks',
                            link: data.githubUrl || '',
                            year: '2024'
                        },
                        {
                            id: 2,
                            title: 'Data Analytics Dashboard',
                            tech: 'Python, Plotly, Streamlit',
                            description: 'Interactive dashboard for data visualization',
                            link: data.githubUrl || '',
                            year: '2024'
                        }
                    ];
                }
                
                await setDoc(doc(db, 'users', docSnapshot.id), {
                    ...data,
                    ...updates
                }, { merge: true });
                
                results.profilesUpdated++;
                console.log(`  ✓ Profile updated`);
                
            } catch (profileError: any) {
                results.profilesFailed.push(email);
                console.log(`  ✗ Profile update failed: ${profileError.message}`);
            }
        }
        
        console.log('\n' + '='.repeat(70));
        console.log('📊 SETUP SUMMARY');
        console.log('='.repeat(70));
        console.log(`🔐 Auth Accounts:`);
        console.log(`   ✅ Created: ${results.authCreated}`);
        console.log(`   ⚠️  Already exists: ${results.authExists}`);
        console.log(`   ❌ Failed: ${results.authFailed.length}`);
        console.log(`\n📝 Profiles:`);
        console.log(`   ✅ Updated: ${results.profilesUpdated}`);
        console.log(`   ❌ Failed: ${results.profilesFailed.length}`);
        console.log('='.repeat(70) + '\n');
        
        if (results.authFailed.length > 0) {
            console.log('❌ Auth creation failed for:');
            results.authFailed.forEach(email => console.log(`   - ${email}`));
        }
        
        if (results.profilesFailed.length > 0) {
            console.log('\n❌ Profile update failed for:');
            results.profilesFailed.forEach(email => console.log(`   - ${email}`));
        }
        
        return results;
        
    } catch (error) {
        console.error('❌ Fatal error:', error);
        throw error;
    }
}
