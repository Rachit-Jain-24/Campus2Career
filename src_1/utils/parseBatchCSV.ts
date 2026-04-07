// Parser for Sutherland CSV to extract student data

export interface ParsedStudent {
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
    techSkills: string[];
    projects: any[];
}

// Manually parsed data from CSV (32 students)
export const parsedBatchData: ParsedStudent[] = [
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
        achievements: ["Selected for ACM Summer School sponsored by Google", "Vice President of Student Council"],
        techSkills: ["Python", "SQL", "Machine Learning", "DBMS", "AWS"],
        projects: [
            { id: 1, title: "ML Classification Project", tech: "Python, Scikit-learn", description: "Machine learning classification model", link: "", year: "2024" },
            { id: 2, title: "Database Management System", tech: "SQL, PostgreSQL", description: "DBMS project for academic purposes", link: "", year: "2024" }
        ]
    },
];
