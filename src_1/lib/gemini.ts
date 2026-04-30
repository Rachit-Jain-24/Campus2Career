import { callOpenRouter, isOpenRouterConfigured } from './openRouter';
import type { IntelligentRoadmap } from './roadmapGenerator';

// Legacy compatibility - API_KEY check now uses OpenRouter
const API_KEY = isOpenRouterConfigured();
const genAI = {
    getGenerativeModel: (_config: { model: string }) => ({
        generateContent: async (prompt: string) => {
            const result = await callOpenRouter(prompt, { json: false });
            return {
                response: {
                    text: () => result
                }
            };
        }
    })
};

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
    const backendUrl = import.meta.env.VITE_AI_BACKEND_URL || 'http://localhost:8000';
    try {
        const response = await fetch(`${backendUrl}/api/analyze-resume`, {
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
    try {
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

        const text = await callOpenRouter(prompt, { json: true });
        return JSON.parse(text);
    } catch (error) {
        console.error("Profile analysis failed:", error);
        return {
            careerStrength: 65,
            overallStatus: "Developing Foundations",
            feedback: "Add more projects and internships to increase your profile strength.",
            recommendedRoles: ["Software Engineer", "Full Stack Developer"],
            suggestedSkills: ["Docker", "Kubernetes", "System Design"],
            marketReadiness: "Moderate"
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

    const backendUrl = import.meta.env.VITE_AI_BACKEND_URL || 'http://localhost:8000';
    try {
        const response = await fetch(`${backendUrl}/api/generate-roadmap`, {
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
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
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
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
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
    targetRole: string,
    preferences?: string
): Promise<IntelligentRoadmap> {
    const {
        currentYear,
        techSkills,
        leetcodeStats,
        projects,
        internships,
        cgpa
    } = studentProfile;

    const { generateIntelligentRoadmap } = await import('./roadmapGenerator');

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

    const leetcodeSolved = leetcodeStats?.totalSolved ?? 0;
    const projectCount = projects?.length ?? 0;
    const internshipCount = internships?.length ?? 0;
    const cgpaNum = parseFloat(cgpa ?? '0') || 0;

    const estimatedProgress = Math.min(90, Math.round(
        (Math.min(leetcodeSolved / 150, 1) * 25) +
        (Math.min(projectCount / 4, 1) * 25) +
        (Math.min(internshipCount / 2, 1) * 25) +
        (Math.min(cgpaNum / 10, 1) * 25)
    ));

    const prompt = `You are a senior placement advisor at a top engineering college. A student has shared their semester syllabus and profile. Create a HIGHLY SPECIFIC 4-year career roadmap that directly references the subjects in their syllabus.

SYLLABUS DATA:
${syllabusText.slice(0, 8000)}

STUDENT PROFILE:
- Target Role: ${targetRole}
- Current Year: Year ${currentYear}
- Tech Skills: ${techSkills.join(', ')}
- LeetCode: ${leetcodeSolved}
- Projects: ${projectCount}
- Internships: ${internshipCount}
- CGPA: ${cgpaNum}
- PERSONALIZED LEARNING PERSPECTIVE/PREFERENCES: "${preferences || 'General career growth'}"

Return ONLY valid JSON:
{
  "targetRole": "${targetRole}",
  "currentYear": ${currentYear},
  "overallProgress": ${estimatedProgress},
  "roadmapSteps": [
    { "title": "string", "desc": "string", "iconKey": "Code2", "priority": "critical", "timeframe": "string" }
  ],
  "skillsToMaster": ["string"],
  "certifications": ["string"],
  "projectsToBuild": ["string"],
  "milestones": ["string"],
  "academicFocus": ["string"],
  "internshipGoals": "string",
  "curriculumMapping": [
    { "year": ${currentYear}, "focus": "string", "subject": "string", "reason": "string" }
  ],
  "nextMilestone": "string",
  "estimatedTimeToReady": "string",
  "subjectIndustryMap": [
    { "subject": "string", "industryRelevance": "high", "supplementarySkills": ["string"] }
  ]
}`;

    const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

    // Try Gemini 2.0 Flash First (User Preferred)
    if (API_KEY) {
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const result = await model.generateContent(prompt);
            const text = (await result.response).text().replace(/```json|```/g, '').trim();
            if (text) return JSON.parse(text) as IntelligentRoadmap;
        } catch (error) {
            console.error('Gemini 2.0 Roadmap generation failed, falling back:', error);
        }
    }

    // Fallback to Groq
    if (GROQ_API_KEY) {
        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.1,
                    response_format: { type: "json_object" }
                })
            });

            if (response.ok) {
                const data = await response.json();
                return JSON.parse(data.choices[0].message.content) as IntelligentRoadmap;
            }
        } catch (err) {
            console.warn("Groq Roadmap fallback failed:", err);
        }
    }

    return fallback();
}

// ── Interview Engine Extensions ──────────────────────────────────────────────
import type { QuestionMetadata, QuestionEvaluation, InterviewMode, Difficulty, STARAnalysis } from '../types/interview';
import { RUBRICS } from './interviewEngine';

// ── Topic pools for randomized DSA question selection ────────────────────────
const DSA_TOPIC_POOLS: Record<Difficulty, string[][]> = {
  junior: [
    ['Arrays', 'Two Pointers', 'Sliding Window'],
    ['Strings', 'HashMap', 'Frequency Count'],
    ['Linked Lists', 'Fast & Slow Pointers'],
    ['Stack', 'Queue', 'Monotonic Stack'],
    ['Binary Search', 'Sorted Arrays'],
    ['Recursion', 'Basic Tree Traversal'],
  ],
  mid: [
    ['Dynamic Programming', 'Memoization', '1D DP'],
    ['Trees', 'BST', 'DFS/BFS'],
    ['Graphs', 'BFS', 'Topological Sort'],
    ['Heaps', 'Priority Queue', 'Top-K'],
    ['Backtracking', 'Permutations', 'Subsets'],
    ['Intervals', 'Greedy', 'Merge Intervals'],
    ['Tries', 'Prefix Trees'],
    ['Matrix', '2D DP', 'Grid BFS'],
  ],
  senior: [
    ['Advanced DP', '2D DP', 'Bitmask DP'],
    ['Segment Trees', 'Fenwick Trees', 'Range Queries'],
    ['Advanced Graphs', 'Dijkstra', 'Bellman-Ford', 'Floyd-Warshall'],
    ['String Algorithms', 'KMP', 'Rabin-Karp', 'Z-Algorithm'],
    ['Divide & Conquer', 'Merge Sort Variants'],
    ['Hard Backtracking', 'N-Queens', 'Sudoku Solver'],
    ['Monotonic Deque', 'Sliding Window Maximum'],
  ],
  staff: [
    ['Competitive DP', 'Convex Hull Trick', 'Divide & Conquer DP'],
    ['Advanced Graph Theory', 'Min-Cut', 'Max-Flow', 'Bipartite Matching'],
    ['Suffix Arrays', 'Suffix Automata'],
    ['Persistent Data Structures', 'Treap', 'Skip List'],
    ['Randomized Algorithms', 'Reservoir Sampling'],
    ['Geometry Algorithms', 'Convex Hull', 'Line Sweep'],
  ],
};

const SYSTEM_DESIGN_TOPICS: Record<Difficulty, string[]> = {
  junior: ['URL shortener', 'pastebin', 'simple chat app', 'rate limiter', 'key-value store'],
  mid: ['Twitter feed', 'Instagram', 'Uber ride matching', 'distributed cache', 'notification service', 'search autocomplete', 'web crawler'],
  senior: ['YouTube', 'Google Drive', 'distributed message queue', 'global CDN', 'real-time collaborative editor', 'payment processing system'],
  staff: ['Google Search', 'distributed database', 'global load balancer', 'multi-region consensus system', 'ML feature store at scale'],
};

const COMPANY_DSA_FOCUS: Record<string, string[]> = {
  Google: ['Arrays', 'Graphs', 'Dynamic Programming', 'Trees', 'String Algorithms'],
  Amazon: ['Arrays', 'Trees', 'Graphs', 'OOP Design', 'Greedy'],
  Microsoft: ['Trees', 'Linked Lists', 'Dynamic Programming', 'Graphs', 'Strings'],
  Meta: ['Arrays', 'Graphs', 'Dynamic Programming', 'Trees', 'Recursion'],
  Apple: ['Arrays', 'Strings', 'Trees', 'OOP Design', 'Algorithms'],
  'Startup (General)': ['Arrays', 'Strings', 'HashMap', 'Trees', 'System Design'],
  'MNC (General)': ['Arrays', 'Strings', 'OOP', 'Database', 'Basic Algorithms'],
  'Service-based (TCS/Infosys/Wipro)': ['Arrays', 'Strings', 'Basic OOP', 'SQL', 'Sorting'],
};

// ── Role-specific question profiles ─────────────────────────────────────────
interface RoleProfile {
  dsaTopicBias: string[];          // extra topics to weight toward
  systemDesignFocus: string[];     // preferred SD systems for this role
  behavioralCompetencies: string[]; // competencies to probe in behavioral
  hrThemes: string[];              // HR themes specific to this role
  technicalContext: string;        // injected into prompt as role context
}

const ROLE_PROFILES: Record<string, RoleProfile> = {
  'Software Engineer': {
    dsaTopicBias: ['Arrays', 'Trees', 'Dynamic Programming', 'Graphs'],
    systemDesignFocus: ['URL shortener', 'notification service', 'distributed cache', 'rate limiter'],
    behavioralCompetencies: ['code quality', 'debugging under pressure', 'cross-team collaboration', 'technical trade-offs'],
    hrThemes: ['engineering culture fit', 'growth mindset', 'ownership', 'code review philosophy'],
    technicalContext: 'Focus on clean code, system reliability, and engineering best practices.',
  },
  'Frontend Engineer': {
    dsaTopicBias: ['Trees', 'Strings', 'HashMap', 'Recursion'],
    systemDesignFocus: ['design a component library', 'design a real-time dashboard', 'design a news feed UI', 'design an autocomplete system'],
    behavioralCompetencies: ['UI performance optimization', 'cross-browser compatibility', 'design-engineering collaboration', 'accessibility'],
    hrThemes: ['user empathy', 'design sensibility', 'performance obsession', 'framework opinions'],
    technicalContext: 'Emphasize browser rendering, React/Vue patterns, state management, and web performance.',
  },
  'Backend Engineer': {
    dsaTopicBias: ['Graphs', 'Dynamic Programming', 'Heaps', 'Tries'],
    systemDesignFocus: ['API gateway', 'distributed job queue', 'database sharding', 'microservices architecture'],
    behavioralCompetencies: ['API design decisions', 'database optimization', 'incident response', 'service reliability'],
    hrThemes: ['scalability mindset', 'on-call culture', 'API design philosophy', 'data consistency'],
    technicalContext: 'Focus on API design, database optimization, distributed systems, and service reliability.',
  },
  'Full Stack Engineer': {
    dsaTopicBias: ['Arrays', 'Trees', 'HashMap', 'Graphs'],
    systemDesignFocus: ['design a SaaS product', 'design a real-time chat app', 'design an e-commerce platform'],
    behavioralCompetencies: ['context switching', 'end-to-end ownership', 'product thinking', 'technical debt management'],
    hrThemes: ['breadth vs depth', 'product ownership', 'startup mindset', 'shipping velocity'],
    technicalContext: 'Cover both frontend and backend concerns — API contracts, state management, and deployment.',
  },
  'Data Scientist': {
    dsaTopicBias: ['Arrays', 'HashMap', 'Sorting', 'Matrix', 'Probability'],
    systemDesignFocus: ['design an ML feature store', 'design an A/B testing platform', 'design a recommendation engine', 'design a data pipeline'],
    behavioralCompetencies: ['experiment design', 'communicating results to non-technical stakeholders', 'model failure analysis', 'data quality issues'],
    hrThemes: ['data-driven decision making', 'business impact of models', 'research vs production trade-offs'],
    technicalContext: 'Emphasize statistical thinking, ML model evaluation, data pipelines (Pandas/NumPy/Spark), and experiment design.',
  },
  'Data Engineer': {
    dsaTopicBias: ['Graphs', 'Sorting', 'HashMap', 'Sliding Window'],
    systemDesignFocus: ['design a data warehouse', 'design an ETL pipeline', 'design a real-time streaming system', 'design a data lake'],
    behavioralCompetencies: ['pipeline reliability', 'data quality ownership', 'cross-functional data contracts', 'schema evolution'],
    hrThemes: ['data ownership culture', 'SLA mindset', 'collaboration with analysts and scientists'],
    technicalContext: 'Focus on ETL/ELT pipelines, SQL optimization, Spark/Kafka, data modeling, and pipeline observability.',
  },
  'ML Engineer': {
    dsaTopicBias: ['Arrays', 'Matrix', 'Dynamic Programming', 'Graphs', 'Probability'],
    systemDesignFocus: ['design an ML training pipeline', 'design a model serving system', 'design an online feature store', 'design a model monitoring system'],
    behavioralCompetencies: ['model deployment challenges', 'training vs inference trade-offs', 'debugging model degradation', 'cross-team ML collaboration'],
    hrThemes: ['research-to-production mindset', 'model reliability', 'ML system ownership'],
    technicalContext: 'Cover model training pipelines, serving infrastructure, feature engineering, and ML system reliability.',
  },
  'DevOps Engineer': {
    dsaTopicBias: ['Graphs', 'Trees', 'Strings', 'HashMap'],
    systemDesignFocus: ['design a CI/CD pipeline', 'design a container orchestration system', 'design an observability platform', 'design a secrets management system'],
    behavioralCompetencies: ['incident response', 'automation mindset', 'developer experience improvement', 'reliability engineering'],
    hrThemes: ['SRE culture', 'blameless post-mortems', 'infrastructure as code philosophy', 'on-call balance'],
    technicalContext: 'Focus on CI/CD, Kubernetes, infrastructure as code (Terraform), observability, and SRE practices.',
  },
  'Cloud Engineer': {
    dsaTopicBias: ['Graphs', 'Trees', 'Dynamic Programming', 'Greedy'],
    systemDesignFocus: ['design a multi-region deployment', 'design a cloud cost optimization system', 'design a serverless architecture', 'design a disaster recovery system'],
    behavioralCompetencies: ['cloud cost optimization', 'multi-cloud strategy', 'security posture', 'migration planning'],
    hrThemes: ['cloud-first mindset', 'cost vs reliability trade-offs', 'vendor lock-in philosophy'],
    technicalContext: 'Emphasize AWS/GCP/Azure services, serverless, IaC, networking, and cloud security.',
  },
  'Security Engineer': {
    dsaTopicBias: ['Strings', 'HashMap', 'Graphs', 'Trees'],
    systemDesignFocus: ['design an authentication system', 'design a secrets vault', 'design a threat detection system', 'design a zero-trust network'],
    behavioralCompetencies: ['threat modeling', 'security incident response', 'developer security education', 'risk vs velocity trade-offs'],
    hrThemes: ['security culture', 'shift-left security', 'responsible disclosure', 'paranoia vs pragmatism'],
    technicalContext: 'Focus on authentication/authorization, cryptography, threat modeling, OWASP, and secure SDLC.',
  },
  'Mobile Engineer': {
    dsaTopicBias: ['Trees', 'Arrays', 'Strings', 'HashMap'],
    systemDesignFocus: ['design an offline-first mobile app', 'design a push notification system', 'design a mobile analytics SDK', 'design a real-time sync system'],
    behavioralCompetencies: ['app performance optimization', 'crash debugging', 'OS version fragmentation', 'battery/memory constraints'],
    hrThemes: ['user experience obsession', 'app store dynamics', 'platform-specific vs cross-platform philosophy'],
    technicalContext: 'Cover iOS/Android architecture patterns, offline sync, performance profiling, and app lifecycle.',
  },
  'Product Manager': {
    dsaTopicBias: ['Arrays', 'Strings', 'HashMap'],
    systemDesignFocus: ['design a product metrics dashboard', 'design an A/B testing system', 'design a feature flag system'],
    behavioralCompetencies: ['prioritization under constraints', 'stakeholder alignment', 'data-driven product decisions', 'handling conflicting feedback'],
    hrThemes: ['product vision', 'customer empathy', 'roadmap trade-offs', 'working with engineering'],
    technicalContext: 'Focus on product thinking, metrics, user research, and technical feasibility assessment.',
  },
  'QA Engineer': {
    dsaTopicBias: ['Arrays', 'Strings', 'HashMap', 'Trees'],
    systemDesignFocus: ['design a test automation framework', 'design a load testing system', 'design a bug tracking system'],
    behavioralCompetencies: ['test strategy design', 'finding edge cases', 'advocating for quality', 'automation vs manual trade-offs'],
    hrThemes: ['quality culture', 'shift-left testing', 'test coverage philosophy', 'working with developers'],
    technicalContext: 'Emphasize test pyramid, automation frameworks, performance testing, and quality metrics.',
  },
};

/** Normalize a role string to match ROLE_PROFILES keys */
function getRoleProfile(targetRole: string): RoleProfile | null {
  const normalized = targetRole.trim();
  // Exact match first
  if (ROLE_PROFILES[normalized]) return ROLE_PROFILES[normalized];
  // Fuzzy match — find the closest key
  const lower = normalized.toLowerCase();
  const match = Object.keys(ROLE_PROFILES).find(k => lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower));
  return match ? ROLE_PROFILES[match] : null;
}

