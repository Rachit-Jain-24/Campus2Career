/**
 * Longitudinal 4-Year Semester-Wise Roadmap Generator
 * Creates a comprehensive journey from Semester 1 to Semester 8
 * with role-specific milestones and academic alignment
 */

export interface SemesterPlan {
    semester: number;
    year: number;
    title: string;
    focus: string;
    academicSubjects: string[];
    technicalGoals: string[];
    projects: string[];
    certifications: string[];
    leetcodeTarget: number;
    internshipGoal: string;
    milestones: string[];
    skillsToAcquire: string[];
    interviewPrep: string[];
    status: 'completed' | 'current' | 'upcoming';
}

export interface LongitudinalRoadmap {
    targetRole: string;
    currentSemester: number;
    overallProgress: number;
    semesters: SemesterPlan[];
    criticalPath: string[];
    estimatedPlacementReady: string;
}

// NMIMS CSE (DS) Curriculum Structure
const nmimsCurriculum: Record<number, string[]> = {
    1: ["Programming in C", "Engineering Mathematics I", "Physics", "Engineering Graphics", "Communication Skills"],
    2: ["Object Oriented Programming", "Engineering Mathematics II", "Digital Logic Design", "Data Structures", "Environmental Science"],
    3: ["Algorithms", "Database Management Systems", "Computer Organization", "Discrete Mathematics", "Probability & Statistics"],
    4: ["Operating Systems", "Computer Networks", "Web Programming", "Software Engineering", "Linear Algebra"],
    5: ["Machine Learning", "Cloud Computing", "Mobile App Development", "Data Mining", "Business Communication"],
    6: ["Deep Learning", "Big Data Analytics", "DevOps", "Information Security", "Project Management"],
    7: ["Capstone Project Phase 1", "Elective I", "Elective II", "Industry Internship", "Professional Ethics"],
    8: ["Capstone Project Phase 2", "Elective III", "Elective IV", "Comprehensive Viva", "Placement Preparation"]
};

// Role-specific semester-wise skill progression
const roleSkillProgression: Record<string, Record<number, string[]>> = {
    "Full-Stack Developer": {
        1: ["HTML/CSS Basics", "JavaScript Fundamentals", "Git & GitHub"],
        2: ["DOM Manipulation", "Async Programming", "Basic API Calls"],
        3: ["React/Vue Basics", "Node.js Fundamentals", "Express.js"],
        4: ["Database Design", "REST API Development", "Authentication"],
        5: ["Advanced React", "State Management", "TypeScript"],
        6: ["Microservices", "Docker Basics", "CI/CD"],
        7: ["System Design", "Performance Optimization", "Testing"],
        8: ["Production Deployment", "Monitoring", "Scalability"]
    },
    "Data Scientist": {
        1: ["Python Basics", "NumPy & Pandas", "Data Visualization"],
        2: ["Statistical Analysis", "Data Cleaning", "EDA Techniques"],
        3: ["Machine Learning Basics", "Scikit-learn", "Feature Engineering"],
        4: ["Supervised Learning", "Model Evaluation", "Ensemble Methods"],
        5: ["Deep Learning", "TensorFlow/PyTorch", "Neural Networks"],
        6: ["NLP", "Computer Vision", "MLOps"],
        7: ["Big Data Tools", "Spark", "Production ML"],
        8: ["Advanced ML", "Research Methods", "A/B Testing"]
    },
    "Backend Engineer": {
        1: ["Programming Fundamentals", "Linux Basics", "Version Control"],
        2: ["OOP Concepts", "Data Structures", "Algorithm Basics"],
        3: ["Database Fundamentals", "SQL Mastery", "Indexing"],
        4: ["API Design", "Server Architecture", "Caching"],
        5: ["Microservices", "Message Queues", "Distributed Systems"],
        6: ["Kubernetes", "Service Mesh", "Observability"],
        7: ["System Design", "Load Balancing", "Database Scaling"],
        8: ["High Availability", "Disaster Recovery", "Security"]
    },
    "AI/ML Engineer": {
        1: ["Python Programming", "Linear Algebra", "Calculus"],
        2: ["Probability Theory", "Data Structures", "Algorithms"],
        3: ["ML Fundamentals", "Supervised Learning", "Unsupervised Learning"],
        4: ["Deep Learning", "CNNs", "RNNs"],
        5: ["Transformers", "BERT/GPT", "Transfer Learning"],
        6: ["Reinforcement Learning", "GANs", "AutoML"],
        7: ["MLOps", "Model Serving", "Optimization"],
        8: ["Research", "Paper Implementation", "Production AI"]
    },
    "Frontend Developer": {
        1: ["HTML5 & CSS3", "Responsive Design", "JavaScript ES6+"],
        2: ["DOM API", "Event Handling", "Async/Await"],
        3: ["React Fundamentals", "Hooks", "Component Design"],
        4: ["State Management", "React Router", "Styled Components"],
        5: ["Next.js", "SSR/SSG", "Performance"],
        6: ["Testing", "Storybook", "Design Systems"],
        7: ["Advanced Patterns", "Micro-frontends", "WebAssembly"],
        8: ["PWA", "Web Performance", "Accessibility"]
    },
    "DevOps Engineer": {
        1: ["Linux Administration", "Shell Scripting", "Networking"],
        2: ["Version Control", "CI/CD Basics", "Cloud Fundamentals"],
        3: ["Docker", "Containerization", "Image Optimization"],
        4: ["Kubernetes", "Orchestration", "Helm"],
        5: ["Infrastructure as Code", "Terraform", "Ansible"],
        6: ["Monitoring", "Prometheus", "Grafana"],
        7: ["Cloud Native", "Service Mesh", "GitOps"],
        8: ["SRE Practices", "Chaos Engineering", "Security"]
    }
};

