// Complete batch data for all 30+ students from NMIMS CSE (DS) 2022-2026
// Parsed from Sutherland Data Scientist Role CSV

export interface BatchStudentData {
    srNo: number;
    fullName: string;
    email: string;
    phone: string;
    gender: string;
    age: number;
    city: string;
    cgpa: string;
    leetcodeUsername: string;
    leetcodeSolved: number;
    githubUrl: string;
    linkedinUrl: string;
    githubProjects: number;
    skills: {
        python: number;
        sql: number;
        machineLearning: number;
        deepLearning: number;
        genAI: number;
        frontEnd: number;
    };
    certifications: string[];
    internships: {
        hasInternship: boolean;
        count: number;
        duration: string;
        companies: string[];
    };
    hackathons: {
        count: number;
        details: string[];
    };
    publications: {
        count: number;
        details: string[];
    };
    achievements: string[];
}

export const completeBatchStudentsData: BatchStudentData[] = [
    // Students 1-10 (already seeded)
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
    }
];

// Students 11-32 (need to be seeded)
export const newBatchStudentsData: BatchStudentData[] = [
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
    },
    {
        srNo: 13, fullName: "Anmagandla Snehil", email: "snehil.a030@nmims.edu.in", phone: "9502605942",
        gender: "Male", age: 21, city: "Hyderabad", cgpa: "7.8",
        leetcodeUsername: "Snehil_0108", leetcodeSolved: 31,
        githubUrl: "https://github.com/Snehil-0108", linkedinUrl: "https://www.linkedin.com/in/anmagandla-snehil0108",
        githubProjects: 5, skills: { python: 8, sql: 7, machineLearning: 8, deepLearning: 7, genAI: 7, frontEnd: 7 },
        certifications: [],
        internships: { hasInternship: false, count: 0, duration: "0", companies: [] },
        hackathons: { count: 2, details: ["IBM Z DATATHON", "CodeIT Webathon 2024 Runner Up"] },
        publications: { count: 1, details: ["IEEE ICEI 2025"] },
        achievements: ["2nd Position CodeIT AI4Health", "3rd Position CSI Project Expo", "ACM Summer School IoT 2025"]
    }
];
