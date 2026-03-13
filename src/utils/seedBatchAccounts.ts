import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { batchStudentsData } from '../data/batchStudentsData';

// Default password for all batch students
const DEFAULT_PASSWORD = 'nmims2026';

// Helper function to generate SAP ID from Sr. No.
function generateSapId(srNo: number): string {
    // Generate SAP ID in format: 705722000XX (where XX is the Sr. No.)
    return `705722${srNo.toString().padStart(5, '0')}`;
}

// Helper function to generate roll number
function generateRollNo(srNo: number): string {
    return `22CSDS${srNo.toString().padStart(3, '0')}`;
}

// Helper function to extract tech skills from skill ratings
function extractTechSkills(skills: any): string[] {
    const techSkills: string[] = [];
    
    if (skills.python >= 7) techSkills.push('Python');
    if (skills.sql >= 7) techSkills.push('SQL');
    if (skills.machineLearning >= 7) techSkills.push('Machine Learning');
    if (skills.deepLearning >= 7) techSkills.push('Deep Learning');
    if (skills.genAI >= 7) techSkills.push('GenAI');
    if (skills.frontEnd >= 7) techSkills.push('Frontend Development');
    
    // Add additional common skills
    techSkills.push('Data Science', 'Python Programming', 'Data Analysis');
    
    return techSkills;
}

// Helper function to generate projects based on student data
function generateProjects(student: any): any[] {
    const projects: any[] = [];
    const projectCount = student.githubProjects || 2;
    
    // Generate projects based on their skills
    const projectTemplates = [
        { title: 'Machine Learning Classification Model', tech: 'Python, Scikit-learn, Pandas', description: 'Built ML model for classification tasks' },
        { title: 'Data Analytics Dashboard', tech: 'Python, Plotly, Streamlit', description: 'Interactive dashboard for data visualization' },
        { title: 'Deep Learning Image Classifier', tech: 'Python, TensorFlow, Keras', description: 'CNN-based image classification system' },
        { title: 'SQL Database Management System', tech: 'SQL, PostgreSQL', description: 'Database design and optimization project' },
        { title: 'GenAI Chatbot', tech: 'Python, OpenAI API, LangChain', description: 'AI-powered conversational assistant' },
        { title: 'Web Application', tech: 'React, Node.js, MongoDB', description: 'Full-stack web application' },
        { title: 'Data Science Research Project', tech: 'Python, Jupyter, NumPy', description: 'Research-based data science project' },
        { title: 'Predictive Analytics Model', tech: 'Python, Scikit-learn, XGBoost', description: 'Predictive modeling for business insights' }
    ];
    
    for (let i = 0; i < Math.min(projectCount, 8); i++) {
        const template = projectTemplates[i];
        projects.push({
            id: i + 1,
            title: template.title,
            tech: template.tech,
            description: template.description,
            link: student.githubUrl || '',
            year: '2024'
        });
    }
    
    return projects;
}

// Helper function to format certifications
function formatCertifications(certs: string[]): any[] {
    return certs.map((cert, index) => ({
        id: index + 1,
        name: cert,
        issuer: cert.includes('AWS') ? 'Amazon Web Services' : cert.includes('Google') ? 'Google' : cert.includes('NPTEL') ? 'NPTEL' : 'Various',
        year: '2024',
        link: ''
    }));
}

