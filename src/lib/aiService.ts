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
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
        console.error("Bio Generation Error:", error);
        
        // Dynamic Fallback Templates (Local AI)
        const templates = [
            `Passionate ${studentData.program} student at NMIMS Hyderabad with strong foundations in ${studentData.skills.slice(0, 2).join(" & ") || "engineering"}. Focused on career growth in ${studentData.interests[0] || "technology"} and building scalable solutions. Committed to professional excellence and continuous skill-building.`,
            `Currently pursuing ${studentData.program} at NMIMS, I am focused on mastering ${studentData.skills.join(", ") || "core technical systems"}. My goal is to leverage my ${studentData.interests[0] || "problem-solving"} skills for impactful industry projects. Dedicated to impactful software development and innovation.`,
            `Aspiring ${studentData.interests[0] || "professional"} at NMIMS Hyderabad with a solid grasp of ${studentData.skills[0] || "technology"}. Leveraging a combination of academic excellence and project experience to solve real-world problems. Driven by a passion for industry-level engineering and design.`
        ];
        
        return templates[Math.floor(Math.random() * templates.length)];
    }
};
export const generateSWOC = async (studentData: any) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
            You are an expert career counselor at NMIMS Hyderabad.
            Perform a professional SWOC (Strengths, Weaknesses, Opportunities, Challenges) analysis for a student.
            
            Student Profile:
            - Name: ${studentData.name}
            - Program: ${studentData.branch || 'B.Tech CSE'}
            - Year: ${studentData.currentYear}
            - CGPA: ${studentData.cgpa}
            - Skills: ${studentData.techSkills?.join(", ") || "None listed"}
            - Projects: ${studentData.projects?.length || 0} projects
            - Internships: ${studentData.internships?.length || 0} internships
            - LeetCode Solved: ${studentData.leetcodeStats?.totalSolved || 0}
            - Assessment Mood: ${studentData.assessmentResults?.careerTrack || "Not assessment completed"}

            Return the response in STICK JSON format with these exact keys:
            {
                "strengths": ["string", "string", "string"],
                "weaknesses": ["string", "string", "string"],
                "opportunities": ["string", "string", "string"],
                "challenges": ["string", "string", "string"],
                "summary": "A 2-sentence summary of the student's current placement readiness."
            }

            Guidelines:
            1. Be specific to NMIMS Hyderabad context.
            2. Strengths should highlight technical and academic wins.
            3. Weaknesses should be constructive (e.g., "Lack of advanced cloud experience" vs "bad at cloud").
            4. Opportunities should mention specific industry trends or roles.
            5. Challenges should mention competition or specific skill gaps relative to Year ${studentData.currentYear}.
            6. Each list should have 3-4 high-quality points.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();
        
        // Clean markdown if present
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(text);
    } catch (error) {
        console.error("SWOC Generation Error:", error);
        
        // Dynamic Fallback
        return {
            strengths: [
                `Strong academic foundation with CGPA ${studentData.cgpa}`,
                "Proven aptitude in " + (studentData.techSkills?.[0] || "core engineering"),
                "High potential for technical roles"
            ],
            weaknesses: [
                "Practical project experience could be expanded",
                "Needs to improve problem solving on platforms like LeetCode",
                "Communication skills refinement for interviews"
            ],
            opportunities: [
                "Rising demand for engineers in " + (studentData.careerTrack || "Technology"),
                "Campus placements at NMIMS Hyderabad",
                "Upskilling in AI/ML and Cloud technologies"
            ],
            challenges: [
                "Intense competition for top-tier product roles",
                "Staying updated with rapidly changing tech stacks",
                "Balancing core academics with placement prep"
            ],
            summary: `${studentData.name} is a promising candidate with a solid CGPA. Focusing on building 1-2 hero projects will significantly boost placement chances.`
        };
    }
};

export const generateBatchSWOC = async (batchSummary: any) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
            You are a placement director at NMIMS Hyderabad.
            Perform a strategic SWOC analysis for a BATCH of students.
            
            Batch Metrics:
            - Total Students: ${batchSummary.total}
            - Average CGPA: ${batchSummary.avgCgpa.toFixed(2)}
            - Top Skills: ${batchSummary.topSkills.join(", ")}
            - Placement Rate: ${batchSummary.placementRate}%
            - Internship Completion: ${batchSummary.internshipRate || 0}%
            - Career Tracks: ${batchSummary.careerTracks.join(", ")}

            Return the response in STICK JSON format with these exact keys:
            {
                "strengths": ["string", "string", "string"],
                "weaknesses": ["string", "string", "string"],
                "opportunities": ["string", "string", "string"],
                "challenges": ["string", "string", "string"],
                "strategicAdvice": "A 3-sentence high-level advice for the Program Chair/Faculty to improve placement outcomes."
            }

            Guidelines:
            1. Focus on collective batch performance and gaps.
            2. Strengths should highlight the batch's competitive edge.
            3. Weaknesses should identify collective skill gaps.
            4. Opportunities should focus on industry partnerships and upcoming drives.
            5. Challenges should mention market trends and competition from other institutes.
            6. Tone should be professional, data-driven, and strategic.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(text);
    } catch (error) {
        console.error("Batch Analysis Error:", error);
        return {
            strengths: ["Strong academic consistency in core subjects", "Healthy mix of diverse career tracks", "Foundational knowledge in trending skills"],
            weaknesses: ["Project-to-theory ratio needs improvement", "Limited industry-validated certifications", "Variable LeetCode activity across the batch"],
            opportunities: ["Upskilling in niche tech roles", "Early internship drive seasonal window", "Direct alumni-network referrals"],
            challenges: ["Rapidly changing industry requirements", "Intense competition for high-package roles", "Market saturation in entry-level frontend roles"],
            strategicAdvice: "Focus on organizing 1-2 hackathons to boost practical project experience. Encourage mandatory LeetCode streaks for Year 3 students. Leverage NMIMS brand for more corporate mock interview sessions."
        };
    }
};
