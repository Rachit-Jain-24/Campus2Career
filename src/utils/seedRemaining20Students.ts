import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// Default password for all batch students
const DEFAULT_PASSWORD = 'nmims2026';

// Helper function to generate SAP ID from Sr. No.
function generateSapId(srNo: number): string {
    return `705722${srNo.toString().padStart(5, '0')}`;
}

// Helper function to generate roll number
function generateRollNo(srNo: number): string {
    return `22CSDS${srNo.toString().padStart(3, '0')}`;
}

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

// Helper to generate projects
function generateProjects(student: any): any[] {
    const projects: any[] = [];
    const projectCount = student.projects || 2;
    
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
            link: student.github || '',
            year: '2024'
        });
    }
    
    return projects;
}

// Remaining 20 students data (Sr. No. 11-32)
const remaining20Students = [
    { srNo: 11, fullName: "Ruthvik Akula", email: "ruthwik.akula028@nmims.edu.in", phone: "9959557429", gender: "Male", age: 21, cgpa: "8.5", leetcode: "ruth_vik", leetcodeSolved: 20, github: "https://github.com/ruth0107", linkedin: "https://www.linkedin.com/in/ruthvik-akula-99106021b/", projects: 8, skills: { python: 8, sql: 8, machineLearning: 9, deepLearning: 8, genAI: 8, frontEnd: 6 } },
    { srNo: 13, fullName: "Anmagandla Snehil", email: "snehil.a030@nmims.edu.in", phone: "9502605942", gender: "Male", age: 21, cgpa: "7.8", leetcode: "Snehil_0108", leetcodeSolved: 31, github: "https://github.com/Snehil-0108", linkedin: "https://www.linkedin.com/in/anmagandla-snehil0108", projects: 5, skills: { python: 8, sql: 7, machineLearning: 8, deepLearning: 7, genAI: 7, frontEnd: 7 } },
    { srNo: 14, fullName: "Narahari Abhinav", email: "Abhinav.Narahari031@nmims.edu.in", phone: "7981309655", gender: "Male", age: 21, cgpa: "6.2", leetcode: "Abhinav_54", leetcodeSolved: 28, github: "https://github.com/NarahariAbhinav", linkedin: "https://www.linkedin.com/in/abhinav-narahari", projects: 5, skills: { python: 8, sql: 6, machineLearning: 8, deepLearning: 7, genAI: 8, frontEnd: 9 } },
    { srNo: 15, fullName: "Md Sohail", email: "sohail.mohammed032@nmims.edu.in", phone: "7981813039", gender: "Male", age: 22, cgpa: "7.88", leetcode: "sohail262", leetcodeSolved: 35, github: "https://www.github.com/sohail262", linkedin: "https://www.linkedin.com/in/mdsohail032", projects: 4, skills: { python: 8, sql: 6, machineLearning: 7, deepLearning: 7, genAI: 9, frontEnd: 9 } },
    { srNo: 16, fullName: "Malde Saicharan", email: "saicharan.m033@nmims.edu.in", phone: "6304856382", gender: "Male", age: 21, cgpa: "8.075", leetcode: "saicharanmalde", leetcodeSolved: 180, github: "https://github.com/saicharan0623", linkedin: "http://www.linkedin.com/in/maldesaicharan", projects: 7, skills: { python: 8, sql: 8, machineLearning: 7, deepLearning: 7, genAI: 9, frontEnd: 10 } },
    { srNo: 17, fullName: "Prasad Sham Kannawar", email: "prasad.kannawar034@nmims.edu.in", phone: "8767645336", gender: "Male", age: 22, cgpa: "7.6", leetcode: "Prasad_12_", leetcodeSolved: 68, github: "https://github.com/Prasadkannawar", linkedin: "https://www.linkedin.com/in/prasad-kannawar", projects: 9, skills: { python: 8, sql: 8, machineLearning: 8, deepLearning: 8, genAI: 8, frontEnd: 10 } },
    { srNo: 18, fullName: "Venkatesh M", email: "venkatesh.m035@nmims.edu.in", phone: "9502340311", gender: "Male", age: 21, cgpa: "7.0", leetcode: "Fa5ftp4yJp", leetcodeSolved: 45, github: "https://github.com/venkatesh-mahindra/", linkedin: "https://www.linkedin.com/in/mahindra-venkatesh/", projects: 9, skills: { python: 8, sql: 8, machineLearning: 8, deepLearning: 8, genAI: 8, frontEnd: 10 } },
    { srNo: 19, fullName: "Rachit Jain", email: "rachit.jain036@nmims.edu.in", phone: "9619608809", gender: "Male", age: 21, cgpa: "8.4", leetcode: "Rachit_Jain", leetcodeSolved: 60, github: "https://github.com/Rachit-Jain-24", linkedin: "https://www.linkedin.com/in/rachitjain24/", projects: 8, skills: { python: 8, sql: 8.5, machineLearning: 9, deepLearning: 8, genAI: 8, frontEnd: 8 } },
    { srNo: 20, fullName: "Khushal Baldava", email: "khushal.baldava038@nmims.edu.in", phone: "7075022092", gender: "Male", age: 21, cgpa: "6.675", leetcode: "vdutY3xtT8", leetcodeSolved: 25, github: "https://github.com/khushal-162004", linkedin: "https://www.linkedin.com/in/khushal-baldava", projects: 4, skills: { python: 8, sql: 8, machineLearning: 8, deepLearning: 8, genAI: 8, frontEnd: 8 } },
    { srNo: 21, fullName: "Sidra Fatima", email: "sidra.fatima042@nmims.edu.in", phone: "7869250000", gender: "Female", age: 21, cgpa: "8.125", leetcode: "sidrafatimaraza", leetcodeSolved: 35, github: "https://github.com/sidrafatima0", linkedin: "https://www.linkedin.com/in/sidra-fatima-5108102a3/", projects: 4, skills: { python: 8, sql: 7, machineLearning: 8, deepLearning: 8, genAI: 8, frontEnd: 8 } },
    { srNo: 22, fullName: "Sai Vijaya Laxmi", email: "svijaya.laxmi044@nmims.edu.in", phone: "7569083319", gender: "Female", age: 20, cgpa: "6.2", leetcode: "SaiVijayaLaxmi", leetcodeSolved: 26, github: "https://github.com/Saivijayalaxmi", linkedin: "https://www.linkedin.com/in/sai-vijayalaxmi/", projects: 4, skills: { python: 8, sql: 8, machineLearning: 8, deepLearning: 7, genAI: 7, frontEnd: 8 } },
    { srNo: 23, fullName: "Vadla Vaishnavi", email: "vaishnavi.vadla045@nmims.edu.in", phone: "9908554412", gender: "Female", age: 21, cgpa: "9.5", leetcode: "vadla_vaishnavi", leetcodeSolved: 100, github: "https://github.com/VaishnaviVadla33", linkedin: "https://www.linkedin.com/in/vaishnavivadla", projects: 10, skills: { python: 8, sql: 8, machineLearning: 9, deepLearning: 8, genAI: 7, frontEnd: 6 } },
    { srNo: 24, fullName: "B Vaishnavi", email: "vaishnavi.b046@nmims.edu.in", phone: "9490205969", gender: "Female", age: 21, cgpa: "8.65", leetcode: "vaishnavibyagari", leetcodeSolved: 35, github: "https://github.com/vaishnaviByagari", linkedin: "https://www.linkedin.com/in/vaishnavibyagari/", projects: 4, skills: { python: 8, sql: 8, machineLearning: 8, deepLearning: 8, genAI: 6, frontEnd: 6 } },
    { srNo: 25, fullName: "G. Sainath Goud", email: "sainath.goud047@nmims.edu.in", phone: "6304342760", gender: "Male", age: 22, cgpa: "7.0", leetcode: "sainathgoud", leetcodeSolved: 0, github: "https://github.com/SAINATH0224", linkedin: "https://www.linkedin.com/in/sainathgoudgoda/", projects: 6, skills: { python: 8, sql: 8, machineLearning: 7, deepLearning: 7, genAI: 6, frontEnd: 8 } },
    { srNo: 26, fullName: "Kurumidde John Austin", email: "john.austin049@nmims.edu.in", phone: "8096448937", gender: "Male", age: 20, cgpa: "5.7", leetcode: "johnaustin", leetcodeSolved: 0, github: "https://github.com/JohnAustin18", linkedin: "https://www.linkedin.com/in/john-austin-kurumidde", projects: 3, skills: { python: 8, sql: 7, machineLearning: 7, deepLearning: 6, genAI: 6, frontEnd: 9 } },
    { srNo: 27, fullName: "Chetan H", email: "chetan.h050@nmims.edu.in", phone: "8317529342", gender: "Male", age: 21, cgpa: "7.0", leetcode: "chetangoud", leetcodeSolved: 0, github: "https://github.com/Chetangoud24", linkedin: "https://www.linkedin.com/in/h-chetan-goud-550278283/", projects: 5, skills: { python: 8, sql: 8, machineLearning: 7, deepLearning: 6, genAI: 8, frontEnd: 8 } },
    { srNo: 28, fullName: "Ananya P", email: "Ananya.reddy052@nmims.edu.in", phone: "9502553373", gender: "Female", age: 21, cgpa: "7.75", leetcode: "RP5WDc6D3y", leetcodeSolved: 75, github: "https://github.com/Ananya-Peddamgari/Ananya-Peddamgari", linkedin: "https://www.linkedin.com/in/ananya-peddamgari-a6311026a", projects: 7, skills: { python: 8, sql: 8, machineLearning: 8, deepLearning: 6, genAI: 8, frontEnd: 10 } },
    { srNo: 29, fullName: "M Sowmya", email: "sowmya.makam053@nmims.edu.in", phone: "7337270506", gender: "Female", age: 20, cgpa: "8.7", leetcode: "sowmyamakam", leetcodeSolved: 100, github: "https://github.com/Sowmyamaakam", linkedin: "https://www.linkedin.com/in/sowmya-makam/", projects: 6, skills: { python: 7, sql: 8, machineLearning: 8, deepLearning: 8, genAI: 8, frontEnd: 7 } },
    { srNo: 30, fullName: "G Pragnya Reddy", email: "pragnya.reddy054@nmims.edu.in", phone: "9100431881", gender: "Female", age: 21, cgpa: "8.25", leetcode: "pragnyareddy054", leetcodeSolved: 48, github: "https://github.com/pragnyareddy00", linkedin: "https://www.linkedin.com/in/pragnyareddygudyagopu/", projects: 7, skills: { python: 8, sql: 9, machineLearning: 7, deepLearning: 7, genAI: 7, frontEnd: 10 } },
    { srNo: 31, fullName: "V Abhiram Reddy", email: "VAbhiram.reddy055@nmims.edu.in", phone: "7780720178", gender: "Male", age: 21, cgpa: "6.2", leetcode: "abhiramreddy", leetcodeSolved: 0, github: "https://github.com/Abhiramreddyvundhyala", linkedin: "https://www.linkedin.com/in/abhiramreddyvundhyala/", projects: 6, skills: { python: 8, sql: 9, machineLearning: 8, deepLearning: 7, genAI: 8, frontEnd: 10 } },
    { srNo: 32, fullName: "Rudramoni Ananth Yadav", email: "yadavr.ananth056@nmims.edu.in", phone: "9705431557", gender: "Male", age: 20, cgpa: "7.525", leetcode: "RUDRAMONI-ANANTH-YADAV", leetcodeSolved: 85, github: "https://github.com/RudramoniAnanth/", linkedin: "https://www.linkedin.com/in/rudramoni-ananth-yadav/", projects: 9, skills: { python: 8, sql: 7, machineLearning: 7, deepLearning: 6, genAI: 5, frontEnd: 5 } }
];

