
import { callOpenRouter } from "../openRouter";
import type { 
    Syllabus, 
    AcademicModule, 
    AcademicNote, 
    AcademicQuiz, 
    Flashcard, 
    RevisionPlan,
    Difficulty
} from "../../types/copilot";

/**
 * AI Academic Copilot Engine
 * 
 * Uses OpenRouter API with multiple free model fallback
 */
export const copilotEngine = {
    /**
     * Unified LLM Call Helper - OpenRouter with model fallback
     */
    async callLLM(prompt: string, options: { json?: boolean } = {}): Promise<string> {
        return callOpenRouter(prompt, options);
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
        try {
            const prompt = `Create comprehensive, professional study notes for: ${subject}

Context: ${context}

Requirements:
1. EXTENSIVE THEORY: Provide deep theoretical foundations, mathematical underpinnings, and academic rigor
2. Structure content with clear headings and subheadings (no markdown symbols like ** or *)
3. Include detailed definitions, theorems, proofs where applicable
4. Add "References" section with credible academic sources (textbooks, research papers, IEEE/ACM papers)
5. Include "Industry Applications" section with real-world use cases
6. Add "Common Interview Questions" section with theoretical and practical questions
7. Use clean formatting with proper spacing

Format as clean text with comprehensive sections:
- Overview (definition, scope, importance in CS)
- Theoretical Foundations (mathematical basis, formal definitions, theorems)
- Core Concepts (in-depth explanation with examples)
- Types/Classifications (categories with detailed descriptions)
- Algorithms & Methods (step-by-step procedures, complexity analysis)
- Key Terminology (glossary of important terms)
- Mathematical Formulations (equations, proofs where relevant)
- Implementation Details (pseudocode, design patterns)
- Best Practices (industry standards, optimization techniques)
- Industry Applications (case studies from Google, Amazon, Microsoft, etc.)
- Common Interview Questions (theoretical + coding problems)
- Further Reading (academic papers, textbooks, online courses)
- References (cite IEEE papers, ACM publications, Stanford/MIT course materials)

Return ONLY valid JSON:
{"title":"${subject} - Complete Study Guide","modules":[{"title":"Overview","content":"..."},{"title":"Theoretical Foundations","content":"..."},{"title":"Core Concepts","content":"..."},{"title":"Algorithms and Methods","content":"..."},{"title":"Industry Applications","content":"..."},{"title":"Interview Preparation","content":"..."},{"title":"References","content":"1. Source Name...\n2. Source Name..."}]}`;

            let text = await this.callLLM(prompt, { json: true });
            
            // Clean up the response - extract JSON if wrapped in code blocks
            text = text.replace(/```json\s*|\s*```/g, '').trim();
            
            // Try to find JSON object in the text
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                text = jsonMatch[0];
            }
            
            const parsed = JSON.parse(text);

            return {
                ...parsed,
                id: `note-direct-${Date.now()}`,
                moduleId: "direct",
                generatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.warn("AI generation failed, using mock data:", error);
            return this.getMockNotes(subject);
        }
    },

    /**
     * Generate a quiz directly from a subject name.
     */
    async generateQuizDirect(subject: string, count: number = 5): Promise<AcademicQuiz> {
        try {
            const prompt = `Create a ${count}-question technical quiz for the subject: ${subject}.

IMPORTANT: Return ONLY a valid JSON object. No markdown code blocks, no explanations.

{"title":"${subject} Quiz","questions":[{"id":"q1","question":"What is...","options":["A","B","C","D"],"correctAnswer":1,"explanation":"Because...","difficulty":"medium"}]}`;

            let text = await this.callLLM(prompt, { json: true });
            
            // Clean up the response - extract JSON if wrapped in code blocks
            text = text.replace(/```json\s*|\s*```/g, '').trim();
            
            // Try to find JSON object in the text
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                text = jsonMatch[0];
            }
            
            const parsed = JSON.parse(text);

            return {
                ...parsed,
                id: `quiz-direct-${Date.now()}`,
                moduleId: "direct",
                generatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.warn("AI generation failed, using mock data:", error);
            return this.getMockQuiz(subject);
        }
    },

    /**
     * Mock notes for demo/fallback
     */
    getMockNotes(subject: string): AcademicNote {
        return {
            id: `note-mock-${Date.now()}`,
            moduleId: "direct",
            title: `${subject} - Complete Study Guide`,
            modules: [
                {
                    title: "Overview",
                    content: `Definition and Scope\n\n${subject} is a fundamental area in computer science that deals with computational problem-solving and system design. It forms the foundation for modern software engineering practices and is essential for building scalable, efficient applications.\n\nHistorical Context\nThe field has evolved significantly over the past decades, with major contributions from academic research and industry applications. Understanding its history helps appreciate current best practices.\n\nImportance in Computer Science\nThis subject bridges theoretical computer science with practical software engineering, providing the mathematical rigor needed for algorithm analysis and system design.`
                },
                {
                    title: "Theoretical Foundations",
                    content: `Mathematical Basis\n\nThe theoretical underpinnings of ${subject} rely on discrete mathematics, linear algebra, and probability theory. Key mathematical concepts include:\n\n1. Set Theory and Logic\n   Formal methods for describing computational problems and verifying solutions.\n\n2. Complexity Analysis\n   Big-O notation, Big-Omega, and Big-Theta for analyzing algorithm efficiency. Time and space complexity trade-offs.\n\n3. Graph Theory\n   Nodes, edges, paths, cycles, and connectivity. Applications in network analysis and optimization problems.\n\n4. Probability and Statistics\n   Randomized algorithms, expected values, and probabilistic analysis of algorithms.\n\nFormal Definitions\nPrecise mathematical definitions ensure unambiguous understanding and enable formal proofs of correctness and complexity bounds.`
                },
                {
                    title: "Core Concepts",
                    content: `Fundamental Principles\n\n1. Abstraction and Modularity\n   Breaking complex problems into manageable components. Interface design and information hiding principles.\n\n2. Efficiency and Optimization\n   Time-space trade-offs, caching strategies, and algorithmic improvements. Understanding when optimization is necessary.\n\n3. Correctness and Reliability\n   Formal verification, testing methodologies, and fault tolerance. Proving algorithm correctness using loop invariants.\n\n4. Scalability Considerations\n   Horizontal vs vertical scaling, distributed systems principles, and load balancing strategies.\n\nKey Terminology\n- Algorithm: Step-by-step procedure for solving a problem\n- Data Structure: Organization of data for efficient access and modification\n- Complexity: Measure of resource usage (time/space)\n- Optimization: Process of making a solution more efficient`
                },
                {
                    title: "Algorithms and Methods",
                    content: `Fundamental Algorithms\n\n1. Search Algorithms\n   Linear Search: O(n) time complexity\n   Binary Search: O(log n) time complexity, requires sorted data\n   Hash-based Search: O(1) average case with proper hash function\n\n2. Sorting Algorithms\n   Comparison-based: QuickSort, MergeSort, HeapSort (O(n log n))\n   Non-comparison: Counting Sort, Radix Sort (O(n) for integers)\n   Stability considerations and in-place requirements\n\n3. Graph Algorithms\n   Traversal: BFS, DFS with applications\n   Shortest Path: Dijkstra, Bellman-Ford, Floyd-Warshall\n   Minimum Spanning Tree: Prim, Kruskal algorithms\n\n4. Dynamic Programming\n   Optimal substructure and overlapping subproblems\n   Memoization vs tabulation approaches\n   Classic problems: Knapsack, LCS, Edit Distance\n\nComplexity Analysis\nUnderstanding best, average, and worst-case scenarios. Amortized analysis for operations with variable costs.`
                },
                {
                    title: "Industry Applications",
                    content: `Real-World Use Cases\n\nTechnology Companies\nMajor tech firms like Google, Amazon, and Microsoft extensively use ${subject} principles in their core systems:\n\n- Google: PageRank algorithm, distributed file systems, search indexing\n- Amazon: Recommendation engines, inventory optimization, AWS infrastructure\n- Microsoft: Operating systems, cloud services, database engines\n\nFinancial Services\nHigh-frequency trading algorithms, risk analysis models, fraud detection systems. Real-time processing of millions of transactions.\n\nHealthcare and Bioinformatics\nGenomic sequence analysis, medical imaging processing, drug discovery algorithms. Handling massive datasets with strict accuracy requirements.\n\nStartups and Scale-ups\nEmerging companies leverage these concepts to build innovative products quickly while maintaining technical debt at manageable levels.\n\nEnterprise Solutions\nLarge corporations apply these principles to modernize legacy systems and improve operational efficiency.`
                },
                {
                    title: "Interview Preparation",
                    content: `Common Interview Questions\n\nTheoretical Questions:\n1. Explain the time and space complexity of QuickSort. When would you prefer MergeSort?\n2. What is the difference between NP, NP-Complete, and NP-Hard problems?\n3. Explain the Master Theorem and its applications in divide-and-conquer algorithms.\n4. How would you prove the correctness of Dijkstra algorithm?\n5. What are the trade-offs between B-trees and B+ trees in database indexing?\n\nPractical Problems:\n1. Design a URL shortening service like bit.ly\n2. Implement an LRU cache with O(1) operations\n3. Find the median of two sorted arrays in O(log(min(m,n)))\n4. Design a distributed key-value store\n\nSystem Design:\n1. How would you design Twitter feed generation?\n2. Design a rate limiter for API endpoints\n3. Explain how you would shard a database for a multi-tenant SaaS\n\nPreparation Tips\n- Master time and space complexity analysis\n- Practice whiteboard coding under time pressure\n- Understand trade-offs between different approaches\n- Be ready to optimize solutions step by step`
                },
                {
                    title: "References",
                    content: `Textbooks and Academic Sources:\n\n1. "Introduction to Algorithms" (CLRS) - MIT Press, 3rd Edition\n2. "Algorithm Design" by Kleinberg and Tardos - Pearson\n3. "The Art of Computer Programming" by Donald Knuth - Addison-Wesley\n4. "Introduction to the Theory of Computation" by Michael Sipser - Cengage\n5. "Design Patterns" by Gamma, Helm, Johnson, Vlissides - Addison-Wesley\n\nOnline Courses:\n6. MIT 6.006 - Introduction to Algorithms (OpenCourseWare)\n7. Stanford CS161 - Design and Analysis of Algorithms\n8. Princeton Algorithms Course on Coursera (Sedgewick)\n\nResearch Papers and Publications:\n9. ACM Computing Surveys - Recent algorithmic advances\n10. IEEE Transactions on Computers - Hardware-software interactions\n11. Google Research Publications - Large-scale system design\n12. Microsoft Research - Distributed systems and cloud computing\n\nIndustry Resources:\n13. Google Engineering Practices Documentation\n14. Netflix Tech Blog - System design at scale\n15. Uber Engineering Blog - Real-time processing systems`
                }
            ],
            generatedAt: new Date().toISOString()
        };
    },

    /**
     * Mock quiz for demo/fallback
     */
    getMockQuiz(subject: string): AcademicQuiz {
        return {
            id: `quiz-mock-${Date.now()}`,
            moduleId: "direct",
            title: `${subject} - Knowledge Check`,
            questions: [
                {
                    id: `q1-${Date.now()}`,
                    question: `What is the primary purpose of ${subject} in software development?`,
                    options: [
                        "To optimize database queries",
                        "To solve specific computational problems efficiently",
                        "To design user interfaces",
                        "To manage network protocols"
                    ],
                    correctAnswer: 1,
                    explanation: `${subject} is fundamentally about solving computational problems in an efficient and structured manner. It provides the foundation for building robust software systems.`,
                    difficulty: "medium"
                },
                {
                    id: `q2-${Date.now()}`,
                    question: `Which of the following is a key benefit of mastering ${subject}?`,
                    options: [
                        "Better understanding of user experience design",
                        "Improved ability to write efficient algorithms",
                        "Enhanced graphic design skills",
                        "Faster internet connectivity"
                    ],
                    correctAnswer: 1,
                    explanation: `Mastering ${subject} directly improves your algorithmic thinking and problem-solving abilities, which are crucial for technical interviews and software development.`,
                    difficulty: "easy"
                },
                {
                    id: `q3-${Date.now()}`,
                    question: `In ${subject}, what is the most important factor to consider when designing a solution?`,
                    options: [
                        "Code length - shorter is always better",
                        "Time and space complexity",
                        "Number of comments in the code",
                        "Use of advanced language features"
                    ],
                    correctAnswer: 1,
                    explanation: `Time and space complexity are crucial metrics that determine the efficiency and scalability of your solution. Good engineers always optimize for both.`,
                    difficulty: "medium"
                },
                {
                    id: `q4-${Date.now()}`,
                    question: `Which approach is recommended when learning ${subject} for placement preparation?`,
                    options: [
                        "Memorize all syntax and formulas",
                        "Practice problems regularly and understand underlying concepts",
                        "Focus only on theory without coding",
                        "Skip basics and jump to advanced topics"
                    ],
                    correctAnswer: 1,
                    explanation: `Regular practice combined with deep conceptual understanding is the most effective way to master ${subject} and perform well in technical interviews.`,
                    difficulty: "easy"
                },
                {
                    id: `q5-${Date.now()}`,
                    question: `How does ${subject} relate to modern industry practices?`,
                    options: [
                        "It is outdated and rarely used",
                        "It forms the foundation of many modern technologies",
                        "It is only used in academic settings",
                        "It is replaced by no-code platforms"
                    ],
                    correctAnswer: 1,
                    explanation: `${subject} principles are fundamental to modern software engineering and are used extensively in building scalable systems at companies like Google, Amazon, and Microsoft.`,
                    difficulty: "medium"
                }
            ],
            generatedAt: new Date().toISOString()
        };
    }
};
