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
    const modeLabel = mode === 'hr' ? 'HR / Behavioral' : mode === 'project' ? 'Project Deep-Dive' : 'Technical';

    const genericFallbacks: Record<string, string[]> = {
        hr: [
            "Tell me about yourself and your journey into software engineering.",
            "Describe a situation where you had to learn a new technology under a tight deadline. How did you approach it?",
            "Tell me about a time you disagreed with a teammate. How did you resolve it?",
            "Where do you see yourself in 3 years, and how does this role fit that vision?",
            "What's the most complex problem you've solved, and what was your thought process?"
        ],
        project: [
            "Walk me through the architecture of your most technically challenging project.",
            "What was the hardest bug you ever debugged? How did you find and fix it?",
            "How did you decide on the tech stack for your main project? What trade-offs did you consider?",
            "If you could rebuild your best project from scratch, what would you do differently and why?",
            "How did you handle data consistency and error states in your project?"
        ],
        technical: [
            `Explain how you would design a URL shortener like bit.ly. Walk me through the system design.`,
            `What is the difference between a process and a thread? When would you use each?`,
            `Explain the CAP theorem and give a real-world example of a system that prioritizes each combination.`,
            `How does JavaScript's event loop work? What is the difference between microtasks and macrotasks?`,
            `Given an array of integers, find the two numbers that sum to a target. What's the optimal solution?`
        ]
    };

    if (!API_KEY) return genericFallbacks[mode] || genericFallbacks.technical;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const resumeSection = resumeDescription?.trim()
            ? `RESUME (read every word — questions MUST reference specific items from this):
"""
${resumeDescription.slice(0, 4000)}
"""`
            : `No resume provided. Generate role-specific questions based on skills.`;

        const prompt = `You are a senior technical interviewer at a top-tier tech company (Google/Microsoft/Amazon level). Your job is to conduct a ${modeLabel} interview.

CANDIDATE PROFILE:
- Target Role: ${targetRole}
- Skills: ${skills.join(', ') || 'Not specified'}
${resumeSection}

INTERVIEW TYPE: ${modeLabel}

STRICT RULES:
${resumeDescription?.trim() ? `
1. You MUST read the resume carefully and ask questions about SPECIFIC projects, companies, technologies, and experiences mentioned.
2. Reference exact project names, company names, or technologies from the resume.
3. Ask "how" and "why" questions about their actual work, not hypotheticals.
4. For technical mode: ask about the internals of technologies they listed (e.g., "You used Redis — explain how Redis handles persistence").
5. For project mode: ask about architecture decisions, challenges, and trade-offs in their actual projects.
6. For HR mode: ask behavioral questions grounded in their actual experiences.
` : `
1. Generate industry-standard questions for a ${targetRole} ${modeLabel} interview.
2. Questions should be specific, not generic — ask about real scenarios and trade-offs.
3. Include at least one system design or architecture question for technical mode.
`}
7. Questions must be progressively harder (start medium, end hard).
8. NO generic questions like "What are your strengths?" or "Tell me about yourself" for technical/project modes.

Return ONLY a valid JSON array of exactly 5 question strings. No markdown, no keys, no explanation.
["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]`;

        const result = await model.generateContent(prompt);
        const text = (await result.response).text().replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length >= 5) return parsed.slice(0, 5);
        throw new Error("Invalid format");
    } catch (error) {
        console.error("generateInterviewQuestions failed:", error);
        return genericFallbacks[mode] || genericFallbacks.technical;
    }
}

export async function generateFollowUpQuestion(
    originalQuestion: string,
    answer: string,
    mode: string,
    targetRole: string
): Promise<string | null> {
    if (!API_KEY || !answer?.trim() || answer.trim().length < 20) return null;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `You are interviewing a candidate for ${targetRole}.

Original question: "${originalQuestion}"
Candidate's answer: "${answer.slice(0, 1000)}"

Generate ONE sharp follow-up question that:
- Digs deeper into something specific they mentioned
- Challenges an assumption or asks for more detail
- Is natural and conversational (like a real interviewer would ask)
- Is NOT a repeat of the original question

Return ONLY the follow-up question as a plain string. No JSON, no quotes, no explanation.`;

        const result = await model.generateContent(prompt);
        const text = (await result.response).text().trim();
        return text.length > 10 ? text : null;
    } catch {
        return null;
    }
}

