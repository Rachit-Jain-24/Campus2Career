import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

const BRANCHES = [
    'B.Tech CSDS',
    'B.Tech CSE (Cyber Security)',
    'B.Tech CSE (AI & ML)',
    'B.Tech CSBS',
    'MBA Tech (CSE)'
];

const YEARS = [1, 2, 3, 4];
const STUDENTS_PER_COMBO = 4;

const NAMES = [
    'Rahul Sharma', 'Anjali Gupta', 'Vikram Singh', 'Priya Patel',
    'Arjun Mehta', 'Sneha Reddy', 'Karan Verma', 'Ishita Iyer',
    'Aditya Kulkarni', 'Sanya Malhotra', 'Rohan Das', 'Megha Rao',
    'Aryan Joshi', 'Tanya Bansal', 'Yash Mittal', 'Riya Kapoor',
    'Siddharth Nair', 'Kavya Pillai', 'Nikhil Waghmare', 'Avni Deshmukh',
    'Pranav Saxena', 'Zoya Khan', 'Sameer Deshpande', 'Mansi Tawde',
    'Varun Gadgil', 'Shreya Pande', 'Abhishek Gore', 'Esha Deol',
    'Harsh Shah', 'Khushi Agarwal', 'Rajiv Tyagi', 'Sapna Bhavnani',
    'Gaurav Chopra', 'Bhavna Pandey', 'Manish Goel', 'Divya Jain',
    'Aman Bhatt', 'Kriti Sanon', 'Sahil Khanna', 'Nora Fatehi',
    'Dhruv Rathee', 'Pooja Hegde', 'Armaan Malik', 'Shraddha Arya',
    'Raghav Juyal', 'Drashti Dhami', 'Rishabh Pant', 'Isha Talwar',
    'Virat Kohli', 'Anushka Sharma', 'Rohit Sharma', 'Ritika Sajdeh',
    'Hardik Pandya', 'Natasa Stankovic', 'KL Rahul', 'Athiya Shetty',
    'Shubman Gill', 'Sara Tendulkar', 'Suryakumar Yadav', 'Devisha Shetty',
    'Shreyas Iyer', 'Deepak Chahar', 'Jaya Chahar', 'Ishan Kishan'
];

export async function seedMockStudents() {
    console.log('🚀 Starting to seed varied mock students across branches and years...');
    let totalSeeded = 0;
    let nameIdx = 0;

    for (const branch of BRANCHES) {
        for (const year of YEARS) {
            if (branch === 'B.Tech CSDS' && year === 4) continue; // Skip as the 32 real ones are seeded elsewhere
            for (let i = 0; i < STUDENTS_PER_COMBO; i++) {
                const name = NAMES[nameIdx % NAMES.length];
                const firstName = name.split(' ')[0].toLowerCase();
                const sapId = `70${branch.substring(0, 2).toUpperCase()}${year}${branch.length}${nameIdx}`.padEnd(11, '0').substring(0, 11);
                nameIdx++;

                const cgpa = (7.0 + Math.random() * 2.5).toFixed(2);
                const leetcodeSolved = year === 1 ? Math.floor(Math.random() * 20) : 
                                      year === 2 ? Math.floor(Math.random() * 50 + 20) :
                                      year === 3 ? Math.floor(Math.random() * 100 + 50) :
                                      Math.floor(Math.random() * 200 + 100);

                const techSkills = year === 1 ? ['Python', 'C++'] :
                                   year === 2 ? ['Python', 'SQL', 'Data Structures'] :
                                   ['Python', 'SQL', 'Machine Learning', 'React', 'Node.js'];

                const userProfile = {
                    id: sapId,
                    sapId: sapId,
                    name: name,
                    email: `${firstName}.${sapId}@nmims.edu.in`,
                    role: 'student',
                    branch: branch,
                    currentYear: year,
                    batch: `${2026 - (4 - year)}-${2030 - (4 - year)}`,
                    cgpa: cgpa,
                    profileCompleted: true,
                    careerDiscoveryCompleted: true,
                    assessmentCompleted: true,
                    careerTrack: branch.includes('AI') ? 'AI/ML Engineer' : branch.includes('Cyber') ? 'Security Analyst' : 'Software Engineer',
                    placementStatus: year === 4 ? 'Actively Interviewing' : 'Preparing',
                    techSkills: techSkills,
                    interests: ['Technology', 'Product Management', 'Innovation'],
                    leetcode: `${firstName}_${sapId.slice(-4)}`,
                    leetcodeStats: { totalSolved: leetcodeSolved, lastUpdated: Date.now() },
                    bio: `${year}${year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} year ${branch} student at NMIMS Hyderabad.`,
                    assessmentResults: {
                        overallScore: year === 1 ? Math.floor(40 + Math.random() * 20) :
                                      year === 2 ? Math.floor(55 + Math.random() * 15) :
                                      year === 3 ? Math.floor(70 + Math.random() * 15) :
                                      Math.floor(82 + Math.random() * 13),
                        careerTrack: branch.includes('AI') ? 'AI/ML Engineer' : 'Software Engineering',
                        cgpa: cgpa,
                        swoc: {
                            strengths: ['Consistency', 'Academic foundations'],
                            weaknesses: ['Real-world experience'],
                            opportunities: ['Campus placement', 'Summer internships'],
                            challenges: ['Market competition']
                        }
                    },
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                };

                await setDoc(doc(db, 'students', sapId), userProfile);
                totalSeeded++;
            }
        }
    }

    console.log(`✅ Successfully seeded ${totalSeeded} students across all branches and years.`);
    return totalSeeded;
}
