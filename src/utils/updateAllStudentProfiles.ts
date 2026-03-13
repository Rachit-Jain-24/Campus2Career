import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Default password for all batch students
const DEFAULT_PASSWORD = 'nmims2026';

// Complete student data from Excel
const allStudentsData = [
    {
        srNo: 1, fullName: "Kapperi Divya Sri", email: "divya.sri010@nmims.edu.in", phone: "9347220561",
        gender: "Female", age: 21, city: "Hyderabad", cgpa: "8.8",
        leetcodeUsername: "Divya_sri_Kapperi", leetcodeSolved: 28,
        githubUrl: "https://github.com/DivyaReddy0561", linkedinUrl: "https://linkedin.com/in/divya-reddy-kapperi-589bb9250",
        githubProjects: 2, skills: { python: 7, sql: 8, machineLearning: 7, deepLearning: 6, genAI: 6, frontEnd: 6 },
        certifications: ["Swayam NPTEL DBMS", "AWS Cloud Foundations", "Infosys Machine Learning"],
        internships: { hasInternship: true, count: 1, duration: "1 month", companies: ["Karvic Pvt. Ltd"] },
        hackathons: { count: 0, details: [] },
        publications: { count: 3, details: ["ICDTV 2030", "IDBA 2025", "SIMSARC 24"] },
        achievements: ["Selected for ACM Summer School sponsored by Google", "Vice President of Student Council"]
    },
    {
        srNo: 2, fullName: "Pavithra Sevakula", email: "pavithra.sevakula011@nmims.edu.in", phone: "7032254253",
        gender: "Female", age: 21, city: "Hyderabad", cgpa: "9.225",
        leetcodeUsername: "pavithrasevakula011", leetcodeSolved: 23,
        githubUrl: "https://github.com/Pavithrasevakula", linkedinUrl: "https://www.linkedin.com/in/pavithra-sevakula/",
        githubProjects: 5, skills: { python: 8, sql: 7, machineLearning: 8, deepLearning: 8, genAI: 8, frontEnd: 7 },
        certifications: ["AWS Cloud Foundations", "SQL", "Google Data Analytics"],
        internships: { hasInternship: true, count: 1, duration: "4 months", companies: ["Zenith"] },
        hackathons: { count: 2, details: ["Amazon ML Hackathon 2025", "Anaverse 2.0"] },
        publications: { count: 2, details: ["IEEE IBSSC 2023", "ICDTV2030"] },
        achievements: ["Selected twice for ACM Schools", "Published in IEEE"]
    },
    {
        srNo: 11, fullName: "Ruthvik Akula", email: "ruthwik.akula028@nmims.edu.in", phone: "9959557429",
        gender: "Male", age: 21, city: "Hyderabad", cgpa: "8.5",
        leetcodeUsername: "ruth_vik", leetcodeSolved: 20,
        githubUrl: "https://github.com/ruth0107", linkedinUrl: "https://www.linkedin.com/in/ruthvik-akula-99106021b/",
        githubProjects: 8, skills: { python: 8, sql: 8, machineLearning: 9, deepLearning: 8, genAI: 8, frontEnd: 6 },
        certifications: ["HarvardX Machine Learning and AI with Python"],
        internships: { hasInternship: true, count: 1, duration: "2 months", companies: ["Turtil-AI Startup"] },
        hackathons: { count: 2, details: ["Amazon ML Hackathon", "Webathon 2.0 Winners"] },
        publications: { count: 2, details: ["IDBA 2025", "ICMSCI-2026"] },
        achievements: ["Built Real Time AI products in Healthcare", "2nd Runner up REL Poster", "Marketing Head NMIMS Tech Fiesta"]
    }
    // Add more students here...
];

function generateSapId(srNo: number): string {
    return `705722${srNo.toString().padStart(5, '0')}`;
}

function generateRollNo(srNo: number): string {
    return `22CSDS${srNo.toString().padStart(3, '0')}`;
}
