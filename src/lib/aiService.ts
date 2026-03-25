import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const generateStudentBio = async (studentData: {
    name: string;
    program: string;
    year: number;
    skills: string[];
    interests: string[];
}) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are a professional career coach at NMIMS Hyderabad.
            Generate a sharp, 3-sentence professional bio for a student based on:
            Name: ${studentData.name}
            Program: ${studentData.program} (${studentData.year}nd/rd/th year)
            Skills: ${studentData.skills.join(", ")}
            Interests: ${studentData.interests.join(", ")}

            Rules:
            1. Professional and ambitious tone.
            2. High-impact keywords for LinkedIn/ATS.
            3. Mention NMIMS Hyderabad explicitly.
            4. Keep it exactly 3 sentences.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("AI Bio Error:", error);
        
        // Dynamic Fallback Templates (Local AI)
        const templates = [
            `Passionate ${studentData.program} student at NMIMS Hyderabad with strong foundations in ${studentData.skills.slice(0, 2).join(" & ") || "engineering"}. Focused on career growth in ${studentData.interests[0] || "technology"} and building scalable solutions. Committed to professional excellence and continuous skill-building.`,
            `Currently pursuing ${studentData.program} at NMIMS, I am focused on mastering ${studentData.skills.join(", ") || "core technical systems"}. My goal is to leverage my ${studentData.interests[0] || "problem-solving"} skills for impactful industry projects. Dedicated to impactful software development and innovation.`,
            `Aspiring ${studentData.interests[0] || "professional"} at NMIMS Hyderabad with a solid grasp of ${studentData.skills[0] || "technology"}. Leveraging a combination of academic excellence and project experience to solve real-world problems. Driven by a passion for industry-level engineering and design.`
        ];
        
        return templates[Math.floor(Math.random() * templates.length)];
    }
};