// Role-specific projects by semester
const roleProjects: Record<string, Record<number, string[]>> = {
    "Full-Stack Developer": {
        1: ["Personal Portfolio Website", "Calculator App", "Todo List"],
        2: ["Weather Dashboard", "Movie Search App", "Quiz Application"],
        3: ["E-commerce Frontend", "Blog Platform", "Chat Application"],
        4: ["Full-Stack Blog", "Task Manager", "Social Media Dashboard"],
        5: ["SaaS Application", "Real-time Analytics", "Video Streaming"],
        6: ["Microservices App", "Containerized Deployment", "CI/CD Pipeline"],
        7: ["Enterprise Application", "Scalable System", "Performance Optimized"],
        8: ["Production-Grade Platform", "Open Source Contribution"]
    },
    "Data Scientist": {
        1: ["Data Analysis Report", "Visualization Dashboard", "Statistics Project"],
        2: ["EDA on Real Dataset", "Data Cleaning Pipeline", "Insights Report"],
        3: ["Predictive Model", "Classification Project", "Regression Analysis"],
        4: ["Kaggle Competition", "End-to-End ML Pipeline", "Feature Engineering"],
        5: ["Deep Learning Model", "Image Classification", "NLP Project"],
        6: ["Recommendation System", "Time Series Forecasting", "MLOps Pipeline"],
        7: ["Production ML System", "Research Paper Implementation"],
        8: ["Capstone Research Project", "Industry Solution"]
    },
    "Backend Engineer": {
        1: ["CLI Tools", "File System Operations", "Basic APIs"],
        2: ["Data Structure Implementations", "Algorithm Visualizer"],
        3: ["Database Design", "SQL Query Optimizer", "CRUD API"],
        4: ["Authentication System", "Rate Limiter", "Caching Layer"],
        5: ["Microservices Architecture", "Message Queue System"],
        6: ["Distributed System", "Load Balancer", "Service Discovery"],
        7: ["Scalable Backend", "High-Throughput System"],
        8: ["Production System Design", "Performance Benchmarking"]
    },
    "AI/ML Engineer": {
        1: ["Python ML Basics", "Data Preprocessing", "Simple Models"],
        2: ["ML Algorithms from Scratch", "Model Comparison"],
        3: ["Ensemble Methods", "Hyperparameter Tuning", "ML Pipeline"],
        4: ["Neural Network from Scratch", "CNN for Images"],
        5: ["Transformer Model", "NLP Application", "BERT Fine-tuning"],
        6: ["GAN Implementation", "Reinforcement Learning Agent"],
        7: ["Production AI System", "Model Optimization"],
        8: ["Research Publication", "Novel Architecture"]
    },
    "Frontend Developer": {
        1: ["Responsive Landing Page", "CSS Animations", "Form Validation"],
        2: ["Interactive Dashboard", "Data Visualization", "API Integration"],
        3: ["React SPA", "Custom Hooks Library", "Component Library"],
        4: ["E-commerce Frontend", "Real-time Updates", "PWA"],
        5: ["Next.js Application", "SSR Implementation", "Performance"],
        6: ["Design System", "Testing Suite", "Documentation"],
        7: ["Micro-frontend Architecture", "Module Federation"],
        8: ["Enterprise UI Platform", "Open Source Library"]
    },
    "DevOps Engineer": {
        1: ["Shell Automation Scripts", "System Monitoring"],
        2: ["Git Workflows", "Basic CI/CD", "Cloud VM Setup"],
        3: ["Docker Containers", "Multi-stage Builds", "Registry"],
        4: ["Kubernetes Cluster", "Pod Management", "Services"],
        5: ["Infrastructure as Code", "Automated Provisioning"],
        6: ["Monitoring Stack", "Logging Pipeline", "Alerting"],
        7: ["GitOps Workflow", "Service Mesh", "Security"],
        8: ["SRE Implementation", "Chaos Engineering"]
    }
};

