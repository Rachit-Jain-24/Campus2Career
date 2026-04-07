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

export async function generateInterviewQuestionsStructured(params: {
  mode: InterviewMode;
  difficulty: Difficulty;
  targetRole: string;
  targetCompany: string;
  resumeText: string;
  count: number;
}): Promise<QuestionMetadata[]> {
  const { mode, difficulty, targetRole, targetCompany, resumeText, count } = params;
  const rubric = RUBRICS[mode];
  const modeLabel = { dsa: 'DSA/Coding', system_design: 'System Design', behavioral: 'Behavioral', project: 'Project Deep-Dive', hr: 'HR' }[mode];
  const answerMethod = mode === 'dsa' ? 'voice_and_code' : mode === 'system_design' ? 'text' : 'voice';

  const fallbackQuestions: QuestionMetadata[] = Array.from({ length: count }, (_, i) => ({
    id: `${mode}-${i}`,
    text: getFallbackQuestion(mode, difficulty, i),
    mode, difficulty,
    topicTags: [mode],
    companyTags: targetCompany ? [targetCompany] : [],
    expectedDurationSec: mode === 'dsa' ? 1200 : mode === 'system_design' ? 1500 : 180,
    rubric,
    followUpSeeds: [],
    answerMethod: answerMethod as any,
  }));

  if (!API_KEY) return fallbackQuestions;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const resumeSection = resumeText?.trim()
      ? `CANDIDATE RESUME / PROFILE (read every word carefully):
\`\`\`
${resumeText.slice(0, 6000)}
\`\`\`

Before generating questions, mentally extract:
- Every project name and what it does
- Every technology/framework mentioned
- Every company/internship and the role
- Every certification or achievement

Your questions MUST reference these specific items by name.`
      : 'No resume provided. Generate role-specific questions based on the target role.';

    const prompt = `You are a ${difficulty}-level interviewer at ${targetCompany || 'a top tech company'} conducting a ${modeLabel} interview for a ${targetRole} role.

${resumeSection}

Generate exactly ${count} interview question(s) for a ${difficulty} ${modeLabel} interview.

Rules:
- Questions must match ${difficulty} difficulty precisely
- ${resumeText?.trim()
  ? `CRITICAL: You MUST read the resume/profile above carefully. Every question must reference something SPECIFIC from it — a project name, a technology they listed, a company they interned at, or a skill they mentioned. Do NOT ask generic questions that could apply to any candidate. If they listed a project called "X", ask about X specifically. If they used React, ask about their React experience specifically.`
  : 'Use industry-standard questions for this role and difficulty level.'}
- For DSA: include the actual problem statement with constraints and examples
- For System Design: specify scale requirements (e.g., "design for 10M users")
- For Behavioral: use STAR-eliciting phrasing ("Tell me about a time when...")
- Questions must be progressively harder if count > 1

Return ONLY valid JSON array:
[{
  "id": "unique-id",
  "text": "full question text",
  "topicTags": ["tag1", "tag2"],
  "companyTags": ["${targetCompany || 'General'}"],
  "expectedDurationSec": 180,
  "followUpSeeds": ["follow-up seed 1", "follow-up seed 2"]
}]`;

    const result = await model.generateContent(prompt);
    const text = (await result.response).text().replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) throw new Error('Not array');

    return parsed.map((q: any, i: number) => ({
      id: q.id || `${mode}-${Date.now()}-${i}`,
      text: q.text,
      mode, difficulty,
      topicTags: q.topicTags || [mode],
      companyTags: q.companyTags || [],
      expectedDurationSec: q.expectedDurationSec || 180,
      rubric,
      followUpSeeds: q.followUpSeeds || [],
      answerMethod: answerMethod as any,
    }));
  } catch (err) {
    console.error('generateInterviewQuestionsStructured failed:', err);
    return fallbackQuestions;
  }
}

