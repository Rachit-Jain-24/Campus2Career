import { GoogleGenerativeAI } from "@google/generative-ai";
import type { IntelligentRoadmap } from './roadmapGenerator';

// Gemini API Key from environment variables
// For production, this should be in an environment variable
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

export interface AtsAnalysisResult {
    score: number;
    matchDetails: {
        experienceMatch: string;
        techStackMatch: string;
        roleAlignment: string;
    };
    extractedSkills: string[];
    missingKeywords: string[];
    suggestions: string[];
    summary: string;
}

export interface ProfileAnalysis {
    careerStrength: number;
    overallStatus: string;
    feedback: string;
    recommendedRoles: string[];
    suggestedSkills: string[];
    marketReadiness: string;
}

export interface CareerRoadmap {
    academicFocus: string[];
    industryGap: string[];
    roadmapSteps: {
        title: string;
        desc: string;
        iconKey: string;
    }[];
    curriculumMapping: {
        year: number;
        focus: string;
        subject: string;
        reason: string;
    }[];
    // Rich details from legacy system
    skillsToMaster: string[];
    projectsToBuild: string[];
    certifications: string[];
    internshipGoals: string;
    milestones: string[];
}

export interface RoadmapStep {
    title: string;
    desc: string;
    iconKey: string;
}

export interface InterviewEvaluation {
    technicalScore: number;
    strengths: string[];
    improvements: string[];
    suggestedAnswer: string;
    communicationMetrics?: {
        communicationScore: number;
        confidenceScore: number;
        fillerWordCount: number;
        speechSpeed: number;
        clarity: string;
    };
}

export interface InterviewSession {
    date: string;
    mode: string;
    questions: string[];
    answers: string[];
    scores: {
        technical: number;
        communication: number;
        confidence: number;
        overall: number;
    };
    feedbacks: InterviewEvaluation[];
}

// --- END OF INTERFACE DEFINITIONS ---

export async function analyzeResumeWithAI(resumeText: string, jdText: string): Promise<AtsAnalysisResult> {
    try {
        const response = await fetch("http://localhost:8000/api/analyze-resume", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resumeText, jdText })
        });

        if (!response.ok) {
            throw new Error(`Python NLP Backend Error: ${response.status}`);
        }

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        return data as AtsAnalysisResult;
    } catch (error) {
        console.error("Python NLP Analysis failed, falling back to local NLP:", error);
        return runLocalNLPAnalysis(resumeText, jdText);
    }
}

// Sophisticated Local NLP Fallback (Industry Standard Rule-based)
function runLocalNLPAnalysis(resumeText: string, jdText: string): AtsAnalysisResult {
    const resume = resumeText.toLowerCase();
    const jd = jdText.toLowerCase();

    const TECH_KEYWORDS = [
        "JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "C++", "SQL",
        "Firebase", "Docker", "AWS", "Kubernetes", "MongoDB", "PostgreSQL", "Next.js",
        "System Design", "Microservices", "REST API", "GraphQL", "Tailwind", "Git",
        "Agile", "Testing", "DevOps", "CI/CD"
    ];

    const jdKeywords = TECH_KEYWORDS.filter(k => jd.includes(k.toLowerCase()));
    const matchedSkills = jdKeywords.filter(k => resume.includes(k.toLowerCase()));
    const missingKeywords = jdKeywords.filter(k => jdKeywords.includes(k) && !matchedSkills.includes(k));

    const matchRatio = jdKeywords.length > 0 ? (matchedSkills.length / jdKeywords.length) : 0;
    const score = Math.round(matchRatio * 75 + (matchedSkills.length > 5 ? 25 : matchedSkills.length * 5));

    return {
        score: Math.min(score, 100),
        matchDetails: {
            experienceMatch: score > 75 ? "High" : score > 40 ? "Medium" : "Low",
            techStackMatch: `${Math.round(matchRatio * 100)}%`,
            roleAlignment: score > 70 ? "Strong fit" : "Partial fit"
        },
        extractedSkills: matchedSkills,
        missingKeywords: missingKeywords,
        suggestions: [
            missingKeywords.length > 0 ? `Add missing keywords: ${missingKeywords.slice(0, 3).join(", ")}` : "Highlight your leadership roles",
            "Quantify your achievements with percentages where possible",
            "Ensure your contact information is clearly visible at the top"
        ],
        summary: `You match about ${Math.round(matchRatio * 100)}% of the core technical requirements.`
    };
}