// Local speech analysis — no backend needed
export function analyzeSpeechLocally(transcript: string, durationSeconds: number): InterviewEvaluation['communicationMetrics'] {
    const words = transcript.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const speechSpeed = durationSeconds > 0 ? Math.round((wordCount / durationSeconds) * 60) : 0;

    const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'literally', 'actually', 'so', 'right', 'okay'];
    const fillerWordCount = fillerWords.reduce((count, filler) => {
        const regex = new RegExp(`\\b${filler}\\b`, 'gi');
        return count + (transcript.match(regex)?.length || 0);
    }, 0);

    const avgWordsPerSentence = wordCount / Math.max(1, (transcript.match(/[.!?]+/g)?.length || 1));
    const clarity = avgWordsPerSentence < 25 && fillerWordCount < 5 ? 'High' : avgWordsPerSentence < 35 ? 'Medium' : 'Low';

    const confidenceScore = Math.min(10, Math.max(1,
        10 - (fillerWordCount * 0.5) - (speechSpeed > 180 ? 2 : speechSpeed < 80 ? 1 : 0)
    ));
    const communicationScore = Math.min(10, Math.max(1,
        (wordCount > 50 ? 7 : wordCount > 20 ? 5 : 3) + (clarity === 'High' ? 2 : clarity === 'Medium' ? 1 : 0)
    ));

    return {
        communicationScore: Math.round(communicationScore * 10) / 10,
        confidenceScore: Math.round(confidenceScore * 10) / 10,
        fillerWordCount,
        speechSpeed,
        clarity
    };
}

export async function analyzeSpeech(transcript: string, durationSeconds: number): Promise<InterviewEvaluation['communicationMetrics']> {
    return analyzeSpeechLocally(transcript, durationSeconds);
}

export async function evaluateInterviewAnswer(
    question: string,
    transcript: string,
    skills: string[] = [],
    mode: string = "technical",
    resumeDescription: string = ""
): Promise<InterviewEvaluation> {
    const fallback: InterviewEvaluation = {
        technicalScore: transcript.trim().length > 50 ? 5 : 2,
        strengths: transcript.trim().length > 50 ? ["Provided a response to the question."] : ["Attempted to answer."],
        improvements: ["Add more technical depth and specific examples.", "Structure your answer using STAR method or explain your reasoning step by step."],
        suggestedAnswer: "A strong answer would directly address the core concept, give a concrete example, and explain trade-offs."
    };

    if (!API_KEY || !transcript?.trim() || transcript.trim().length < 10) return fallback;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `You are a senior interviewer evaluating a candidate's answer. Be honest and specific — not encouraging for the sake of it.

INTERVIEW MODE: ${mode === 'hr' ? 'HR/Behavioral' : mode === 'project' ? 'Project Deep-Dive' : 'Technical'}
TARGET ROLE: ${skills.length ? `Skills: ${skills.join(', ')}` : 'Software Engineer'}
${resumeDescription?.trim() ? `RESUME CONTEXT: ${resumeDescription.slice(0, 500)}` : ''}

QUESTION: "${question}"

CANDIDATE'S ANSWER: "${transcript.slice(0, 2000)}"

Evaluate this answer and return ONLY valid JSON:
{
  "technicalScore": <integer 1-10>,
  "strengths": ["specific strength 1", "specific strength 2"],
  "improvements": ["specific improvement 1", "specific improvement 2"],
  "suggestedAnswer": "A concise model answer (2-4 sentences) showing what an ideal response looks like"
}

Scoring guide:
- 9-10: Exceptional — covers all aspects, gives examples, mentions trade-offs
- 7-8: Good — covers main points but misses depth or examples
- 5-6: Average — partially correct but vague or incomplete
- 3-4: Weak — misses key concepts or gives incorrect information
- 1-2: Very poor — off-topic or no meaningful content

Be specific in strengths/improvements — reference what they actually said.`;

        const result = await model.generateContent(prompt);
        const text = (await result.response).text().replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(text);
        if (parsed.technicalScore && parsed.strengths && parsed.improvements) return parsed;
        throw new Error("Invalid format");
    } catch (error) {
        console.error("evaluateInterviewAnswer failed:", error);
        return fallback;
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