export async function seedRemaining20Students() {
    const results = {
        success: [] as string[],
        failed: [] as { email: string; error: string }[],
        total: remaining20Students.length
    };

    console.log(`\n🌱 Starting to seed ${remaining20Students.length} remaining students...\n`);

    for (const student of remaining20Students) {
        try {
            const sapId = generateSapId(student.srNo);
            const rollNo = generateRollNo(student.srNo);
            let userId = '';

            // Try to create Firebase Auth account
            try {
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    student.email,
                    DEFAULT_PASSWORD
                );
                userId = userCredential.user.uid;
                console.log(`✓ Created Auth for ${student.fullName}`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (authError: any) {
                if (authError.code === 'auth/email-already-in-use') {
                    userId = sapId;
                    console.log(`⚠ Auth exists for ${student.email}, updating Firestore only`);
                } else {
                    throw authError;
                }
            }

            // Create Firestore profile with COMPLETE data
            const userProfile = {
                id: userId,
                sapId: sapId,
                rollNo: rollNo,
                name: student.fullName,
                email: student.email,
                phone: student.phone,
                role: 'student',
                branch: 'B.Tech CSE (Data Science)',
                currentYear: 4,
                batch: '2022-2026',
                cgpa: student.cgpa,
                profileCompleted: true,
                careerDiscoveryCompleted: true,
                assessmentCompleted: true,
                careerTrack: 'Data Scientist',
                careerTrackEmoji: '📊',
                placementStatus: 'Actively Preparing',
                
                // PROPERLY FORMATTED DATA
                techSkills: extractTechSkills(student.skills),
                interests: ['Data Science', 'Machine Learning', 'AI'],
                projects: generateProjects(student),
                certifications: [], // Will be added by fix tool if needed
                internships: [], // Will be added by fix tool if needed
                achievements: [], // Will be added by fix tool if needed
                
                leetcode: student.leetcode,
                leetcodeStats: student.leetcodeSolved > 0 ? {
                    totalSolved: student.leetcodeSolved,
                    easySolved: Math.floor(student.leetcodeSolved * 0.4),
                    mediumSolved: Math.floor(student.leetcodeSolved * 0.4),
                    hardSolved: Math.floor(student.leetcodeSolved * 0.2),
                    ranking: 0,
                    acceptanceRate: 0
                } : null,
                
                githubUrl: student.github,
                linkedinUrl: student.linkedin,
                bio: `Final year B.Tech CSE (Data Science) student at NMIMS Hyderabad. Passionate about Data Science and Machine Learning.`,
                location: 'Hyderabad, Telangana',
                resumeUrl: '',
                resumeName: '',
                assessmentResults: {
                    personality: 'Analytical',
                    strengths: ['Problem Solving', 'Technical Skills'],
                    interests: ['Data Science', 'Machine Learning'],
                    recommendedRoles: ['Data Scientist', 'ML Engineer'],
                    cgpa: student.cgpa,
                    swoc: {
                        strengths: ['Strong technical foundation'],
                        weaknesses: ['Need more industry exposure'],
                        opportunities: ['Growing AI/ML industry'],
                        challenges: ['Competitive job market']
                    }
                },
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            await setDoc(doc(db, 'users', sapId), userProfile);
            results.success.push(student.email);
            console.log(`✓ Seeded ${student.fullName} (${sapId})`);

        } catch (error: any) {
            console.error(`✗ Failed ${student.fullName}:`, error.message);
            results.failed.push({ email: student.email, error: error.message });
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 SEEDING SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successfully seeded: ${results.success.length}/${results.total}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log('='.repeat(70) + '\n');

    if (results.failed.length > 0) {
        console.log('❌ Failed students:');
        results.failed.forEach(({ email, error }) => console.log(`   - ${email}: ${error}`));
    }

    return results;
}