function getFallbackQuestion(mode: InterviewMode, difficulty: Difficulty, index: number): string {
  const banks: Record<InterviewMode, string[]> = {
    dsa: [
      'Given an array of integers, find two numbers that sum to a target value. Return their indices. Optimize for O(n) time.',
      'Design an LRU Cache with O(1) get and put operations. Implement using a doubly linked list and hash map.',
      'Given a binary tree, find the maximum path sum. The path may start and end at any node.',
    ],
    system_design: [
      'Design a URL shortener like bit.ly. Handle 100M URLs, 10B redirects/day. Focus on scalability and low latency.',
      'Design Twitter\'s news feed. 300M users, 500M tweets/day. Discuss fan-out strategies and caching.',
      'Design a distributed rate limiter for an API gateway handling 1M requests/second.',
    ],
    behavioral: [
      'Tell me about a time you had to deliver a project under a very tight deadline. What trade-offs did you make?',
      'Describe a situation where you disagreed with your tech lead\'s architectural decision. How did you handle it?',
      'Tell me about the most technically complex problem you\'ve solved. Walk me through your approach.',
    ],
    project: [
      'Walk me through the architecture of your most complex project. Why did you choose that tech stack?',
      'What was the hardest technical challenge in your main project? How did you debug and resolve it?',
      'If you had to scale your project to 10x the current load, what would you change first?',
    ],
    hr: [
      'Why are you interested in this role, and how does it align with your 3-year career goal?',
      'What\'s your biggest technical weakness, and what are you actively doing to improve it?',
      'Describe your ideal engineering team culture. What makes you thrive?',
    ],
  };
  const list = banks[mode];
  return list[index % list.length];
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
  const hasCode = !!codeSubmission?.trim();
  const isEmpty = wordCount === 0 && !hasCode;
  const isTooShort = wordCount < 10 && !hasCode;

  // Honest fallback — empty = 0, too short = 1-2, no API key = honest low score
  const emptyFallback: QuestionEvaluation = {
    questionId: question.id,
    answer,
    answerMethod: question.answerMethod,
    codeSubmission,
    durationSec: 0,
    rubricScores: question.rubric.map(r => ({ criterion: r.criterion, score: isEmpty ? 0 : 1, rationale: isEmpty ? 'No answer provided.' : 'Answer too brief to evaluate meaningfully.', quote: undefined })),
    overallScore: isEmpty ? 0 : 1,
    technicalDepthScore: 0,
    strengths: isEmpty ? ['Attempted to start the interview.'] : ['Provided a very brief response.'],
    improvements: [
      'Provide a complete, structured answer.',
      'Explain your reasoning step by step.',
      'Include concrete examples from your experience.',
    ],
    modelAnswer: 'A strong answer would directly address the question with technical depth, concrete examples, and clear reasoning.',
    hireSignal: 'strong_no',
  };

  if (!API_KEY) return emptyFallback;
  if (isEmpty || isTooShort) return emptyFallback;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const rubricText = question.rubric.map(r => `- ${r.criterion} (${Math.round(r.weight * 100)}%): ${r.description}`).join('\n');

    const prompt = `You are a strict senior ${difficulty} engineer conducting a real interview. Your job is to evaluate this answer HONESTLY — not to encourage the candidate.

QUESTION: ${question.text}

RUBRIC (score each criterion 0–10):
${rubricText}

CANDIDATE ANSWER (${wordCount} words):
"${answer.slice(0, 2000)}"
${codeSubmission ? `\nCANDIDATE CODE:\n${codeSubmission}\n\nCODE OUTPUT:\n${codeOutput || 'Not executed'}` : ''}
${resumeContext ? `\nRESUME CONTEXT: ${resumeContext.slice(0, 400)}` : ''}

STRICT SCORING RULES:
- A one-liner or name mention = 1–2 out of 10. Do NOT give 5 for minimal effort.
- Mentioning a project name without explaining it = 2–3 out of 10.
- A partial answer missing key concepts = 3–5 out of 10.
- A complete answer with examples but missing depth = 6–7 out of 10.
- A thorough answer with trade-offs and examples = 8–9 out of 10.
- An exceptional answer covering edge cases and alternatives = 10 out of 10.
- If the answer is off-topic or irrelevant = 0–1 out of 10.
- NEVER give 5 as a default. Score based on actual content quality.

Return ONLY valid JSON (no markdown, no preamble):
{
  "rubricScores": [
    { "criterion": "exact criterion name", "score": 0-10, "rationale": "1 specific sentence referencing what they said", "quote": "exact quote from answer or null" }
  ],
  "overallScore": 0-10,
  "technicalDepthScore": 0-10,
  "strengths": ["specific strength referencing actual content — not generic praise"],
  "improvements": ["specific actionable improvement — what exactly was missing"],
  "modelAnswer": "What a strong ${difficulty} answer looks like — 100-150 words, concrete and specific",
  "followUpQuestion": "One follow-up question probing the weakest part of their answer, or null if score >= 8",
  "hireSignal": "strong_yes|yes|lean_yes|no|strong_no"
}`;

    const result = await model.generateContent(prompt);
    const text = (await result.response).text().replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);

    // Sanity check: if Gemini returns 5 for a one-liner, override it
    let overallScore = parsed.overallScore ?? 3;
    if (wordCount < 20 && overallScore > 3) overallScore = Math.min(overallScore, 3);
    if (wordCount < 5 && overallScore > 1) overallScore = 1;

    return {
      questionId: question.id,
      answer,
      answerMethod: question.answerMethod,
      codeSubmission,
      durationSec: 0,
      rubricScores: parsed.rubricScores || emptyFallback.rubricScores,
      overallScore,
      technicalDepthScore: parsed.technicalDepthScore ?? Math.min(overallScore, 5),
      strengths: parsed.strengths || emptyFallback.strengths,
      improvements: parsed.improvements || emptyFallback.improvements,
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
