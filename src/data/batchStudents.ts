// Real batch data from NMIMS CSE (DS) 2022-2026
// Parsed from Sutherland Data Scientist Role CSV

export interface BatchStudent {
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

export const batchStudents: BatchStudent[] = [
    {
        srNo: 1,
        fullName: "Kapperi Divya Sri",
        email: "divya.sri010@nmims.edu.in",
        phone: "9347220561",
        gender: "Female",
        age: 21,
        city: "Hyderabad",
        cgpa: "8.8",
        leetcodeUsername: "Divya_sri_Kapperi",
        leetcodeSolved: 28,
        githubUrl: "https://github.com/DivyaReddy0561",
        linkedinUrl: "linkedin.com/in/divya-reddy-kapperi-589bb9250",
        githubProjects: 2,
        skills: { python: 7, sql: 8, machineLearning: 7, deepLearning: 6, genAI: 6, frontEnd: 6 },
        certifications: ["Swayam NPTEL DBMS", "AWS Cloud Foundations", "Infosys Machine Learning"],
        internships: { hasInternship: true, count: 1, duration: "1 month", companies: ["Karvic Pvt. Ltd"] },
        hackathons: { count: 0, details: [] },
        publications: { count: 3, details: ["ICDTV 2030", "IDBA 2025", "SIMSARC 24"] },
        achievements: ["Selected for ACM Summer School sponsored by Google", "Vice President of Student Council"]
    },
    {
        srNo: 2,
        fullName: "Pavithra Sevakula",
        email: "pavithra.sevakula011@nmims.edu.in",
        phone: "7032254253",
        gender: "Female",
        age: 21,
        city: "Hyderabad",
        cgpa: "9.225",
        leetcodeUsername: "pavithrasevakula011",
        leetcodeSolved: 23,
        githubUrl: "https://github.com/Pavithrasevakula",
        linkedinUrl: "https://www.linkedin.com/in/pavithra-sevakula/",
        githubProjects: 5,
        skills: { python: 8, sql: 7, machineLearning: 8, deepLearning: 8, genAI: 8, frontEnd: 7 },
        certifications: ["AWS Cloud Foundations", "SQL", "Google Data Analytics"],
        internships: { hasInternship: true, count: 1, duration: "4 months", companies: ["Zenith"] },
        hackathons: { count: 2, details: ["Amazon ML Hackathon 2025", "Anaverse 2.0 (top 10%)"] },
        publications: { count: 2, details: ["IEEE IBSSC 2023", "ICDTV2030"] },
        achievements: ["Selected twice for ACM Schools", "Published in IEEE"]
    },
];
