import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { AdminStudentProfile } from '../../types/studentAdmin';

/**
 * Service to handle fetching raw student data from Firestore.
 * This acts as the single source of truth for the Admin Student Directory.
 */
export const fetchAllStudents = async (): Promise<AdminStudentProfile[]> => {
    try {
        const studentsRef = collection(db, 'students');
        // Fetch all students. We'll handle complex multi-field filtering and 
        // sorting client-side since Firestore requires composite indexes 
        // for every permutation of multi-field queries.
        const q = query(studentsRef);
        const snapshot = await getDocs(q);

        const students: AdminStudentProfile[] = [];
        snapshot.forEach(doc => {
            const data = doc.data();

            // Map the generic Firestore document into our strict AdminStudentProfile shape.
            // Adapt these fields to whatever the actual Firestore structure looks like.
            students.push({
                id: doc.id,
                sapId: data.sapId || '',
                fullName: data.name || 'Unknown Student',
                email: data.email || '',
                department: data.branch || data.department || 'Unknown',
                currentYear: data.currentYear || 'Unknown',
                cgpa: Number(data.academicDetails?.cgpa || data.cgpa || 0),
                readinessScore: data.assessmentResults?.overallScore || data.readinessScore || 0,
                careerGoal: data.careerTrack || data.careerGoal || 'Undecided',
                placementStatus: data.placementStatus || 'unplaced',
                eligibilityStatus: data.eligibilityStatus || 'pending_review',
                resumeStatus: data.resumeStatus || 'not_uploaded',
                internshipCompleted: !!data.internshipCompleted,
                contact: data.contact || data.phone,
                skills: data.skills || data.techSkills || [],
                certifications: data.certifications || [],
                projectsCount: data.projects?.length || 0,
                offersCount: data.offers?.length || 0,
                achievements: data.achievements || [],
                bio: data.bio || '',
                leetcodeStats: data.leetcodeStats || (data.leetcode && typeof data.leetcode === 'object' ? data.leetcode.stats : null) || { totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0 },
                lastUpdated: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : new Date())
            });
        });

        return students;
    } catch (error) {
        console.error('Error fetching students from Firestore:', error);
        throw new Error('Failed to fetch student directory data');
    }
};