export async function analyzeProfileWithAI(user: any): Promise<ProfileAnalysis> {
    if (!API_KEY) {
        return {
            careerStrength: 65,
            overallStatus: "Developing Foundations",
            feedback: "Add more projects and internships to increase your profile strength.",
            recommendedRoles: ["Software Engineer", "Full Stack Developer"],
            suggestedSkills: ["Docker", "Kubernetes", "System Design"],
            marketReadiness: "Moderate"
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
            Analyze the following student profile for placement readiness at top-tier companies.
            PROFILE:
            ${JSON.stringify(user)}
            
            Return ONLY a valid JSON object:
            {
                "careerStrength": 0-100,
                "overallStatus": "e.g., Industry Ready / High Potential / Developing Skills",
                "feedback": "overall mentoring feedback",
                "recommendedRoles": ["role1", "role2"],
                "suggestedSkills": ["skill1", "skill2"],
                "marketReadiness": "High/Moderate/Developing"
            }
        `;

        const result = await model.generateContent(prompt);
        const text = (await result.response).text().replace(/```json|```/g, "").trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("Profile analysis failed:", error);
        return {
            careerStrength: 50,
            overallStatus: "Profile under review",
            feedback: "AI Analysis is currently unavailable.",
            recommendedRoles: [],
            suggestedSkills: [],
            marketReadiness: "Developing"
        };
    }
}

// Remote Context-Aware AI Inference Route (via Python Microservice)
export async function generateRoadmapWithAI(
    currentYear: number,
    targetRole: string,
    skills: string[],
    leetcodeSolved: number,
    projectsCount: number,
    internshipsCount: number,
    resumeUrl: string
): Promise<CareerRoadmap> {
    const fallbackResponse: CareerRoadmap = {
        academicFocus: ["Focus on core Data Structures.", "Ensure CGPA is maintained."],
        industryGap: ["AWS Cloud", "Docker Pipeline"],
        roadmapSteps: [
            { title: "Solve 50 LeetCode Problems", desc: "Build algorithmic logic.", iconKey: "Code2" },
            { title: "Build 2 Starter Projects", desc: "Showcase technical application.", iconKey: "LayoutGrid" },
            { title: "Learn Trending Tools", desc: "Start exploring live industry tech.", iconKey: "Target" },
            { title: "Prepare ATS Resume", desc: "Update your profile with projects.", iconKey: "FileText" }
        ],
        curriculumMapping: [
            { year: 1, focus: "Foundations", subject: "Programming", reason: "Base logic building." },
            { year: 2, focus: "Skill Building", subject: "DBMS", reason: "Data storage fundamentals." },
            { year: 3, focus: "Internship Readiness", subject: "Software Engineering", reason: "Process management." },
            { year: 4, focus: "Placement Prep", subject: "Electives", reason: "Specialization focus." }
        ],
        skillsToMaster: ["C++", "Python Basics", "Git", "DSA Fundamentals"],
        projectsToBuild: ["Personal Portfolio", "Basics GUI Calculator"],
        certifications: ["Python for Everybody", "Google IT Support"],
        internshipGoals: "Focus on learning fundamentals in Year 1. No internship required yet.",
        milestones: ["Solve 50 coding problems", "Learn version control", "Build 2 mini projects"]
    };

    try {
        const response = await fetch("http://localhost:8000/api/generate-roadmap", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                currentYear,
                targetRole,
                skills,
                leetcodeSolved,
                projectsCount,
                internshipsCount,
                resumeUrl,
                apiKey: API_KEY
            })
        });

        if (!response.ok) {
            throw new Error(`AI Backend returned ${response.status}`);
        }

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        return data as CareerRoadmap;
    } catch (error) {
        console.error("Roadmap generation via Python Backend failed:", error);
        return fallbackResponse;
    }
}

export async function generateInterviewQuestions(
    mode: string,
    skills: string[],
    targetRole: string = "Software Engineer",
    resumeDescription: string = ""
): Promise<string[]> {
    if (!API_KEY) {
        if (mode === 'hr') return ["Tell me about yourself.", "What are your strengths and weaknesses?", "Describe a time you faced a conflict in a team.", "Where do you see yourself in 5 years?", "Why do you want to work here?"];
        if (mode === 'project') return ["Walk me through the architecture of your most complex project.", "What was the most challenging bug you fixed?", "How did you make technology stack choices for your project?", "If you could rebuild your project, what would you do differently?", "How do you handle scalability?"];
        return ["Explain the difference between Array and LinkedList.", "What is the time complexity of QuickSort?", "How does a Hash Map work under the hood?", "Explain the concept of closures.", "What are the SOLID principles?"];
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
            You are an expert technical interviewer for top-tier tech companies.
            Generate EXACTLY 5 highly personalized interview questions for a student based heavily on the provided Resume Text.
            
            Mode: ${mode === 'hr' ? 'HR / Behavioral Interview' : mode === 'project' ? 'Project / Experience Deep-Dive Interview' : 'Technical / Core CS Interview'}
            Student Target Role: ${targetRole}
            Student Skills: ${skills.join(', ')}
            
            RAW RESUME TEXT:
            ${resumeDescription ? `"""${resumeDescription}"""` : 'Not provided. Ask generic questions based on skills.'}
            
            CRITICAL INSTRUCTION:
            If RAW RESUME TEXT is provided, you MUST extract specific projects, internship experiences, or technical implementations mentioned in the text and ask highly specific questions about them.
            Do NOT ask generic questions if resume text is present. Formulate questions like: 
            - "In your resume, you mentioned building [Specific Project]. How did you handle [Specific Challenge]?"
            - "I see you worked as a [Role] at [Company]. Can you explain how you used [Technology] there?"
            ${mode === 'technical' ? '- "You listed [Skill] on your resume. How does [advanced concept of Skill] work under the hood?"' : ''}
            
            Return ONLY a valid JSON array of 5 string questions. DO NOT include any markdown formatting, object keys, or other text.
            Example: ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]
        `;

        const result = await model.generateContent(prompt);
        const text = (await result.response).text().replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length >= 5) {
            return parsed.slice(0, 5);
        }
        throw new Error("Invalid response format");
    } catch (error) {
        console.error("Failed to generate questions:", error);
        return ["What is your strongest technical skill and why?", "Describe a time you solved a complex problem.", "How do you keep up with new technologies?", "Explain a project you are proud of.", "Where do you see yourself in 3 years?"];
    }
}