/** Pick N random items from an array, seeded by a string for reproducibility within a session */
function seededSample<T>(arr: T[], n: number, seed: string): T[] {
  // Simple deterministic shuffle using seed hash
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    h = (Math.imul(h, 1664525) + 1013904223) | 0;
    const j = Math.abs(h) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

export async function generateInterviewQuestionsStructured(params: {
  mode: InterviewMode;
  difficulty: Difficulty;
  targetRole: string;
  targetCompany: string;
  resumeText: string;
  count: number;
  codeLanguage?: string;
}): Promise<QuestionMetadata[]> {
  const { mode, difficulty, targetRole, targetCompany, resumeText, count, codeLanguage = 'python' } = params;
  const rubric = RUBRICS[mode];
  const modeLabel = { dsa: 'DSA/Coding', system_design: 'System Design', behavioral: 'Behavioral', project: 'Project Deep-Dive', hr: 'HR' }[mode];
  const answerMethod = mode === 'dsa' ? 'voice_and_code' : mode === 'system_design' ? 'text' : 'voice';

  // Randomization seed: changes every session so same profile gets different questions
  const sessionSeed = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // Role profile — biases topics, SD systems, behavioral competencies toward the target role
  const roleProfile = getRoleProfile(targetRole);

  // Pick random topics for this session — merge role bias into the pool
  const topicPool = DSA_TOPIC_POOLS[difficulty] ?? DSA_TOPIC_POOLS.mid;
  // Inject role-biased topics as extra entries so they're more likely to be picked
  const biasedPool = roleProfile?.dsaTopicBias.length
    ? [...topicPool, ...roleProfile.dsaTopicBias.map(t => [t])]
    : topicPool;
  const selectedTopicGroups = seededSample(biasedPool, Math.min(count, biasedPool.length), sessionSeed);
  const dsaTopics = selectedTopicGroups.map(g => g[0]).join(', ');

  // Pick SD topic — prefer role-specific ones if available
  const sdPool = roleProfile?.systemDesignFocus.length
    ? roleProfile.systemDesignFocus
    : (SYSTEM_DESIGN_TOPICS[difficulty] ?? SYSTEM_DESIGN_TOPICS.mid);
  const sdTopic = seededSample(sdPool, 1, sessionSeed)[0];

  const companyFocus = COMPANY_DSA_FOCUS[targetCompany] ?? [];

  const fallbackQuestions: QuestionMetadata[] = Array.from({ length: count }, (_, i) => ({
    id: `${mode}-${i}`,
    text: getFallbackQuestion(mode, difficulty, i, sessionSeed),
    mode, difficulty,
    topicTags: mode === 'dsa' ? selectedTopicGroups[i % selectedTopicGroups.length] : [mode],
    companyTags: targetCompany ? [targetCompany] : [],
    expectedDurationSec: mode === 'dsa' ? 1200 : mode === 'system_design' ? 1500 : 180,
    rubric,
    followUpSeeds: [],
    answerMethod: answerMethod as any,
  }));

  if (!API_KEY) return fallbackQuestions;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // ── Build rich profile context ──────────────────────────────────────────
    const profileSection = resumeText?.trim()
      ? `CANDIDATE PROFILE (study every detail before generating):
\`\`\`
${resumeText.slice(0, 6000)}
\`\`\`
Extract and use:
- Project names, tech stacks, and what each project does
- Internship companies, roles, and responsibilities
- Listed skills, frameworks, libraries, tools
- Certifications, achievements, LeetCode stats`
      : `No resume provided. Generate role-specific questions for a ${targetRole} at ${difficulty} level.`;

    // ── Role context ────────────────────────────────────────────────────────
    const roleContext = roleProfile
      ? `ROLE CONTEXT for ${targetRole}:
- Technical focus: ${roleProfile.technicalContext}
- Key competencies to probe: ${roleProfile.behavioralCompetencies.slice(0, 3).join(', ')}
- This role cares about: ${roleProfile.hrThemes.slice(0, 3).join(', ')}`
      : `Role: ${targetRole}. Tailor all questions to what a ${targetRole} actually does day-to-day.`;

  // Detect coding domain from role — determines question style
  const roleL = targetRole.toLowerCase();
  const isDataRole = roleL.includes('data') || roleL.includes('ml') || roleL.includes('machine learning') || roleL.includes('analyst');
  const isFullStack = roleL.includes('full stack') || roleL.includes('fullstack');
  const isFrontend = roleL.includes('frontend') || roleL.includes('front-end') || roleL.includes('react') || roleL.includes('ui');
  const isBackend = roleL.includes('backend') || roleL.includes('back-end') || roleL.includes('api') || roleL.includes('server');
  const isDevOps = roleL.includes('devops') || roleL.includes('sre') || roleL.includes('cloud') || roleL.includes('infra');

  // Company-specific LeetCode-style question patterns
  const COMPANY_LEETCODE_PATTERNS: Record<string, string> = {
    Google: 'Google favors graph traversal, string manipulation, and DP. Known problems: Word Ladder, Trapping Rain Water, Serialize/Deserialize Binary Tree.',
    Amazon: 'Amazon favors arrays, trees, and OOP design. Known problems: LRU Cache, Meeting Rooms, Number of Islands, Top K Frequent Elements.',
    Microsoft: 'Microsoft favors trees, linked lists, and DP. Known problems: Reverse Linked List, Validate BST, Coin Change, Merge K Sorted Lists.',
    Meta: 'Meta favors arrays, graphs, and recursion. Known problems: Clone Graph, Merge Intervals, Valid Parentheses, Subarray Sum Equals K.',
    Apple: 'Apple favors clean OOP design, strings, and trees. Known problems: Design HashMap, Longest Palindromic Substring, Binary Tree Level Order.',
    'Startup (General)': 'Startups favor practical problems: API design, data processing, and real-world scenarios.',
    'MNC (General)': 'MNCs favor standard LeetCode Easy-Medium: Two Sum, FizzBuzz variants, basic sorting, SQL queries.',
    'Service-based (TCS/Infosys/Wipro)': 'Service companies favor basic arrays, strings, pattern printing, and SQL. Focus on correctness over optimization.',
  };
  const companyPattern = COMPANY_LEETCODE_PATTERNS[targetCompany] || '';

  // ── Mode-specific generation instructions ───────────────────────────────
  const modeInstructions: Record<InterviewMode, string> = {
    dsa: isDataRole
      ? `Generate ${count} DATA SCIENCE / ML coding problem(s) in ${codeLanguage}.
- These are NOT LeetCode-style problems. They are practical data science tasks.
- Use libraries: pandas, numpy, scikit-learn, scipy as appropriate
- Topics to pick from (vary per question): data cleaning, feature engineering, statistical analysis, model evaluation, data aggregation, time series, NLP preprocessing, matrix operations
- Each question MUST include: task description, sample input data (as dict/DataFrame), expected output, and constraints
- Difficulty: ${difficulty} — ${difficulty === 'junior' ? 'basic pandas/numpy operations' : difficulty === 'mid' ? 'feature engineering + model evaluation' : 'advanced ML pipelines + optimization'}
- Frame questions around real datasets (crop yield, sales data, customer churn, sentiment analysis, etc.)
- Randomization token: ${sessionSeed.slice(0, 8)}`
      : isFullStack
      ? `Generate ${count} FULL STACK coding task(s) in ${codeLanguage}.
- These are mini feature implementation tasks, not algorithm puzzles
- Topics: REST API design, database queries, authentication logic, data validation, caching, state management
- Each question MUST include: feature requirement, input/output spec, and what to implement
- Difficulty: ${difficulty} — ${difficulty === 'junior' ? 'simple CRUD endpoint' : difficulty === 'mid' ? 'feature with auth + validation' : 'complex feature with caching + error handling'}
- Randomization token: ${sessionSeed.slice(0, 8)}`
      : `Generate ${count} LEETCODE-STYLE DSA coding problem(s) in ${codeLanguage}.
- This session's topic focus: ${dsaTopics}
${companyFocus.length ? `- ${targetCompany} typically asks: ${companyFocus.slice(0, 3).join(', ')}` : ''}
${companyPattern ? `- Company pattern: ${companyPattern}` : ''}
- Difficulty: ${difficulty} (${difficulty === 'junior' ? 'LeetCode Easy — Two Sum, Valid Parentheses, Reverse String level' : difficulty === 'mid' ? 'LeetCode Medium — LRU Cache, Number of Islands, Coin Change level' : difficulty === 'senior' ? 'LeetCode Hard — Trapping Rain Water, Word Ladder, Serialize Tree level' : 'LeetCode Hard+ — competitive programming variants'})
- Each question MUST include: problem statement, function signature in ${codeLanguage}, input/output format, constraints, and 2 examples with expected output
- Write problems similar to real LeetCode problems but NOT verbatim copies — create variants
- If count > 1: Q1 = warmup (easier), Q2 = main challenge (harder)
- Randomization token: ${sessionSeed.slice(0, 8)}`,

    system_design: `Generate ${count} system design question(s).
- This session's system: ${sdTopic}
- Scale: specify concrete numbers (users, QPS, storage) appropriate for ${difficulty} level
- Frame the design challenge from a ${targetRole}'s perspective${roleProfile ? ` — ${roleProfile.technicalContext}` : ''}
- If candidate has relevant project experience, ask them to extend or compare their design to the system
- ${difficulty === 'junior' ? 'Focus on basic components: API, DB, caching' : difficulty === 'mid' ? 'Include scalability, load balancing, DB sharding' : 'Include distributed systems, consistency models, failure modes'}
- Randomization token: ${sessionSeed.slice(0, 8)}`,

    behavioral: `Generate ${count} behavioral question(s) using STAR format.
- ${resumeText?.trim() ? 'CRITICAL: Each question MUST reference a specific project, internship, or experience from the profile above. Ask about challenges, decisions, or outcomes from those specific experiences.' : 'Use role-relevant behavioral scenarios for a ' + targetRole + '.'}
- Competencies to probe for this role: ${roleProfile ? roleProfile.behavioralCompetencies.join(', ') : 'leadership, conflict resolution, technical decision-making, failure/learning, collaboration'}
- Use phrasing like "Tell me about a time when..." or "Describe a situation where..."
- Randomization token: ${sessionSeed.slice(0, 8)}`,

    project: `Generate ${count} project deep-dive question(s).
- ${resumeText?.trim() ? 'Pick the most technically interesting project from the profile and ask deep technical questions about it — architecture decisions, trade-offs, scaling challenges, debugging stories.' : 'Ask about a hypothetical project relevant to ' + targetRole + '.'}
- Probe specifically for ${targetRole} concerns: ${roleProfile ? roleProfile.technicalContext : 'architecture, trade-offs, and scalability'}
- Go beyond surface level: ask WHY they made specific choices, what they would do differently, how they would scale it
- Randomization token: ${sessionSeed.slice(0, 8)}`,

    hr: `Generate ${count} HR/culture-fit question(s).
- Tailor to ${targetCompany || 'a tech company'} culture and the ${targetRole} role specifically
- Themes relevant to this role: ${roleProfile ? roleProfile.hrThemes.join(', ') : 'motivation, career goals, strengths/weaknesses, team fit, work style'}
- ${resumeText?.trim() ? 'Reference their background (degree, internships, projects) to make questions specific to them.' : ''}
- Avoid generic questions — make each one feel like it was written for a ${targetRole} at this company
- Randomization token: ${sessionSeed.slice(0, 8)}`,
  };

  const prompt = `You are a ${difficulty}-level technical interviewer at ${targetCompany || 'a top tech company'} interviewing a ${targetRole} candidate.

${profileSection}

${roleContext}

TASK: ${modeInstructions[mode]}

STRICT RULES:
1. Questions must be UNIQUE and SPECIFIC — not generic templates
2. ${resumeText?.trim() ? 'Reference the candidate\'s actual projects/skills/experience by name in at least half the questions' : 'Make questions role-specific and difficulty-appropriate'}
3. Each question should feel like it was written specifically for THIS candidate, THIS role, and THIS company
4. For coding questions: write the COMPLETE problem statement with function signature in ${codeLanguage}
5. If count > 1, questions MUST go from easier to harder — question 1 is the warmup, last is hardest
6. For coding questions: include a CORRECT working model solution in ${codeLanguage} and 3 test cases

Return ONLY a valid JSON array, no markdown, no explanation:
[{
  "id": "unique-id",
  "text": "complete question text with full problem statement, function signature, constraints, and 2+ examples",
  "topicTags": ["specific topic", "subtopic"],
  "companyTags": ["${targetCompany || 'General'}"],
  "expectedDurationSec": ${mode === 'dsa' ? 1200 : mode === 'system_design' ? 1500 : 180},
  "followUpSeeds": ["specific follow-up 1", "specific follow-up 2"],
  "progressionLevel": 1,
  "modelSolution": "CORRECT working solution in ${codeLanguage} — must pass all test cases",
  "testCases": "Input 1: ... → Expected: ...\\nInput 2: ... → Expected: ...\\nInput 3: ... → Expected: ..."
}]`;

    const result = await model.generateContent(prompt);
    let text = (await result.response).text().replace(/```json|```/g, '').trim();

    // Robust JSON extraction
    text = text
      .split('')
      .map((char) => {
        const code = char.charCodeAt(0);
        return code < 32 || code === 127 ? ' ' : char;
      })
      .join('');
    const jsonStart = text.indexOf('[');
    const jsonEnd = text.lastIndexOf(']');
    if (jsonStart === -1 || jsonEnd === -1) throw new Error('No JSON array in response');

    const parsed = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
    if (!Array.isArray(parsed)) throw new Error('Not an array');

    return parsed.map((q: any, i: number) => ({
      id: q.id || `${mode}-${Date.now()}-${i}`,
      text: q.text,
      mode, difficulty,
      topicTags: q.topicTags || (mode === 'dsa' ? selectedTopicGroups[i % selectedTopicGroups.length] : [mode]),
      companyTags: q.companyTags || (targetCompany ? [targetCompany] : []),
      expectedDurationSec: q.expectedDurationSec || (mode === 'dsa' ? 1200 : mode === 'system_design' ? 1500 : 180),
      rubric,
      followUpSeeds: q.followUpSeeds || [],
      answerMethod: answerMethod as any,
      progressionLevel: q.progressionLevel ?? (i + 1),
      modelSolution: q.modelSolution || undefined,
      testCases: q.testCases || undefined,
    }));

  } catch (err) {
    const error = err as Error;
    console.error('[gemini.ts] generateInterviewQuestionsStructured failed:', error.message);
    if (error.message?.includes('429')) console.warn('[gemini.ts] Rate limited — using fallback questions');
    return fallbackQuestions;
  }
}