// LeetCode targets by semester
const leetcodeTargets: Record<number, number> = {
    1: 25,   // Foundation
    2: 75,   // DSA Basics
    3: 150,  // Algorithms
    4: 225,  // Advanced DSA
    5: 300,  // Interview Prep
    6: 350,  // System Design
    7: 400,  // Company-specific
    8: 450   // Final polish
};

// Certifications by semester
const semesterCertifications: Record<string, Record<number, string[]>> = {
    "Full-Stack Developer": {
        3: ["freeCodeCamp JavaScript"],
        4: ["MongoDB University M001"],
        5: ["Meta Front-End Developer"],
        6: ["AWS Cloud Practitioner"],
        7: ["Docker Certified Associate"],
        8: ["AWS Developer Associate"]
    },
    "Data Scientist": {
        3: ["Google Data Analytics"],
        4: ["IBM Data Science Professional"],
        5: ["TensorFlow Developer Certificate"],
        6: ["AWS Machine Learning Specialty"],
        7: ["Databricks Data Engineer"],
        8: ["Google Professional Data Engineer"]
    },
    "Backend Engineer": {
        3: ["Oracle Java SE"],
        4: ["MongoDB Certified Developer"],
        5: ["AWS Solutions Architect Associate"],
        6: ["Kubernetes Application Developer"],
        7: ["Redis Certified Developer"],
        8: ["AWS DevOps Engineer Professional"]
    },
    "AI/ML Engineer": {
        3: ["Stanford Machine Learning"],
        4: ["Deep Learning Specialization"],
        5: ["TensorFlow Developer Certificate"],
        6: ["AWS Machine Learning Specialty"],
        7: ["MLOps Specialization"],
        8: ["Google Cloud Professional ML Engineer"]
    },
    "Frontend Developer": {
        3: ["Meta Front-End Developer"],
        4: ["Google UX Design"],
        5: ["React Developer Certification"],
        6: [ "Web Accessibility Specialist"],
        7: ["AWS Cloud Practitioner"],
        8: ["Google Mobile Web Specialist"]
    },
    "DevOps Engineer": {
        3: ["AWS Cloud Practitioner"],
        4: ["Docker Certified Associate"],
        5: ["Kubernetes Administrator"],
        6: ["AWS Solutions Architect"],
        7: ["HashiCorp Terraform Associate"],
        8: ["AWS DevOps Engineer Professional"]
    }
};

// Interview prep milestones by semester
const interviewPrep: Record<number, string[]> = {
    1: ["Understand industry landscape", "Build online presence"],
    2: ["Attend career workshops", "Connect with seniors"],
    3: ["Start mock interviews", "Practice behavioral questions"],
    4: ["Technical mock interviews", "Company research"],
    5: ["Coding interview patterns", "System design basics"],
    6: ["Full mock interviews", "Resume optimization"],
    7: ["Company-specific prep", "Salary negotiation"],
    8: ["Final interview polish", "Placement drives"]
};

// Internship goals by semester
const internshipGoals: Record<number, string> = {
    1: "Explore tech domains through personal projects",
    2: "Apply for summer internships (optional)",
    3: "Secure first internship in target domain",
    4: "Complete internship + apply for next",
    5: "Quality internship with real projects",
    6: "Pre-placement internship (PPO target)",
    7: "Full-time offer conversion / placement",
    8: "Finalize placement / start job"
};