export async function analyzeSpeech(transcript: string, durationSeconds: number): Promise<InterviewEvaluation['communicationMetrics']> {
    try {
        const response = await fetch("http://localhost:8000/api/analyze-speech", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transcript, durationSeconds })
        });
        if (!response.ok) throw new Error("Speech analysis failed");
        return await response.json();
    } catch (error) {
        console.error("Speech Analysis Error:", error);
        return {
            communicationScore: 7,
            confidenceScore: 7,
            fillerWordCount: 0,
            speechSpeed: 100,
            clarity: "Medium"
        };
    }
}

export async function evaluateInterviewAnswer(
    question: string,
    transcript: string,
    skills: string[] = [],
    mode: string = "technical",
    resumeDescription: string = ""
): Promise<InterviewEvaluation> {
    try {
        const response = await fetch("http://localhost:8000/api/evaluate-interview-answer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                question,
                transcript,
                skills,
                mode,
                apiKey: API_KEY,
                resumeDescription
            })
        });

        if (!response.ok) throw new Error("AI Evaluation failed");
        return await response.json();
    } catch (error) {
        console.error("Answer evaluation failed:", error);
        return {
            technicalScore: 5,
            strengths: ["Attempted to answer the prompt."],
            improvements: ["Provide more technical depth."],
            suggestedAnswer: "A complete answer would directly address the core concepts."
        };
    }
}

interface StudentProfile {
    sapId: string;
    currentYear: number;
    techSkills: string[];
    leetcodeStats?: { totalSolved: number };
    projects?: unknown[];
    internships?: unknown[];
    cgpa?: string;
}