// ── Fallback question banks (randomized per session) ─────────────────────────
function getFallbackQuestion(mode: InterviewMode, difficulty: Difficulty, index: number, seed: string): string {
  const banks: Record<InterviewMode, Record<Difficulty, string[]>> = {
    dsa: {
      junior: [
        'Given an array of integers, find two numbers that sum to a target value. Return their indices. Optimize for O(n) time using a hash map.\nExample: nums = [2,7,11,15], target = 9 → [0,1]',
        'Given a string, find the length of the longest substring without repeating characters.\nExample: "abcabcbb" → 3 ("abc")',
        'Given a sorted array, remove duplicates in-place and return the new length.\nExample: [1,1,2] → 2, array becomes [1,2,_]',
      ],
      mid: [
        'Design an LRU Cache with O(1) get and put operations. Implement using a doubly linked list and hash map. Support capacity-based eviction.',
        'Given a list of intervals, merge all overlapping intervals and return the result.\nExample: [[1,3],[2,6],[8,10],[15,18]] → [[1,6],[8,10],[15,18]]',
        'Given a binary tree, find the lowest common ancestor of two given nodes.',
      ],
      senior: [
        'Given a binary tree, find the maximum path sum. The path may start and end at any node in the tree.\nExample: [-10,9,20,null,null,15,7] → 42',
        'Implement a data structure that supports: insert(val), delete(val), getRandom() — all in O(1) average time.',
        'Given n non-negative integers representing an elevation map, compute how much water it can trap after raining.',
      ],
      staff: [
        'Design a data structure for a text editor that supports insert, delete, and undo/redo in O(log n) time.',
        'Given a stream of integers, design a data structure that supports: add(num), findMedian() in O(log n) and O(1) respectively.',
        'Implement a distributed consistent hash ring with virtual nodes. Support add/remove nodes with minimal key remapping.',
      ],
    },
    system_design: {
      junior: [
        'Design a URL shortener like bit.ly. Handle 100M URLs, 10B redirects/day. Discuss: hashing strategy, DB schema, caching layer, and redirect latency.',
        'Design a simple key-value store. Support get(key), put(key, value), delete(key). Discuss persistence, in-memory vs disk, and basic replication.',
      ],
      mid: [
        'Design Twitter\'s news feed. 300M users, 500M tweets/day. Discuss: fan-out on write vs read, timeline generation, caching strategy, and eventual consistency.',
        'Design a notification service that sends push, email, and SMS notifications. Handle 10M notifications/day with delivery guarantees.',
      ],
      senior: [
        'Design YouTube\'s video upload and streaming pipeline. Handle 500 hours of video uploaded per minute. Discuss: transcoding, CDN, adaptive bitrate, and storage.',
        'Design a real-time collaborative document editor (like Google Docs). Handle concurrent edits, conflict resolution (OT or CRDT), and offline sync.',
      ],
      staff: [
        'Design a globally distributed database with multi-region writes. Discuss: consensus protocols, conflict resolution, CAP theorem trade-offs, and latency targets.',
        'Design Google Search\'s indexing pipeline. Handle crawling, indexing, ranking, and serving 8.5B searches/day with <200ms p99 latency.',
      ],
    },
    behavioral: {
      junior: [
        'Tell me about a time you had to learn a new technology quickly for a project. How did you approach it and what was the outcome?',
        'Describe a situation where you received critical feedback on your code or work. How did you respond and what did you change?',
        'Tell me about a project you\'re most proud of. What was your specific contribution and what impact did it have?',
      ],
      mid: [
        'Tell me about a time you had to deliver a project under a very tight deadline. What trade-offs did you make and would you make them again?',
        'Describe a situation where you disagreed with a technical decision made by your team or lead. How did you handle it?',
        'Tell me about the most technically complex problem you\'ve solved. Walk me through your debugging process and solution.',
      ],
      senior: [
        'Tell me about a time you had to make a significant architectural decision with incomplete information. What was your process and outcome?',
        'Describe a situation where you had to influence a technical direction without direct authority. How did you build consensus?',
        'Tell me about a time a system you owned failed in production. Walk me through your incident response and what you changed afterward.',
      ],
      staff: [
        'Tell me about a time you drove a major technical initiative that spanned multiple teams. How did you align stakeholders and measure success?',
        'Describe a situation where you had to deprecate or migrate a critical system with zero downtime. What was your strategy?',
        'Tell me about a time you identified a systemic engineering problem in your organization and drove the solution.',
      ],
    },
    project: {
      junior: [
        'Walk me through the architecture of your most complex project. Why did you choose that tech stack over alternatives?',
        'What was the hardest bug you encountered in your main project? How did you debug and resolve it?',
      ],
      mid: [
        'Walk me through the architecture of your most complex project. What were the key design decisions and trade-offs you made?',
        'If you had to scale your main project to 10x the current load, what would you change first and why?',
      ],
      senior: [
        'Walk me through the most architecturally complex system you\'ve built. What were the hardest distributed systems challenges you faced?',
        'Tell me about a time you had to refactor a large codebase or migrate a critical system. What was your strategy and how did you minimize risk?',
      ],
      staff: [
        'Describe the most impactful technical system you\'ve designed. How did you balance short-term delivery with long-term maintainability?',
        'Walk me through a platform or infrastructure decision you made that affected multiple teams. How did you evaluate the trade-offs?',
      ],
    },
    hr: {
      junior: [
        'Why are you interested in this role, and how does it connect to your career goals for the next 2-3 years?',
        'What\'s a technical skill you\'re actively working to improve right now? What\'s your learning approach?',
        'How do you prefer to receive feedback, and can you give an example of feedback that changed how you work?',
      ],
      mid: [
        'Where do you see yourself in 3-5 years, and how does this role fit into that path?',
        'What\'s your biggest technical weakness, and what concrete steps are you taking to address it?',
        'Describe your ideal engineering team culture. What environment helps you do your best work?',
      ],
      senior: [
        'How do you balance technical excellence with shipping velocity? Give a specific example of a trade-off you navigated.',
        'What\'s your philosophy on technical debt? How do you decide when to pay it down vs. ship new features?',
        'How do you approach mentoring junior engineers? What\'s the most impactful thing you\'ve done to grow someone on your team?',
      ],
      staff: [
        'How do you define engineering excellence at the staff level? How do you raise the bar across an organization?',
        'Describe your approach to building technical strategy. How do you align engineering direction with business goals?',
        'What\'s the most important lesson you\'ve learned about leading large-scale technical change?',
      ],
    },
  };

  const modeBank = banks[mode];
  const diffBank = modeBank[difficulty] ?? modeBank.mid;
  // Use seed to pick a random starting offset so same difficulty doesn't always give Q1
  const offset = Math.abs(seed.charCodeAt(0) + seed.charCodeAt(1)) % diffBank.length;
  return diffBank[(index + offset) % diffBank.length];
}

