export type Difficulty = 'easy' | 'medium' | 'hard';

export interface AcademicModule {
    id: string;
    name: string;
    description?: string;
    topics: string[];
    weightage?: number; // percentage or relative importance
}

export interface Syllabus {
    id: string;
    studentId: string;
    courseName: string;
    semester: number;
    modules: AcademicModule[];
    rawText?: string;
    uploadedAt: string;
}

export interface AcademicNote {
    id: string;
    moduleId: string;
    title: string;
    content?: string; // Legacy/Fallback
    modules: {
        title: string;
        content: string; // Markdown content
    }[];
    keyTakeaways?: string[];
    generatedAt: string;
}

export interface Flashcard {
    id: string;
    question: string;
    answer: string;
    moduleId: string;
    difficulty: Difficulty;
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number; // index of options
    explanation: string;
    difficulty: Difficulty;
}

export interface AcademicQuiz {
    id: string;
    moduleId: string;
    title: string;
    questions: QuizQuestion[];
    generatedAt: string;
}

export interface RevisionPlan {
    id: string;
    studentId: string;
    startDate: string;
    endDate: string;
    milestones: {
        date: string;
        activity: string;
        moduleId: string;
        isCompleted: boolean;
    }[];
}
