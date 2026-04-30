import { industryBenchmarks } from '../data/industryBenchmarks';
import type { CurriculumSubjectEntry } from '../services/db/types';

export interface RoadmapStep {
    title: string;
    desc: string;
    iconKey: string;
    priority: 'critical' | 'high' | 'medium';
    timeframe: string;
}

export interface CurriculumMapping {
    year: number;
    focus: string;
    subject: string;
    reason: string;
}

export interface SubjectIndustryEntry {
    subject: string;
    industryRelevance: 'high' | 'medium' | 'low';
    supplementarySkills: string[];
}

export interface IntelligentRoadmap {
    targetRole: string;
    currentYear: number;
    overallProgress: number;
    roadmapSteps: RoadmapStep[];
    skillsToMaster: string[];
    certifications: string[];
    projectsToBuild: string[];
    milestones: string[];
    academicFocus: string[];
    internshipGoals: string;
    curriculumMapping: CurriculumMapping[];
    nextMilestone: string;
    estimatedTimeToReady: string;
    subjectIndustryMap?: SubjectIndustryEntry[];
}

// Curriculum mapping for NMIMS CSE (DS) program
const curriculumData: Record<number, CurriculumMapping[]> = {
    1: [
        { year: 1, focus: "Foundation", subject: "Programming & Problem Solving", reason: "Build strong coding fundamentals with C/C++ and Python" },
        { year: 1, focus: "Mathematics", subject: "Calculus & Linear Algebra", reason: "Essential for understanding algorithms and ML concepts" },
        { year: 1, focus: "Core CS", subject: "Data Structures Basics", reason: "Foundation for competitive programming and interviews" }
    ],
    2: [
        { year: 2, focus: "Advanced DS", subject: "Data Structures & Algorithms", reason: "Master DSA for technical interviews and problem-solving" },
        { year: 2, focus: "Database", subject: "DBMS & SQL", reason: "Critical for backend development and data management" },
        { year: 2, focus: "Web Tech", subject: "Web Programming", reason: "Build full-stack development skills" }
    ],
    3: [
        { year: 3, focus: "Specialization", subject: "Machine Learning & Data Science", reason: "Core specialization for CSE (DS) program" },
        { year: 3, focus: "Systems", subject: "Operating Systems & Networks", reason: "Understand system-level programming and architecture" },
        { year: 3, focus: "Projects", subject: "Capstone Project Development", reason: "Build portfolio-worthy projects for placements" }
    ],
    4: [
        { year: 4, focus: "Industry Ready", subject: "System Design & Architecture", reason: "Prepare for senior developer interviews" },
        { year: 4, focus: "Placement Prep", subject: "Mock Interviews & Coding Practice", reason: "Final preparation for placement season" },
        { year: 4, focus: "Specialization", subject: "Advanced ML/AI or Full-Stack", reason: "Deep dive into chosen career path" }
    ]
};

// Role-specific certifications
const roleCertifications: Record<string, string[]> = {
    "Full-Stack Developer": [
        "Meta Front-End Developer Professional Certificate",
        "Node.js Application Development (LFW211)",
        "AWS Certified Developer - Associate",
        "MongoDB Certified Developer"
    ],
    "Data Scientist": [
        "IBM Data Science Professional Certificate",
        "Google Data Analytics Professional Certificate",
        "TensorFlow Developer Certificate",
        "AWS Certified Machine Learning - Specialty"
    ],
    "Backend Engineer": [
        "Oracle Certified Professional: Java SE",
        "AWS Certified Solutions Architect",
        "Redis Certified Developer",
        "Kubernetes Application Developer (CKAD)"
    ],
    "AI/ML Engineer": [
        "TensorFlow Developer Certificate",
        "AWS Certified Machine Learning - Specialty",
        "Deep Learning Specialization (Coursera)",
        "MLOps Specialization"
    ],
    "Frontend Developer": [
        "Meta Front-End Developer Professional Certificate",
        "Google UX Design Professional Certificate",
        "React Developer Certification",
        "Web Accessibility Specialist (WAS)"
    ],
    "DevOps Engineer": [
        "AWS Certified DevOps Engineer - Professional",
        "Certified Kubernetes Administrator (CKA)",
        "Docker Certified Associate",
        "HashiCorp Certified: Terraform Associate"
    ]
};