export async function evaluateAnswerWithRubric(params: {
  question: QuestionMetadata;
  answer: string;
  codeSubmission?: string;
  codeOutput?: string;
  mode: InterviewMode;
  difficulty: Difficulty;
  resumeContext?: string;
}): Promise<QuestionEvaluation> {
  const { question, answer, codeSubmission, codeOutput, mode, difficulty, resumeContext } = params;

  const wordCount = answer?.trim().split(/\s+/).filter(Boolean).length || 0;
  const hasCode = !!(codeSubmission?.trim());
  const hasVoice = wordCount >= 5;

  // For DSA: code IS the primary answer — only fall back if both are missing
  const isDSA = mode === 'dsa';
  const isEmpty = isDSA ? (!hasCode && !hasVoice) : (wordCount === 0);
  // Too short: for DSA only if no code at all; for others if < 10 words
  const isTooShort = isDSA ? false : (wordCount < 10);

  const emptyFallback: QuestionEvaluation = {
    questionId: question.id,
    answer,
    answerMethod: question.answerMethod,
    codeSubmission,
    durationSec: 0,
    rubricScores: question.rubric.map(r => ({
      criterion: r.criterion,
      score: isEmpty ? 0 : 1,
      rationale: isEmpty ? 'No answer provided.' : 'Answer too brief to evaluate meaningfully.',
      quote: undefined,
    })),
    overallScore: isEmpty ? 0 : 1,
    technicalDepthScore: 0,
    strengths: isEmpty ? ['Attempted to start the interview.'] : ['Provided a very brief response.'],
    improvements: [
      isDSA ? 'Write actual code — even a brute-force solution is better than nothing.' : 'Provide a complete, structured answer.',
      'Explain your reasoning step by step.',
      'Include concrete examples from your experience.',
    ],
    modelAnswer: question.modelSolution
      ? `Reference solution:\n${question.modelSolution}`
      : 'A strong answer would directly address the question with technical depth, concrete examples, and clear reasoning.',
    hireSignal: 'strong_no',
  };

  if (!API_KEY) return emptyFallback;
  if (isEmpty || isTooShort) return emptyFallback;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const rubricText = question.rubric.map(r => `- ${r.criterion} (${Math.round(r.weight * 100)}%): ${r.description}`).join('\n');

    // Build code section — include output and model solution for comparison
    let codeSection = '';
    if (hasCode) {
      codeSection = `
CANDIDATE CODE (${codeSubmission!.split('\n').length} lines):
\`\`\`
${codeSubmission!.slice(0, 3000)}
\`\`\`
CODE EXECUTION OUTPUT: ${codeOutput?.trim() || 'Not executed / no output'}`;

      if (question.modelSolution) {
        codeSection += `

REFERENCE SOLUTION (for correctness comparison only — do not reveal to candidate):
\`\`\`
${question.modelSolution.slice(0, 2000)}
\`\`\``;
      }
      if (question.testCases) {
        codeSection += `

TEST CASES:
${question.testCases}`;
      }
    }

    const prompt = `You are a strict ${difficulty}-level technical interviewer. Evaluate this answer HONESTLY and ACCURATELY.

QUESTION:
${question.text}

RUBRIC (score each 0–10):
${rubricText}

${wordCount > 0 ? `CANDIDATE VERBAL ANSWER (${wordCount} words):\n"${answer.slice(0, 2000)}"` : 'No verbal answer provided.'}
${codeSection}
${resumeContext ? `\nCANDIDATE BACKGROUND: ${resumeContext.slice(0, 300)}` : ''}

EVALUATION RULES:
${isDSA ? `
DSA-SPECIFIC RULES:
- The CODE is the primary answer. Evaluate correctness by comparing logic to the reference solution and test cases.
- If code output matches expected output → Correctness score 8–10
- If code has the right approach but minor bugs → Correctness score 5–7
- If code is completely wrong approach → Correctness score 0–3
- If no code submitted → Correctness score 0, Code Quality score 0
- "Hello" or placeholder text as verbal answer is fine if the code is correct — do NOT penalize verbal for DSA
- Score Algorithm Choice based on time/space complexity of their approach vs optimal
- Score Complexity Analysis based on whether they explained Big-O (in code comments or verbal)
` : `
GENERAL RULES:
- A one-liner or name mention = 1–2. Do NOT give 5 for minimal effort.
- A partial answer missing key concepts = 3–5.
- A complete answer with examples but missing depth = 6–7.
- A thorough answer with trade-offs and examples = 8–9.
- An exceptional answer = 10.
- Off-topic or irrelevant = 0–1.
`}
- NEVER give 5 as a default. Score based on actual content.
- Strengths and improvements must reference SPECIFIC things from their answer/code, not generic phrases.

Return ONLY valid JSON (no markdown):
{
  "rubricScores": [
    { "criterion": "exact criterion name", "score": 0-10, "rationale": "1 specific sentence about what they did or missed", "quote": "exact quote from answer/code or null" }
  ],
  "overallScore": 0-10,
  "technicalDepthScore": 0-10,
  "strengths": ["specific strength with evidence from their answer"],
  "improvements": ["specific actionable improvement — what exactly was missing or wrong"],
  "modelAnswer": "What a strong ${difficulty} answer looks like — 100-150 words, concrete and specific${isDSA ? ', include the optimal approach and complexity' : ''}",
  "codeCorrectness": ${isDSA ? '"correct|partial|incorrect|not_submitted"' : 'null'},
  "followUpQuestion": "One follow-up probing the weakest part, or null if score >= 8",
  "hireSignal": "strong_yes|yes|lean_yes|no|strong_no"
}`;

    const result = await model.generateContent(prompt);
    const raw = (await result.response).text().replace(/```json|```/g, '').trim();

    // Robust JSON parse
    const jsonStart = raw.indexOf('{');
    const jsonEnd = raw.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) throw new Error('No JSON in response');
    const parsed = JSON.parse(raw.substring(jsonStart, jsonEnd + 1));

    // Score sanity: don't let AI give high scores for trivially short verbal answers on non-DSA
    let overallScore = parsed.overallScore ?? 3;
    if (!isDSA && wordCount < 20 && overallScore > 3) overallScore = Math.min(overallScore, 3);
    if (!isDSA && wordCount < 5 && overallScore > 1) overallScore = 1;

    return {
      questionId: question.id,
      answer,
      answerMethod: question.answerMethod,
      codeSubmission,
      durationSec: 0,
      rubricScores: parsed.rubricScores || emptyFallback.rubricScores,
      overallScore,
      technicalDepthScore: parsed.technicalDepthScore ?? Math.min(overallScore, 5),
      strengths: parsed.strengths?.length ? parsed.strengths : emptyFallback.strengths,
      improvements: parsed.improvements?.length ? parsed.improvements : emptyFallback.improvements,
      modelAnswer: parsed.modelAnswer || emptyFallback.modelAnswer,
      followUpQuestion: parsed.followUpQuestion || undefined,
      hireSignal: parsed.hireSignal || 'no',
    };
  } catch (err) {
    console.error('evaluateAnswerWithRubric failed:', err);
    return emptyFallback;
  }
}

