
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { 
    Syllabus, 
    AcademicModule, 
    AcademicNote, 
    AcademicQuiz, 
    Flashcard, 
    RevisionPlan,
    Difficulty
} from "../../types/copilot";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * AI Academic Copilot Engine
 * 
 * Supports Groq (Primary) and Gemini (Fallback).
 */
export const copilotEngine = {
    /**
     * Unified LLM Call Helper
     */
    async callLLM(prompt: string, options: { json?: boolean } = {}): Promise<string> {
        // Try Gemini 2.0 Flash First (User Preferred)
        if (GEMINI_API_KEY) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
                const result = await model.generateContent(prompt);
                const text = (await result.response).text().replace(/```json|```/g, "").trim();
                if (text) return text;
            } catch (error) {
                console.warn("Gemini 2.0 call failed, falling back to Groq:", error);
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
                        response_format: options.json ? { type: "json_object" } : undefined
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    return data.choices[0].message.content;
                }
            } catch (error) {
                console.error("Groq fallback failed:", error);
            }
        }

        throw new Error("No AI API keys configured or models failed.");
    },

    /**
     * Parse raw syllabus text into structured modules.
     */
    async parseSyllabus(rawText: string, courseName: string, semester: number): Promise<Syllabus> {
        const prompt = `
            You are an expert academic advisor. Parse the following raw syllabus text into a structured JSON format.
            Extract modules, topics within each module, and estimate weightage if mentioned.

            COURSE: ${courseName}
            SEMESTER: ${semester}
            SYLLABUS TEXT:
            ${rawText.slice(0, 8000)}

            Return ONLY a valid JSON object of type Syllabus:
            {
                "courseName": "${courseName}",
                "semester": ${semester},
                "modules": [
                    {
                        "id": "module-1",
                        "name": "string",
                        "description": "string",
                        "topics": ["topic1", "topic2"],
                        "weightage": number
                    }
                ]
            }
        `;

        const text = await this.callLLM(prompt, { json: true });
        const parsed = JSON.parse(text);

        return {
            ...parsed,
            id: `syllabus-${Date.now()}`,
            rawText,
            uploadedAt: new Date().toISOString()
        };
    },

    /**
     * Generate comprehensive study notes for a specific module.
     */
    async generateNotes(syllabus: Syllabus, module: AcademicModule): Promise<AcademicNote> {
        const prompt = `
            Generate detailed, exam-oriented study notes for the following module from the ${syllabus.courseName} syllabus.
            MODULE: ${module.name}
            TOPICS: ${module.topics.join(", ")}

            Include technical explanations, code snippets (if relevant), and clear headings.
            Format the content in Markdown.

            Return ONLY valid JSON:
            {
                "title": "${module.name} Notes",
                "content": "markdown string",
                "keyTakeaways": ["point1", "point2"]
            }
        `;

        const text = await this.callLLM(prompt, { json: true });
        const parsed = JSON.parse(text);

        return {
            ...parsed,
            id: `note-${Date.now()}`,
            moduleId: module.id,
            generatedAt: new Date().toISOString()
        };
    },

    /**
     * Generate a quiz based on syllabus modules.
     */
    async generateQuiz(syllabus: Syllabus, modules: AcademicModule[], difficulty: Difficulty = 'medium'): Promise<AcademicQuiz> {
        const prompt = `
            Create a ${difficulty} difficulty quiz for the following academic modules.
            COURSE: ${syllabus.courseName}
            MODULES: ${modules.map(m => m.name).join(", ")}

            Generate 10 multiple-choice questions total.
            Return ONLY valid JSON:
            {
                "title": "${syllabus.courseName} Practice Quiz",
                "questions": [
                    {
                        "id": "q1",
                        "question": "string",
                        "options": ["A", "B", "C", "D"],
                        "correctAnswer": 0,
                        "explanation": "string",
                        "difficulty": "${difficulty}"
                    }
                ]
            }
        `;

        const text = await this.callLLM(prompt, { json: true });
        const parsed = JSON.parse(text);

        return {
            ...parsed,
            id: `quiz-${Date.now()}`,
            moduleId: modules[0].id,
            generatedAt: new Date().toISOString()
        };
    },

    /**
     * Generate a personalized revision plan.
     */
    async generateRevisionPlan(syllabus: Syllabus, examDate: string): Promise<RevisionPlan> {
        const prompt = `
            Create a daily revision plan for the ${syllabus.courseName} course.
            EXAM DATE: ${examDate}
            TODAY: ${new Date().toISOString().split('T')[0]}
            SYLLABUS MODULES: ${syllabus.modules.map(m => m.name).join(", ")}

            Deduce the best sequence to cover all modules before the exam.
            Return ONLY valid JSON:
            {
                "startDate": "${new Date().toISOString().split('T')[0]}",
                "endDate": "${examDate}",
                "milestones": [
                    {
                        "date": "string",
                        "activity": "string",
                        "moduleId": "string",
                        "isCompleted": false
                    }
                ]
            }
        `;

        const text = await this.callLLM(prompt, { json: true });
        const parsed = JSON.parse(text);

        return {
            ...parsed,
            id: `plan-${Date.now()}`,
            studentId: syllabus.studentId || "guest"
        };
    },

    /**
     * Generate interactive flashcards for a module.
     */
    async generateFlashcards(syllabus: Syllabus, module: AcademicModule): Promise<Flashcard[]> {
        const prompt = `
            Create 10 high-impact flashcards for the following module from the ${syllabus.courseName} course.
            MODULE: ${module.name}
            TOPICS: ${module.topics.join(", ")}

            Return ONLY valid JSON array:
            [
                {
                    "question": "string",
                    "answer": "string",
                    "difficulty": "medium"
                }
            ]
        `;

        const text = await this.callLLM(prompt, { json: true });
        let parsed = JSON.parse(text);
        
        // Handle variations in JSON structure if needed
        if (parsed.flashcards) parsed = parsed.flashcards;

        return (Array.isArray(parsed) ? parsed : []).map((f: any, i: number) => ({
            ...f,
            id: f.id || `flashcard-${Date.now()}-${i}`,
            moduleId: module.id
        }));
    },

    /**
     * Generate notes directly from a subject name and context.
     */
    async generateNotesDirect(subject: string, context: string): Promise<AcademicNote> {
        const prompt = `
            Generate high-impact study notes for the subject: ${subject}.
            CONTEXT: ${context}
            
            Include key concepts, technical details, and industry applications.
            Format in beautiful Markdown with clear sections.
            
            Return ONLY valid JSON:
            {
                "title": "${subject} Mastery Notes",
                "modules": [
                    { "title": "Section Title", "content": "Detailed markdown content" }
                ]
            }
        `;

        const text = await this.callLLM(prompt, { json: true });
        const parsed = JSON.parse(text);

        return {
            ...parsed,
            id: `note-direct-${Date.now()}`,
            moduleId: "direct",
            generatedAt: new Date().toISOString()
        };
    },

    /**
     * Generate a quiz directly from a subject name.
     */
    async generateQuizDirect(subject: string, count: number = 5): Promise<AcademicQuiz> {
        const prompt = `
            Create a ${count}-question technical quiz for the subject: ${subject}.
            
            Return ONLY valid JSON:
            {
                "title": "${subject} Quiz",
                "questions": [
                    {
                        "question": "string",
                        "options": ["A", "B", "C", "D"],
                        "correctAnswer": 0,
                        "explanation": "string"
                    }
                ]
            }
        `;

        const text = await this.callLLM(prompt, { json: true });
        const parsed = JSON.parse(text);

        return {
            ...parsed,
            id: `quiz-direct-${Date.now()}`,
            moduleId: "direct",
            generatedAt: new Date().toISOString()
        };
    }
};