export function generateLongitudinalRoadmap(
    targetRole: string,
    currentSemester: number,
    userLeetcode: number,
    userProjects: number,
    completedSkills: string[]
): LongitudinalRoadmap {
    
    const skills = roleSkillProgression[targetRole] || roleSkillProgression["Full-Stack Developer"];
    const projects = roleProjects[targetRole] || roleProjects["Full-Stack Developer"];
    const certs = semesterCertifications[targetRole] || semesterCertifications["Full-Stack Developer"];
    
    const semesters: SemesterPlan[] = [];
    
    for (let sem = 1; sem <= 8; sem++) {
        const year = Math.ceil(sem / 2);
        
        // Determine status
        let status: 'completed' | 'current' | 'upcoming';
        if (sem < currentSemester) status = 'completed';
        else if (sem === currentSemester) status = 'current';
        else status = 'upcoming';
        
        // Generate milestones for this semester
        const milestones: string[] = [];
        
        // Academic milestone
        milestones.push(`Complete ${nmimsCurriculum[sem].length} courses with 8.0+ CGPA`);
        
        // LeetCode milestone
        if (sem <= currentSemester && userLeetcode >= leetcodeTargets[sem]) {
            milestones.push(`Achieved ${leetcodeTargets[sem]} LeetCode problems ✓`);
        } else {
            milestones.push(`Reach ${leetcodeTargets[sem]} LeetCode problems`);
        }
        
        // Project milestone
        const semProjects = projects[sem] || [];
        if (semProjects.length > 0) {
            milestones.push(`Build ${semProjects.length} project${semProjects.length > 1 ? 's' : ''}: ${semProjects[0]}`);
        }
        
        // Certification milestone
        if (certs[sem] && certs[sem].length > 0) {
            milestones.push(`Earn: ${certs[sem][0]}`);
        }
        
        // Interview prep milestone
        if (interviewPrep[sem]) {
            milestones.push(...interviewPrep[sem].slice(0, 1));
        }
        
        semesters.push({
            semester: sem,
            year,
            title: getSemesterTitle(sem, targetRole),
            focus: getSemesterFocus(sem, targetRole),
            academicSubjects: nmimsCurriculum[sem],
            technicalGoals: skills[sem] || [],
            projects: projects[sem] || [],
            certifications: certs[sem] || [],
            leetcodeTarget: leetcodeTargets[sem],
            internshipGoal: internshipGoals[sem],
            milestones,
            skillsToAcquire: skills[sem] || [],
            interviewPrep: interviewPrep[sem] || [],
            status
        });
    }
    
    // Calculate overall progress
    const completedSemesters = semesters.filter(s => s.status === 'completed').length;
    const currentSemProgress = currentSemester <= 8 ? 0.5 : 0; // 50% for current semester
    const overallProgress = Math.round(((completedSemesters + currentSemProgress) / 8) * 100);
    
    // Critical path - key milestones for placement readiness
    const criticalPath = [
        "Master DSA (Sem 1-4)",
        "Complete Core Projects (Sem 3-5)",
        "First Internship (Sem 3-4)",
        "System Design Knowledge (Sem 5-6)",
        "Pre-Placement Offer (Sem 6-7)",
        "Placement Ready (Sem 8)"
    ];
    
    // Estimate placement readiness
    const remainingSemesters = 8 - currentSemester;
    const estimatedPlacementReady = remainingSemesters <= 0 
        ? "Ready for placement!"
        : `${remainingSemesters} semester${remainingSemesters > 1 ? 's' : ''} to placement readiness`;
    
    return {
        targetRole,
        currentSemester,
        overallProgress,
        semesters,
        criticalPath,
        estimatedPlacementReady
    };
}

function getSemesterTitle(sem: number, role: string): string {
    const titles: Record<number, string> = {
        1: "Foundation Building",
        2: "Programming Mastery",
        3: "Core CS Fundamentals",
        4: "Application Development",
        5: "Specialization Begin",
        6: "Advanced Concepts",
        7: "Industry Integration",
        8: "Placement Ready"
    };
    return titles[sem] || `Semester ${sem}`;
}