// Helper function to format internships
function formatInternships(internshipData: any): any[] {
    if (!internshipData.hasInternship || internshipData.count === 0) {
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

// Helper function to format achievements
function formatAchievements(achievements: string[], publications: any, hackathons: any): any[] {
    const formattedAchievements: any[] = [];
    let id = 1;
    
    // Add custom achievements
    achievements.forEach(achievement => {
        formattedAchievements.push({
            id: id++,
            title: achievement.substring(0, 50),
            description: achievement,
            year: '2024'
        });
    });
    
    // Add publication achievements
    if (publications.count > 0) {
        formattedAchievements.push({
            id: id++,
            title: `Published ${publications.count} Research Paper${publications.count > 1 ? 's' : ''}`,
            description: publications.details.join('; '),
            year: '2024'
        });
    }
    
    // Add hackathon achievements
    if (hackathons.count > 0) {
        formattedAchievements.push({
            id: id++,
            title: `Participated in ${hackathons.count} Hackathon${hackathons.count > 1 ? 's' : ''}`,
            description: hackathons.details.join('; '),
            year: '2024'
        });
    }
    
    return formattedAchievements;
}

export async function seedBatchAccounts() {
    const results = {
        success: [] as string[],
        failed: [] as { email: string; error: string }[],
        total: batchStudentsData.length
    };
    
    console.log(`Starting to seed ${batchStudentsData.length} batch student accounts...`);
    
    for (let i = 0; i < batchStudentsData.length; i++) {
        const student = batchStudentsData[i];
        try {
            console.log(`Processing ${i + 1}/${batchStudentsData.length}: ${student.fullName} (${student.email})`);
            
            let userId = '';
            const sapId = generateSapId(student.srNo);
            const rollNo = generateRollNo(student.srNo);
            
            // Try to create Firebase Auth account
            try {
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    student.email,
                    DEFAULT_PASSWORD
                );
                userId = userCredential.user.uid;
                console.log(`✓ Created Firebase Auth for ${student.email}`);
                
                // Add delay after auth creation to avoid rate limiting (1 second)
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (authError: any) {
                if (authError.code === 'auth/email-already-in-use') {
                    // Account exists, use a placeholder UID (we'll use sapId as UID for consistency)
                    userId = sapId;
                    console.log(`⚠ Auth account exists for ${student.email}, updating Firestore only`);
                } else {
                    throw authError;
                }
            }
            
            // Create Firestore profile
            const userProfile = {
                id: userId,
                sapId: sapId,
                rollNo: rollNo,
                name: student.fullName,
                email: student.email,
                phone: student.phone,
                role: 'student',
                branch: 'B.Tech CSE (Data Science)',
                currentYear: 4, // All are final year students
                batch: '2022-2026',
                cgpa: student.cgpa,
                
                // Profile completion flags
                profileCompleted: true,
                careerDiscoveryCompleted: true,
                assessmentCompleted: true,
                
                // Career information
                careerTrack: 'Data Scientist',
                careerTrackEmoji: '📊',
                placementStatus: 'Actively Preparing',
                
                // Skills and experience
                techSkills: extractTechSkills(student.skills),
                interests: ['Data Science', 'Machine Learning', 'AI'],
                projects: generateProjects(student),
                certifications: formatCertifications(student.certifications),
                internships: formatInternships(student.internships),
                achievements: formatAchievements(student.achievements, student.publications, student.hackathons),
                
                // LeetCode data - only store username, stats fetched in real-time
                leetcode: student.leetcodeUsername,
                leetcodeStats: null, // Will be fetched in real-time from API
                
                // Social links
                githubUrl: student.githubUrl,
                linkedinUrl: student.linkedinUrl,
                
                // Additional info
                bio: `Final year B.Tech CSE (Data Science) student at NMIMS Hyderabad. Passionate about ${student.skills.machineLearning >= 8 ? 'Machine Learning' : student.skills.genAI >= 8 ? 'GenAI' : 'Data Science'} and building innovative solutions.`,
                location: `${student.city}, Telangana`,
                resumeUrl: '',
                resumeName: '',
                
                // Assessment results (placeholder)
                assessmentResults: {
                    personality: 'Analytical',
                    strengths: ['Problem Solving', 'Technical Skills', 'Research'],
                    interests: ['Data Science', 'Machine Learning', 'AI'],
                    recommendedRoles: ['Data Scientist', 'ML Engineer', 'Data Analyst'],
                    cgpa: student.cgpa,
                    swoc: {
                        strengths: ['Strong technical foundation', 'Research experience'],
                        weaknesses: ['Need more industry exposure'],
                        opportunities: ['Growing AI/ML industry', 'Research publications'],
                        challenges: ['Competitive job market']
                    }
                },
                
                // Metadata
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            
            // Save to Firestore with SAP ID as document ID (for login lookup)
            await setDoc(doc(db, 'users', sapId), userProfile);
            
            results.success.push(student.email);
            console.log(`✓ Successfully created account for ${student.fullName}`);
            
        } catch (error: any) {
            console.error(`✗ Failed to create account for ${student.fullName}:`, error.message);
            results.failed.push({
                email: student.email,
                error: error.message
            });
        }
    }
    
    return results;
}

// Function to delete all batch accounts (for re-seeding)
export async function deleteBatchAccounts() {
    const results = {
        success: [] as string[],
        failed: [] as { sapId: string; error: string }[],
        total: batchStudentsData.length
    };
    
    console.log(`Starting to delete ${batchStudentsData.length} batch student accounts...`);
    
    for (const student of batchStudentsData) {
        try {
            const sapId = generateSapId(student.srNo);
            
            // Delete Firestore document
            await deleteDoc(doc(db, 'users', sapId));
            
            results.success.push(sapId);
            console.log(`✓ Deleted Firestore document for ${sapId}`);
            
        } catch (error: any) {
            console.error(`✗ Failed to delete ${student.fullName}:`, error.message);
            results.failed.push({
                sapId: generateSapId(student.srNo),
                error: error.message
            });
        }
    }
    
    console.log('\n⚠️ Note: Firebase Auth accounts cannot be deleted from client-side.');
    console.log('To fully delete accounts, use Firebase Console > Authentication > Users');
    
    return results;
}