export async function analyzeSTAR(answer: string): Promise<STARAnalysis> {
  const fallback: STARAnalysis = {
    situation: { present: false, quality: 0, extract: '' },
    task: { present: false, quality: 0, extract: '' },
    action: { present: false, quality: 0, extract: '' },
    result: { present: false, quality: 0, extract: '' },
    overallSTARScore: 0,
    missing: ['situation', 'task', 'action', 'result'],
  };

  if (!API_KEY || !answer?.trim()) return fallback;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Analyze this behavioral interview answer for STAR structure.

ANSWER: "${answer.slice(0, 1500)}"

Return ONLY valid JSON:
{
  "situation": { "present": true/false, "quality": 0-10, "extract": "relevant quote or empty string" },
  "task": { "present": true/false, "quality": 0-10, "extract": "relevant quote or empty string" },
  "action": { "present": true/false, "quality": 0-10, "extract": "relevant quote or empty string" },
  "result": { "present": true/false, "quality": 0-10, "extract": "relevant quote or empty string" },
  "overallSTARScore": 0-10,
  "missing": ["list of missing components"]
}`;

    const result = await model.generateContent(prompt);
    const text = (await result.response).text().replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

export async function generateAIInterviewerMessage(context: {
  phase: string;
  mode: InterviewMode;
  questionText?: string;
  answerSummary?: string;
  targetRole: string;
}): Promise<string> {
  const { phase, mode, questionText, answerSummary, targetRole } = context;

  const hardcoded: Record<string, string> = {
    briefing: `Welcome! I'm Aria. Let's begin your ${mode.replace('_', ' ')} round for the ${targetRole} role. Take your time reading each question carefully.`,
    thinking: "Take your time. Think through your approach before you start.",
    follow_up: "Interesting — I'd like to dig a bit deeper on that.",
    between_questions: "Got it. Let's move to the next question.",
    round_complete: "That wraps up this round. You did well — let's review your performance.",
  };

  if (!API_KEY) return hardcoded[phase] || "Let's continue.";

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are Aria, a senior engineer conducting a ${mode.replace('_', ' ')} interview for a ${targetRole} role.
Current phase: ${phase}
${questionText ? `Question just asked: "${questionText.slice(0, 200)}"` : ''}
${answerSummary ? `Candidate just answered about: "${answerSummary.slice(0, 200)}"` : ''}

Write ONE short, natural interviewer line (max 20 words) appropriate for this phase.
Sound human, professional, and encouraging but not sycophantic.
Return ONLY the line, no quotes, no explanation.`;

    const result = await model.generateContent(prompt);
    const text = (await result.response).text().trim();
    return text.length > 5 ? text : hardcoded[phase] || "Let's continue.";
  } catch {
    return hardcoded[phase] || "Let's continue.";
  }
}