function getSemesterFocus(sem: number, role: string): string {
    const focusMap: Record<number, Record<string, string>> = {
        1: {
            "Full-Stack Developer": "Web Basics & JavaScript",
            "Data Scientist": "Python & Data Basics",
            "Backend Engineer": "Programming & Linux",
            "AI/ML Engineer": "Math & Python",
            "Frontend Developer": "HTML/CSS Mastery",
            "DevOps Engineer": "Linux & Scripting"
        },
        2: {
            "Full-Stack Developer": "OOP & Async Programming",
            "Data Scientist": "Statistics & Analysis",
            "Backend Engineer": "DSA & System Basics",
            "AI/ML Engineer": "Algorithms & Probability",
            "Frontend Developer": "JavaScript Deep Dive",
            "DevOps Engineer": "Cloud & Networking"
        },
        3: {
            "Full-Stack Developer": "React & Node.js",
            "Data Scientist": "ML Fundamentals",
            "Backend Engineer": "Databases & APIs",
            "AI/ML Engineer": "ML & Deep Learning",
            "Frontend Developer": "React Ecosystem",
            "DevOps Engineer": "Containers & Docker"
        },
        4: {
            "Full-Stack Developer": "Full-Stack Integration",
            "Data Scientist": "Advanced ML & Models",
            "Backend Engineer": "System Design",
            "AI/ML Engineer": "Neural Networks",
            "Frontend Developer": "Advanced React",
            "DevOps Engineer": "Kubernetes & Orchestration"
        },
        5: {
            "Full-Stack Developer": "Advanced Frameworks",
            "Data Scientist": "Deep Learning",
            "Backend Engineer": "Microservices",
            "AI/ML Engineer": "Transformers & NLP",
            "Frontend Developer": "Next.js & SSR",
            "DevOps Engineer": "Infrastructure as Code"
        },
        6: {
            "Full-Stack Developer": "DevOps & Deployment",
            "Data Scientist": "MLOps & Production",
            "Backend Engineer": "Distributed Systems",
            "AI/ML Engineer": "Advanced AI Systems",
            "Frontend Developer": "Testing & Systems",
            "DevOps Engineer": "Monitoring & Observability"
        },
        7: {
            "Full-Stack Developer": "Enterprise Development",
            "Data Scientist": "Research & Production",
            "Backend Engineer": "High-Scale Systems",
            "AI/ML Engineer": "Production AI",
            "Frontend Developer": "Architecture",
            "DevOps Engineer": "Platform Engineering"
        },
        8: {
            "Full-Stack Developer": "Placement Preparation",
            "Data Scientist": "Industry Ready",
            "Backend Engineer": "Placement Ready",
            "AI/ML Engineer": "Research to Industry",
            "Frontend Developer": "Portfolio Polish",
            "DevOps Engineer": "SRE Excellence"
        }
    };
    
    return focusMap[sem]?.[role] || "Skill Development";
}

// Export helper to calculate progress for a specific semester
export function calculateSemesterProgress(
    semester: number,
    userLeetcode: number,
    userProjects: number,
    completedSkills: string[],
    targetRole: string
): number {
    const skills = roleSkillProgression[targetRole] || roleSkillProgression["Full-Stack Developer"];
    const projects = roleProjects[targetRole] || roleProjects["Full-Stack Developer"];
    
    let progress = 0;
    
    // LeetCode progress (30%)
    const leetcodeTarget = leetcodeTargets[semester];
    const prevTarget = semester > 1 ? leetcodeTargets[semester - 1] : 0;
    const semLeetcode = Math.min(100, Math.max(0, ((userLeetcode - prevTarget) / (leetcodeTarget - prevTarget)) * 100));
    progress += semLeetcode * 0.3;
    
    // Projects progress (30%)
    const semProjects = projects[semester] || [];
    const projectProgress = semProjects.length > 0 ? Math.min(100, (userProjects / semProjects.length) * 100) : 100;
    progress += projectProgress * 0.3;
    
    // Skills progress (40%)
    const semSkills = skills[semester] || [];
    const acquiredSkills = semSkills.filter(skill => 
        completedSkills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))
    ).length;
    const skillsProgress = semSkills.length > 0 ? (acquiredSkills / semSkills.length) * 100 : 100;
    progress += skillsProgress * 0.4;
    
    return Math.round(progress);
}