export async function generateSyllabusRoadmap(
    syllabusText: string,
    studentProfile: StudentProfile,
    targetRole: string
): Promise<IntelligentRoadmap> {
    const {
        currentYear,
        techSkills,
        leetcodeStats,
        projects,
        internships,
        cgpa
    } = studentProfile;

    // Import inline to avoid circular module evaluation
    const { generateIntelligentRoadmap } = await import('./roadmapGenerator');

    // Fallback helper
    const fallback = () =>
        generateIntelligentRoadmap(
            currentYear,
            targetRole,
            techSkills,
            leetcodeStats?.totalSolved ?? 0,
            projects?.length ?? 0,
            internships?.length ?? 0,
            parseFloat(cgpa ?? '0') || 0
        );

    if (!API_KEY) {
        return fallback();
    }

    // Truncate syllabus to avoid token limits while keeping key content
    const truncatedSyllabus = syllabusText.length > 6000
        ? syllabusText.slice(0, 6000) + '\n...[truncated]'
        : syllabusText;

    const leetcodeSolved = leetcodeStats?.totalSolved ?? 0;
    const projectCount = projects?.length ?? 0;
    const internshipCount = internships?.length ?? 0;
    const cgpaNum = parseFloat(cgpa ?? '0') || 0;

    // Estimate progress based on profile
    const estimatedProgress = Math.min(90, Math.round(
        (Math.min(leetcodeSolved / 150, 1) * 25) +
        (Math.min(projectCount / 4, 1) * 25) +
        (Math.min(internshipCount / 2, 1) * 25) +
        (Math.min(cgpaNum / 10, 1) * 25)
    ));

    const prompt = `You are a senior placement advisor at a top engineering college. A student has shared their semester syllabus and profile. Your job is to create a HIGHLY SPECIFIC career roadmap that directly references the subjects in their syllabus and maps each one to industry skills needed for their target role.

SEMESTER SYLLABUS (read carefully — your roadmap MUST reference these subjects):
---
${truncatedSyllabus}
---

STUDENT PROFILE:
- Target Role: ${targetRole}
- Current Year of Study: Year ${currentYear}
- Existing Tech Skills: ${techSkills.length > 0 ? techSkills.join(', ') : 'None listed'}
- LeetCode Problems Solved: ${leetcodeSolved}
- Projects Built: ${projectCount}
- Internships Done: ${internshipCount}
- CGPA: ${cgpaNum > 0 ? cgpaNum : 'Not provided'}

CRITICAL INSTRUCTIONS:
1. roadmapSteps MUST be based on the actual subjects in the syllabus above. Reference subject names directly.
2. Each roadmapStep should explain HOW that subject connects to the ${targetRole} role.
3. skillsToMaster should be skills that COMPLEMENT the syllabus subjects for ${targetRole}.
4. projectsToBuild should use technologies from the syllabus subjects.
5. subjectIndustryMap MUST list every subject found in the syllabus.
6. overallProgress should reflect the student's current profile strength (0-100).

Return ONLY valid JSON, no markdown, no extra text:
{
  "targetRole": "${targetRole}",
  "currentYear": ${currentYear},
  "overallProgress": ${estimatedProgress},
  "roadmapSteps": [
    { "title": "Leverage [Subject from syllabus] for ${targetRole}", "desc": "Specific advice connecting this subject to industry...", "iconKey": "Code2", "priority": "critical", "timeframe": "This semester" },
    { "title": "...", "desc": "...", "iconKey": "Target", "priority": "high", "timeframe": "2 months" }
  ],
  "skillsToMaster": ["skill directly related to syllabus subjects"],
  "certifications": ["cert relevant to ${targetRole}"],
  "projectsToBuild": ["project using syllabus subject technologies"],
  "milestones": ["milestone tied to syllabus completion"],
  "academicFocus": ["specific advice for this semester's subjects"],
  "internshipGoals": "internship goal specific to ${targetRole} and current year",
  "curriculumMapping": [
    { "year": ${currentYear}, "focus": "Current Semester Focus", "subject": "Subject from syllabus", "reason": "Why this matters for ${targetRole}" }
  ],
  "nextMilestone": "Most important next step based on syllabus",
  "estimatedTimeToReady": "Realistic estimate based on current year and profile",
  "subjectIndustryMap": [
    { "subject": "EXACT subject name from syllabus", "industryRelevance": "high", "supplementarySkills": ["skill1", "skill2", "skill3"] }
  ]
}

iconKey must be one of: Code2, LayoutGrid, Briefcase, Target, Compass, GraduationCap, Server, BookOpen
priority must be one of: critical, high, medium`;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT')), 30000)
        );

        const geminiPromise = model.generateContent(prompt);

        const result = await Promise.race([geminiPromise, timeoutPromise]);
        const text = (await result.response).text().replace(/```json|```/g, '').trim();

        try {
            return JSON.parse(text) as IntelligentRoadmap;
        } catch (parseError) {
            console.error('generateSyllabusRoadmap: failed to parse Gemini response', parseError);
            return fallback();
        }
    } catch (error) {
        if (error instanceof Error && error.message === 'TIMEOUT') {
            return fallback();
        }
        console.error('generateSyllabusRoadmap: Gemini call failed', error);
        return fallback();
    }
}
