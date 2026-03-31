import { db } from '../lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

/**
 * Fix student profiles by adding missing internships, achievements, skills, etc.
 */

// Helper to extract tech skills from skill ratings
function extractTechSkills(skills: any): string[] {
    const techSkills: string[] = [];
    
    if (skills.python >= 7) techSkills.push('Python');
    if (skills.sql >= 7) techSkills.push('SQL');
    if (skills.machineLearning >= 7) techSkills.push('Machine Learning');
    if (skills.deepLearning >= 7) techSkills.push('Deep Learning');
    if (skills.genAI >= 7) techSkills.push('GenAI');
    if (skills.frontEnd >= 7) techSkills.push('Frontend Development');
    
    techSkills.push('Data Science', 'Python Programming', 'Data Analysis');
    
    return techSkills;
}

// Helper to format certifications
function formatCertifications(certs: string[]): any[] {
    return certs.map((cert, index) => ({
        id: index + 1,
        name: cert,
        issuer: cert.includes('AWS') ? 'Amazon Web Services' : 
                cert.includes('Google') ? 'Google' : 
                cert.includes('NPTEL') ? 'NPTEL' : 
                cert.includes('HarvardX') ? 'Harvard University' :
                cert.includes('Infosys') ? 'Infosys' : 'Various',
        year: '2024',
        link: ''
    }));
}

// Helper to format internships
function formatInternships(internshipData: any): any[] {
    if (!internshipData || !internshipData.hasInternship || internshipData.count === 0) {
        return [];
    }
    
    return internshipData.companies.map((company: string, index: number) => ({
        id: index + 1,
        role: 'Data Science Intern',
        company: company,
        period: internshipData.duration,
        description: `Worked on data science and machine learning projects at ${company}`
    }));
}

// Helper to format achievements
function formatAchievements(achievements: string[], publications: any, hackathons: any): any[] {
    const formattedAchievements: any[] = [];
    let id = 1;
    
    // Add custom achievements
    achievements.forEach(achievement => {
        formattedAchievements.push({
            id: id++,
            title: achievement.length > 50 ? achievement.substring(0, 50) + '...' : achievement,
            description: achievement,
            year: '2024'
        });
    });
    
    // Add publication achievements
    if (publications && publications.count > 0) {
        formattedAchievements.push({
            id: id++,
            title: `Published ${publications.count} Research Paper${publications.count > 1 ? 's' : ''}`,
            description: publications.details.join('; '),
            year: '2024'
        });
    }
    
    // Add hackathon achievements
    if (hackathons && hackathons.count > 0) {
        formattedAchievements.push({
            id: id++,
            title: `Participated in ${hackathons.count} Hackathon${hackathons.count > 1 ? 's' : ''}`,
            description: hackathons.details.join('; '),
            year: '2024'
        });
    }
    
    return formattedAchievements;
}

export async function fixStudentProfilesData() {
    console.log('\n🔧 Starting to fix student profile data...\n');
    
    try {
        const usersRef = collection(db, 'students');
        const querySnapshot = await getDocs(usersRef);
        
        let updated = 0;
        let skipped = 0;
        
        for (const docSnapshot of querySnapshot.docs) {
            const data = docSnapshot.data();
            
            // Only process students
            if (data.role !== 'student') {
                skipped++;
                continue;
            }
            
            const updates: any = {};
            let needsUpdate = false;
            
            // Check and fix techSkills
            if (!data.techSkills || data.techSkills.length === 0) {
                // Generate from default skills
                updates.techSkills = ['Python', 'SQL', 'Machine Learning', 'Data Science', 'Data Analysis'];
                needsUpdate = true;
            }
            
            // Check and fix certifications format
            if (data.certifications && Array.isArray(data.certifications)) {
                if (data.certifications.length > 0 && typeof data.certifications[0] === 'string') {
                    updates.certifications = formatCertifications(data.certifications);
                    needsUpdate = true;
                }
            }
            
            // Check and fix internships format
            if (!data.internships || !Array.isArray(data.internships)) {
                updates.internships = [];
                needsUpdate = true;
            }
            
            // Check and fix achievements format
            if (!data.achievements || !Array.isArray(data.achievements)) {
                updates.achievements = [];
                needsUpdate = true;
            }
            
            // Check and fix projects
            if (!data.projects || !Array.isArray(data.projects) || data.projects.length === 0) {
                updates.projects = [
                    {
                        id: 1,
                        title: 'Machine Learning Project',
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
                needsUpdate = true;
            }
            
            if (needsUpdate) {
                await updateDoc(doc(db, 'users', docSnapshot.id), {
                    ...updates,
                    updatedAt: Date.now()
                });
                updated++;
                console.log(`✓ Updated: ${data.name} (${data.email})`);
            } else {
                skipped++;
            }
        }
        
        console.log('\n' + '='.repeat(70));
        console.log('📊 FIX SUMMARY');
        console.log('='.repeat(70));
        console.log(`✅ Updated: ${updated}`);
        console.log(`⏭️  Skipped: ${skipped}`);
        console.log(`📝 Total processed: ${querySnapshot.size}`);
        console.log('='.repeat(70) + '\n');
        
        return { updated, skipped, total: querySnapshot.size };
        
    } catch (error) {
        console.error('❌ Error fixing profiles:', error);
        throw error;
    }
}
