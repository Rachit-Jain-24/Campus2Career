export type AdminRole =
    | 'dean'
    | 'director'
    | 'program_chair'
    | 'faculty'
    | 'placement_officer'
    | 'system_admin';

export interface BaseAuthUser {
    uid: string;
    email: string;
    name: string;
    role: 'student' | AdminRole;
    createdAt?: string;
    photoURL?: string; // Optional for all users (future use)
    [key: string]: any; // Allow dynamic access to resolve AppUser vs StudentUser property TS errors
}

export interface AdminUser extends BaseAuthUser {
    role: AdminRole;
    department?: string;
}

export interface StudentUser extends BaseAuthUser {
    role: 'student';
    sapId: string;
    rollNo: string;
    branch: string;
    currentYear: number;
    program?: string;
    enrollmentYear?: number;
    onboardingStep: number;
    careerDiscoveryCompleted?: boolean;
    profileCompleted?: boolean;
    assessmentCompleted?: boolean;

    // Profile specific fields
    careerDiscoveryData?: any;
    careerTrack?: string;
    careerTrackEmoji?: string;
    assessmentResults?: any;
    leetcode?: string;
    trackedLeetcodeProblems?: string[];
    interests?: string[];
    goals?: string[];
    phone?: string;
    bio?: string;
    location?: string;
    placementStatus?: string;

    // Array items
    projects?: { id: string | number; title: string; description: string; tech?: string; link?: string; year?: string; tags?: string[] }[];
    internships?: { id: string | number; company: string; role: string; period: string; description: string }[];
    certifications?: { id: string | number; name: string; issuer: string; year?: string; link?: string }[];
    achievements?: { id: string | number; title: string; description: string; year?: string }[];

    // Additions
    resumeUrl?: string;
    resumeName?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    techSkills?: string[];
    skills?: string[];
    cgpa?: string;
    resumeDescription?: string;

    // Leetcode specific
    leetcodeStats?: {
        totalSolved: number;
        easySolved: number;
        mediumSolved: number;
        hardSolved: number;
        ranking: number;
        acceptanceRate: number;
        streak: number;
        submissionCalendar?: string;
        recentSubmissions?: { title: string; titleSlug: string; timestamp: string; statusDisplay: string }[];
        lastUpdated: number; // timestamp
    };
}

export type AppUser = StudentUser | AdminUser;

// Type guard for Admin
export const isAdminUser = (user: AppUser | null | undefined): user is AdminUser => {
    if (!user) return false;
    const adminRoles: AdminRole[] = [
        'dean', 'director', 'program_chair', 'faculty', 'placement_officer', 'system_admin'
    ];
    return adminRoles.includes(user.role as AdminRole);
};

// Type guard for Student
export const isStudentUser = (user: AppUser | null | undefined): user is StudentUser => {
    if (!user) return false;
    return user.role === 'student';
};
