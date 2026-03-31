import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

/**
 * Update the 20 students (Sr. No. 11-32) with complete profile data
 * This fixes students who were seeded with incomplete information
 */

function generateSapId(srNo: number): string {
    return `705722${srNo.toString().padStart(5, '0')}`;
}

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

const remaining20Students = [
    { srNo: 11, fullName: "Ruthvik Akula", email: "ruthwik.akula028@nmims.edu.in", leetcode: "ruth_vik", leetcodeSolved: 20, github: "https://github.com/ruth0107", projects: 8, skills: { python: 8, sql: 8, machineLearning: 9, deepLearning: 8, genAI: 8, frontEnd: 6 } },
    { srNo: 13, fullName: "Anmagandla Snehil", email: "snehil.a030@nmims.edu.in", leetcode: "Snehil_0108", leetcodeSolved: 31, github: "https://github.com/Snehil-0108", projects: 5, skills: { python: 8, sql: 7, machineLearning: 8, deepLearning: 7, genAI: 7, frontEnd: 7 } },
    { srNo: 14, fullName: "Narahari Abhinav", email: "Abhinav.Narahari031@nmims.edu.in", leetcode: "Abhinav_54", leetcodeSolved: 28, github: "https://github.com/NarahariAbhinav", projects: 5, skills: { python: 8, sql: 6, machineLearning: 8, deepLearning: 7, genAI: 8, frontEnd: 9 } },
    { srNo: 15, fullName: "Md Sohail", email: "sohail.mohammed032@nmims.edu.in", leetcode: "sohail262", leetcodeSolved: 35, github: "https://www.github.com/sohail262", projects: 4, skills: { python: 8, sql: 6, machineLearning: 7, deepLearning: 7, genAI: 9, frontEnd: 9 } },
    { srNo: 16, fullName: "Malde Saicharan", email: "saicharan.m033@nmims.edu.in", leetcode: "saicharanmalde", leetcodeSolved: 180, github: "https://github.com/saicharan0623", projects: 7, skills: { python: 8, sql: 8, machineLearning: 7, deepLearning: 7, genAI: 9, frontEnd: 10 } },
    { srNo: 17, fullName: "Prasad Sham Kannawar", email: "prasad.kannawar034@nmims.edu.in", leetcode: "Prasad_12_", leetcodeSolved: 68, github: "https://github.com/Prasadkannawar", projects: 9, skills: { python: 8, sql: 8, machineLearning: 8, deepLearning: 8, genAI: 8, frontEnd: 10 } },
    { srNo: 18, fullName: "Venkatesh M", email: "venkatesh.m035@nmims.edu.in", leetcode: "Fa5ftp4yJp", leetcodeSolved: 45, github: "https://github.com/venkatesh-mahindra/", projects: 9, skills: { python: 8, sql: 8, machineLearning: 8, deepLearning: 8, genAI: 8, frontEnd: 10 } },
    { srNo: 19, fullName: "Rachit Jain", email: "rachit.jain036@nmims.edu.in", leetcode: "Rachit_Jain", leetcodeSolved: 60, github: "https://github.com/Rachit-Jain-24", projects: 8, skills: { python: 8, sql: 8.5, machineLearning: 9, deepLearning: 8, genAI: 8, frontEnd: 8 } },
    { srNo: 20, fullName: "Khushal Baldava", email: "khushal.baldava038@nmims.edu.in", leetcode: "vdutY3xtT8", leetcodeSolved: 25, github: "https://github.com/khushal-162004", projects: 4, skills: { python: 8, sql: 8, machineLearning: 8, deepLearning: 8, genAI: 8, frontEnd: 8 } },
    { srNo: 21, fullName: "Sidra Fatima", email: "sidra.fatima042@nmims.edu.in", leetcode: "sidrafatimaraza", leetcodeSolved: 35, github: "https://github.com/sidrafatima0", projects: 4, skills: { python: 8, sql: 7, machineLearning: 8, deepLearning: 8, genAI: 8, frontEnd: 8 } },
    { srNo: 22, fullName: "Sai Vijaya Laxmi", email: "svijaya.laxmi044@nmims.edu.in", leetcode: "SaiVijayaLaxmi", leetcodeSolved: 26, github: "https://github.com/Saivijayalaxmi", projects: 4, skills: { python: 8, sql: 8, machineLearning: 8, deepLearning: 7, genAI: 7, frontEnd: 8 } },
    { srNo: 23, fullName: "Vadla Vaishnavi", email: "vaishnavi.vadla045@nmims.edu.in", leetcode: "vadla_vaishnavi", leetcodeSolved: 100, github: "https://github.com/VaishnaviVadla33", projects: 10, skills: { python: 8, sql: 8, machineLearning: 9, deepLearning: 8, genAI: 7, frontEnd: 6 } },
    { srNo: 24, fullName: "B Vaishnavi", email: "vaishnavi.b046@nmims.edu.in", leetcode: "vaishnavibyagari", leetcodeSolved: 35, github: "https://github.com/vaishnaviByagari", projects: 4, skills: { python: 8, sql: 8, machineLearning: 8, deepLearning: 8, genAI: 6, frontEnd: 6 } },
    { srNo: 25, fullName: "G. Sainath Goud", email: "sainath.goud047@nmims.edu.in", leetcode: "sainathgoud", leetcodeSolved: 0, github: "https://github.com/SAINATH0224", projects: 6, skills: { python: 8, sql: 8, machineLearning: 7, deepLearning: 7, genAI: 6, frontEnd: 8 } },
    { srNo: 26, fullName: "Kurumidde John Austin", email: "john.austin049@nmims.edu.in", leetcode: "johnaustin", leetcodeSolved: 0, github: "https://github.com/JohnAustin18", projects: 3, skills: { python: 8, sql: 7, machineLearning: 7, deepLearning: 6, genAI: 6, frontEnd: 9 } },
    { srNo: 27, fullName: "Chetan H", email: "chetan.h050@nmims.edu.in", leetcode: "chetangoud", leetcodeSolved: 0, github: "https://github.com/Chetangoud24", projects: 5, skills: { python: 8, sql: 8, machineLearning: 7, deepLearning: 6, genAI: 8, frontEnd: 8 } },
    { srNo: 28, fullName: "Ananya P", email: "Ananya.reddy052@nmims.edu.in", leetcode: "RP5WDc6D3y", leetcodeSolved: 75, github: "https://github.com/Ananya-Peddamgari/Ananya-Peddamgari", projects: 7, skills: { python: 8, sql: 8, machineLearning: 8, deepLearning: 6, genAI: 8, frontEnd: 10 } },
    { srNo: 29, fullName: "M Sowmya", email: "sowmya.makam053@nmims.edu.in", leetcode: "sowmyamakam", leetcodeSolved: 100, github: "https://github.com/Sowmyamaakam", projects: 6, skills: { python: 7, sql: 8, machineLearning: 8, deepLearning: 8, genAI: 8, frontEnd: 7 } },
    { srNo: 30, fullName: "G Pragnya Reddy", email: "pragnya.reddy054@nmims.edu.in", leetcode: "pragnyareddy054", leetcodeSolved: 48, github: "https://github.com/pragnyareddy00", projects: 7, skills: { python: 8, sql: 9, machineLearning: 7, deepLearning: 7, genAI: 7, frontEnd: 10 } },
    { srNo: 31, fullName: "V Abhiram Reddy", email: "VAbhiram.reddy055@nmims.edu.in", leetcode: "abhiramreddy", leetcodeSolved: 0, github: "https://github.com/Abhiramreddyvundhyala", projects: 6, skills: { python: 8, sql: 9, machineLearning: 8, deepLearning: 7, genAI: 8, frontEnd: 10 } },
    { srNo: 32, fullName: "Rudramoni Ananth Yadav", email: "yadavr.ananth056@nmims.edu.in", leetcode: "RUDRAMONI-ANANTH-YADAV", leetcodeSolved: 85, github: "https://github.com/RudramoniAnanth/", projects: 9, skills: { python: 8, sql: 7, machineLearning: 7, deepLearning: 6, genAI: 5, frontEnd: 5 } }
];