export function generateIntelligentRoadmap(
    currentYear: number,
    targetRole: string,
    userSkills: string[],
    leetcodeSolved: number,
    projectCount: number,
    internshipCount: number,
    cgpa: number,
    liveCurriculum?: Record<number, CurriculumSubjectEntry[]>
): IntelligentRoadmap {
    
    // Get industry benchmark for target role
    const benchmark = industryBenchmarks[targetRole] || industryBenchmarks["Full-Stack Developer"];
    
    // Calculate overall progress
    const skillProgress = Math.min(100, (userSkills.length / 10) * 100);
    const leetcodeProgress = Math.min(100, (leetcodeSolved / benchmark.avgLeetCodeProblems) * 100);
    const projectProgress = Math.min(100, (projectCount / benchmark.avgProjects) * 100);
    const internshipProgress = Math.min(100, (internshipCount / benchmark.avgInternships) * 100);
    const overallProgress = Math.round((skillProgress + leetcodeProgress + projectProgress + internshipProgress) / 4);

    // Identify missing skills
    const requiredSkills = benchmark.requiredSkills.map(s => s.skill);
    const missingSkills = requiredSkills.filter(skill => 
        !userSkills.some(userSkill => 
            userSkill.toLowerCase().includes(skill.toLowerCase()) || 
            skill.toLowerCase().includes(userSkill.toLowerCase())
        )
    );

    // Generate roadmap steps based on current state
    const roadmapSteps: RoadmapStep[] = [];

    // Step 1: Critical Skills
    if (missingSkills.length > 0) {
        const coreSkills = benchmark.requiredSkills
            .filter(s => s.category === 'core' && missingSkills.includes(s.skill))
            .slice(0, 3);
        
        if (coreSkills.length > 0) {
            roadmapSteps.push({
                title: `Master Core ${targetRole} Skills`,
                desc: `Learn ${coreSkills.map(s => s.skill).join(', ')}. These are critical skills required by 90% of companies hiring for this role.`,
                iconKey: "Code2",
                priority: "critical",
                timeframe: `${Math.max(...coreSkills.map(s => s.avgYearsToMaster))} months`
            });
        }
    }

    // Step 2: LeetCode Practice
    if (leetcodeSolved < benchmark.avgLeetCodeProblems) {
        const gap = benchmark.avgLeetCodeProblems - leetcodeSolved;
        roadmapSteps.push({
            title: "Strengthen DSA Problem Solving",
            desc: `Solve ${gap} more LeetCode problems to reach the industry benchmark of ${benchmark.avgLeetCodeProblems}. Focus on medium difficulty and company-tagged questions.`,
            iconKey: "Target",
            priority: gap > 50 ? "critical" : "high",
            timeframe: `${Math.ceil(gap / 10)} months`
        });
    }

    // Step 3: Projects
    if (projectCount < benchmark.avgProjects) {
        const gap = benchmark.avgProjects - projectCount;
        roadmapSteps.push({
            title: "Build Portfolio Projects",
            desc: `Create ${gap} production-ready project${gap > 1 ? 's' : ''} showcasing ${missingSkills[0] || 'your skills'}. Deploy on GitHub with proper documentation and live demos.`,
            iconKey: "LayoutGrid",
            priority: "high",
            timeframe: `${gap * 2} months`
        });
    }

    // Step 4: Internships (for years 2-3)
    if (currentYear >= 2 && currentYear <= 3 && internshipCount < benchmark.avgInternships) {
        roadmapSteps.push({
            title: "Gain Industry Experience",
            desc: `Apply for ${benchmark.avgInternships - internshipCount} internship${benchmark.avgInternships - internshipCount > 1 ? 's' : ''} in ${targetRole} roles. Target startups and mid-size companies for better learning opportunities.`,
            iconKey: "Briefcase",
            priority: currentYear === 3 ? "critical" : "high",
            timeframe: `${currentYear === 3 ? '3' : '6'} months`
        });
    }

    // Step 5: System Design (for years 3-4)
    if (currentYear >= 3) {
        roadmapSteps.push({
            title: "Learn System Design Fundamentals",
            desc: "Study scalability, load balancing, caching, databases, and microservices. Practice designing real-world systems like Twitter, Netflix, or Uber.",
            iconKey: "Server",
            priority: currentYear === 4 ? "critical" : "medium",
            timeframe: "3 months"
        });
    }

    // Step 6: Certifications
    roadmapSteps.push({
        title: "Earn Industry Certifications",
        desc: `Complete 1-2 certifications from: ${(roleCertifications[targetRole] || roleCertifications["Full-Stack Developer"]).slice(0, 2).join(', ')}. These add credibility to your resume.`,
        iconKey: "BookOpen",
        priority: "medium",
        timeframe: "2-3 months"
    });

    // Step 7: Mock Interviews (for years 3-4)
    if (currentYear >= 3) {
        roadmapSteps.push({
            title: "Practice Mock Interviews",
            desc: "Complete 10+ mock technical interviews on platforms like Pramp, Interviewing.io, or with peers. Focus on communication and problem-solving approach.",
            iconKey: "Compass",
            priority: currentYear === 4 ? "critical" : "high",
            timeframe: "2 months"
        });
    }

    // Generate project ideas based on role
    const projectIdeas: Record<string, string[]> = {
        "Full-Stack Developer": [
            "E-commerce platform with payment integration (MERN stack)",
            "Real-time chat application with WebSockets",
            "Social media dashboard with analytics"
        ],
        "Data Scientist": [
            "Predictive analytics dashboard for business insights",
            "ML model for customer churn prediction",
            "NLP-based sentiment analysis tool"
        ],
        "Backend Engineer": [
            "RESTful API with authentication and rate limiting",
            "Microservices architecture with Docker & Kubernetes",
            "Real-time notification system with message queues"
        ],
        "AI/ML Engineer": [
            "Computer vision app for object detection",
            "Recommendation system using collaborative filtering",
            "NLP chatbot with context understanding"
        ],
        "Frontend Developer": [
            "Progressive Web App (PWA) with offline support",
            "Component library with Storybook documentation",
            "Interactive data visualization dashboard"
        ],
        "DevOps Engineer": [
            "CI/CD pipeline with automated testing and deployment",
            "Infrastructure as Code using Terraform",
            "Monitoring and logging system with Prometheus & Grafana"
        ]
    };

    // Generate milestones based on year
    const milestones: string[] = [];
    if (currentYear === 1) {
        milestones.push(
            "Complete 50 LeetCode problems (Easy + Medium)",
            "Build 2 beginner projects with GitHub repos",
            "Learn Git and version control basics",
            "Maintain 8.0+ CGPA in core subjects",
            "Join coding club or tech community"
        );
    } else if (currentYear === 2) {
        milestones.push(
            `Reach ${Math.min(100, benchmark.avgLeetCodeProblems)} LeetCode problems`,
            "Complete 1 internship or open-source contribution",
            "Build 3 intermediate projects with live demos",
            `Master ${missingSkills.slice(0, 3).join(', ')}`,
            "Participate in 2+ hackathons"
        );
    } else if (currentYear === 3) {
        milestones.push(
            `Solve ${benchmark.avgLeetCodeProblems}+ LeetCode problems`,
            "Complete 1-2 internships in target role",
            "Build 1 advanced capstone project",
            "Earn 1-2 industry certifications",
            "Start mock interview practice"
        );
    } else {
        milestones.push(
            "Complete system design preparation",
            "Achieve 200+ LeetCode problems",
            "Polish resume and LinkedIn profile",
            "Complete 15+ mock interviews",
            "Apply to 50+ companies"
        );
    }

    // Academic focus based on year
    const academicFocus: string[] = [];
    if (currentYear === 1) {
        academicFocus.push("Master programming fundamentals", "Build strong mathematical foundation", "Develop problem-solving mindset");
    } else if (currentYear === 2) {
        academicFocus.push("Excel in DSA and DBMS courses", "Start web development projects", "Explore specialization areas");
    } else if (currentYear === 3) {
        academicFocus.push("Deep dive into ML/DS specialization", "Focus on capstone project", "Maintain strong CGPA for placements");
    } else {
        academicFocus.push("Complete all academic requirements", "Focus on placement preparation", "Finalize specialization expertise");
    }

    // Internship goals
    let internshipGoals = "";
    if (currentYear === 1) {
        internshipGoals = "Explore different tech domains through summer projects";
    } else if (currentYear === 2) {
        internshipGoals = `Secure 1 internship in ${targetRole} or related field`;
    } else if (currentYear === 3) {
        internshipGoals = `Complete 1-2 quality internships with strong recommendations`;
    } else {
        internshipGoals = "Leverage internship experience for full-time offers";
    }

    // Estimate time to ready
    const criticalGaps = roadmapSteps.filter(s => s.priority === 'critical').length;
    const estimatedMonths = criticalGaps * 3 + (4 - currentYear) * 6;
    const estimatedTimeToReady = estimatedMonths >= 12 
        ? `${Math.round(estimatedMonths / 12)} year${estimatedMonths >= 24 ? 's' : ''}`
        : `${estimatedMonths} months`;

    // Next milestone
    const nextMilestone = roadmapSteps[0]?.title || "Continue building your profile";

    // Build curriculum mapping — prefer live knowledge base, fall back to hardcoded
    let activeCurriculumMapping: CurriculumMapping[] = curriculumData[currentYear] || curriculumData[1];
    let subjectIndustryMap: SubjectIndustryEntry[] | undefined;

    if (liveCurriculum) {
        // Map current year's semesters (year 1 = sem 1-2, year 2 = sem 3-4, etc.)
        const sem1 = (currentYear - 1) * 2 + 1;
        const sem2 = sem1 + 1;
        const liveSubjects = [
            ...(liveCurriculum[sem1] || []),
            ...(liveCurriculum[sem2] || []),
        ];

        if (liveSubjects.length > 0) {
            activeCurriculumMapping = liveSubjects.map(s => ({
                year: currentYear,
                focus: s.industryRelevance === 'high' ? 'Core Technical' : s.industryRelevance === 'medium' ? 'Foundation' : 'General',
                subject: s.subjectName,
                reason: s.description || `Builds ${s.industrySkills.slice(0, 2).join(' and ')} skills`,
            }));

            subjectIndustryMap = liveSubjects.map(s => ({
                subject: s.subjectName,
                industryRelevance: s.industryRelevance,
                supplementarySkills: s.industrySkills,
            }));
        }
    }

    return {
        targetRole,
        currentYear,
        overallProgress,
        roadmapSteps: roadmapSteps.slice(0, 6),
        skillsToMaster: missingSkills.slice(0, 8),
        certifications: roleCertifications[targetRole] || roleCertifications["Full-Stack Developer"],
        projectsToBuild: projectIdeas[targetRole] || projectIdeas["Full-Stack Developer"],
        milestones,
        academicFocus,
        internshipGoals,
        curriculumMapping: activeCurriculumMapping,
        nextMilestone,
        estimatedTimeToReady,
        subjectIndustryMap,
    };
}

/**
 * Fetches the active curriculum knowledge base for a branch/batch
 * and generates a roadmap aligned to the live syllabus.
 * Falls back to hardcoded curriculum if the knowledge base is empty.
 */
export async function generateCurriculumAlignedRoadmap(
    currentYear: number,
    targetRole: string,
    userSkills: string[],
    leetcodeSolved: number,
    projectCount: number,
    internshipCount: number,
    cgpa: number,
    branch = 'B.Tech CSE (DS)',
    batch = '2022-2026'
): Promise<IntelligentRoadmap> {
    let liveCurriculum: Record<number, CurriculumSubjectEntry[]> | undefined;

    try {
        const { curriculumDb } = await import('../services/db/database.service');
        liveCurriculum = await curriculumDb.getActiveSubjectsForRoadmap(branch, batch);
        if (Object.keys(liveCurriculum).length === 0) liveCurriculum = undefined;
    } catch {
        // Silently fall back to hardcoded data
    }

    return generateIntelligentRoadmap(
        currentYear, targetRole, userSkills,
        leetcodeSolved, projectCount, internshipCount, cgpa,
        liveCurriculum
    );
}