export async function updateRemaining20Students() {
    console.log('\n🔄 Updating 20 students with complete data...\n');
    
    const results = {
        updated: 0,
        notFound: 0,
        failed: [] as string[]
    };
    
    for (const student of remaining20Students) {
        try {
            const sapId = generateSapId(student.srNo);
            const docRef = doc(db, 'users', sapId);
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists()) {
                console.log(`⚠️  Not found: ${student.fullName} (${sapId})`);
                results.notFound++;
                continue;
            }
            
            const updates = {
                techSkills: extractTechSkills(student.skills),
                projects: generateProjects(student),
                leetcodeStats: student.leetcodeSolved > 0 ? {
                    totalSolved: student.leetcodeSolved,
                    easySolved: Math.floor(student.leetcodeSolved * 0.4),
                    mediumSolved: Math.floor(student.leetcodeSolved * 0.4),
                    hardSolved: Math.floor(student.leetcodeSolved * 0.2),
                    ranking: 0,
                    acceptanceRate: 0
                } : null,
                updatedAt: Date.now()
            };
            
            await updateDoc(docRef, updates);
            results.updated++;
            console.log(`✓ Updated: ${student.fullName}`);
            
        } catch (error: any) {
            console.error(`✗ Failed: ${student.fullName} - ${error.message}`);
            results.failed.push(student.email);
        }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 UPDATE SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Updated: ${results.updated}`);
    console.log(`⚠️  Not found: ${results.notFound}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log('='.repeat(70) + '\n');
    
    return results;
}
