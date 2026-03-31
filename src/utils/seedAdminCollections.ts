import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { 
    collection, 
    doc, 
    setDoc, 
    getDocs, 
    serverTimestamp,
    writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MASTER SEEDING UTILITY
 * ─────────────────────────────────────────────────────────────────────────────
 * Seeds all organizational and operational Firestore collections with mock data.
 * Uses recognizable, human-readable IDs (e.g., 'google', 'amazon') where possible.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000);
const daysFromNow = (n: number) => new Date(Date.now() + n * 86400000);

// ── Clear All Admin Data ──
export const clearAllAdminData = async () => {
    const collections = [
        'companies', 
        'drives', 
        'interviews', 
        'offers', 
        'auditLogs', 
        'admins',
        'eligibility_rules',
        'config'
    ];

    console.log('🧹 Clearing all admin collections...');
    
    for (const colName of collections) {
        const snap = await getDocs(collection(db, colName));
        const batch = writeBatch(db);
        snap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
    }
    console.log('✅ Admin collections cleared.');
};

// ── Check Collection Status ──
export const checkAdminCollectionsExist = async () => {
    const collections = [
        'companies', 
        'drives', 
        'interviews', 
        'offers', 
        'auditLogs', 
        'admins',
        'eligibility_rules',
        'config'
    ];

    const counts: Record<string, number> = {};
    
    for (const colName of collections) {
        try {
            const snap = await getDocs(collection(db, colName));
            counts[colName] = snap.size;
        } catch (e) {
            counts[colName] = 0;
        }
    }
    
    return counts;
};

// ── Seed Companies ──
const seedCompanies = async () => {
    const companies = [
        { id: 'google', name: 'Google', industry: 'Technology', website: 'google.com', contactEmail: 'university@google.com', status: 'active', tier: 'Tier 1' },
        { id: 'amazon', name: 'Amazon', industry: 'E-commerce', website: 'amazon.jobs', contactEmail: 'campus@amazon.com', status: 'active', tier: 'Tier 1' },
        { id: 'microsoft', name: 'Microsoft', industry: 'Software', website: 'microsoft.com', contactEmail: 'hire@microsoft.com', status: 'active', tier: 'Tier 1' },
        { id: 'tcs', name: 'TCS', industry: 'IT Services', website: 'tcs.com', contactEmail: 'campus@tcs.com', status: 'active', tier: 'Tier 2' },
        { id: 'accenture', name: 'Accenture', industry: 'Consulting', website: 'accenture.com', contactEmail: 'hr@accenture.com', status: 'active', tier: 'Tier 2' },
    ];

    for (const c of companies) {
        await setDoc(doc(db, 'companies', c.id), {
            ...c,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    }
};

// ── Seed Placement Drives ──
const seedDrives = async () => {
    const drives = [
        { 
            id: 'drive-google-swe-2025',
            companyId: 'google', 
            companyName: 'Google', 
            title: 'Google STEP/SWE 2025',
            status: 'registration_open', 
            type: 'full_time',
            batch: '2025',
            eligibleDepartments: ['B.Tech CSE', 'B.Tech IT'],
            minCGPA: 8.5,
            ctcOffered: 32.5,
            applicantCount: 450,
            shortlistedCount: 85,
            location: 'Multiple',
            registrationDeadline: daysFromNow(15)
        },
        { 
            id: 'drive-amazon-sde-2025',
            companyId: 'amazon', 
            companyName: 'Amazon', 
            title: 'Amazon SDE Recruiting 2025',
            status: 'ongoing', 
            type: 'full_time',
            batch: '2025',
            eligibleDepartments: ['B.Tech'],
            minCGPA: 7.5,
            ctcOffered: 28.0,
            applicantCount: 820,
            shortlistedCount: 120,
            location: 'Bangalore/Hyderabad'
        },
        { 
            id: 'drive-tcs-ninja-2025',
            companyId: 'tcs', 
            companyName: 'TCS', 
            title: 'TCS Ninja/Digital Hiring',
            status: 'completed', 
            type: 'full_time',
            batch: '2025',
            eligibleDepartments: ['B.Tech', 'MCA'],
            minCGPA: 6.0,
            ctcOffered: 7.0,
            applicantCount: 1540,
            shortlistedCount: 450,
            location: 'Pan India'
        }
    ];

    for (const d of drives) {
        await setDoc(doc(db, 'drives', d.id), {
            ...d,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    }
};

// ── Seed Interviews ──
const seedInterviews = async () => {
    const interviews = [
        {
            id: 'int-google-tech-01',
            driveId: 'drive-google-swe-2025',
            companyName: 'Google',
            roundType: 'technical_interview',
            scheduledDate: daysFromNow(5),
            status: 'scheduled',
            candidateCount: 12,
            location: 'Google Meet',
            interviewer: 'Sundar P.'
        },
        {
            id: 'int-amazon-hr-01',
            driveId: 'drive-amazon-sde-2025',
            companyName: 'Amazon',
            roundType: 'hr_interview',
            scheduledDate: daysAgo(2),
            status: 'completed',
            candidateCount: 8,
            location: 'Chime Video'
        }
    ];

    for (const i of interviews) {
        await setDoc(doc(db, 'interviews', i.id), {
            ...i,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    }
};

// ── Seed Offers ──
const seedOffers = async () => {
    const offers = [
        {
            id: 'off-google-001',
            driveId: 'drive-google-swe-2025',
            studentId: '70572200035',
            studentName: 'Rachit Jain',
            studentDepartment: 'B.Tech CSE',
            studentYear: '4',
            companyId: 'google',
            companyName: 'Google',
            role: 'Software Engineer',
            ctc: 32.5,
            status: 'accepted',
            validityDate: daysFromNow(30)
        },
        {
            id: 'off-amazon-001',
            driveId: 'drive-amazon-sde-2025',
            studentId: '70572200001',
            studentName: 'Aditya Sharma',
            studentDepartment: 'B.Tech CSE',
            studentYear: '4',
            companyId: 'amazon',
            companyName: 'Amazon',
            role: 'SDE-1',
            ctc: 28.0,
            status: 'issued',
            validityDate: daysFromNow(15)
        }
    ];

    for (const o of offers) {
        await setDoc(doc(db, 'offers', o.id), {
            ...o,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    }
};

// ── Seed Eligibility Rules ──
const seedRules = async () => {
    const rules = [
        { 
            id: 'rule-premium',
            ruleName: 'Premium Tech Criteria', 
            description: 'Rules for Tier-1 companies like Google/MS', 
            minCGPA: 8.5, 
            active: true, 
            allowedDepartments: ['B.Tech CSE', 'B.Tech IT'], 
            allowedYears: ['4'],
            maxActiveBacklogs: 0,
            maxHistoryBacklogs: 0
        },
        { 
            id: 'rule-standard',
            ruleName: 'Standard Hiring Criteria', 
            description: 'Rules for general IT roles', 
            minCGPA: 7.0, 
            active: true, 
            allowedDepartments: ['B.Tech', 'MBA'], 
            allowedYears: ['3', '4'],
            maxActiveBacklogs: 1,
            maxHistoryBacklogs: 2
        }
    ];

    for (const r of rules) {
        await setDoc(doc(db, 'eligibility_rules', r.id), {
            ...r,
            linkedDriveIds: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    }
};

// ── Seed Admin Users ──
const seedAdmins = async () => {
    const admins = [
        { id: 'admin-dean', name: 'Dr. Ramesh Kumar', email: 'dean@nmims.edu', role: 'dean', department: 'Academics', status: 'active' },
        { id: 'admin-director', name: 'Prof. Sunita Sharma', email: 'director@nmims.edu', role: 'director', department: 'Management', status: 'active' },
        { id: 'admin-chair', name: 'Prof. S. Gupta', email: 'chair@nmims.edu', role: 'program_chair', department: 'CSE', status: 'active' },
        { id: 'admin-po', name: 'Sunita Mehra', email: 'po@nmims.edu', role: 'placement_officer', department: 'Placements', status: 'active' },
        { id: 'admin-sys', name: 'System Admin', email: 'admin@nmims.edu', role: 'system_admin', department: 'IT Operations', status: 'active' },
    ];

    // Initialize a secondary app for admin creation so it doesn't log out the current user
    const secondaryApp = initializeApp({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
    }, 'SecondaryAuthApp');
    const secondaryAuth = getAuth(secondaryApp);

    for (const a of admins) {
        // Create Firestore document in the correct 'admins' collection
        await setDoc(doc(db, 'admins', a.email), {
            ...a,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // Also create Firebase Auth account so we can login
        try {
            await createUserWithEmailAndPassword(secondaryAuth, a.email, 'nmims2026');
            console.log(`✅ Created Auth account for ${a.email}`);
        } catch (authError: any) {
            if (authError.code === 'auth/email-already-in-use') {
                console.log(`ℹ️ Auth account already exists for ${a.email}`);
            } else {
                console.warn(`⚠️ Failed to create Auth account for ${a.email}:`, authError.message);
            }
        }
    }

    // Clean up secondary app
    await deleteApp(secondaryApp);
};

// ── Seed Audit Logs ──
const seedAuditLogs = async () => {
    const logs = [
        { id: 'log-001', actorEmail: 'admin@nmims.edu', action: 'CREATE_DRIVE', module: 'drives', summary: 'Created Google SWE 2025 drive', severity: 'low', timestamp: daysAgo(1) },
        { id: 'log-002', actorEmail: 'admin@nmims.edu', action: 'UPDATE_RULE', module: 'eligibility', summary: 'Updated Premium Rule criteria', severity: 'medium', timestamp: daysAgo(0.5) },
        { id: 'log-003', actorEmail: 'system', action: 'LOGIN_FAILURE', module: 'auth', summary: 'Multiple failed logins detected', severity: 'high', timestamp: daysAgo(0.1) },
    ];

    for (const l of logs) {
        await setDoc(doc(db, 'auditLogs', l.id), {
            ...l,
            createdAt: serverTimestamp()
        });
    }
};

// ── Seed Platform Config ──
const seedConfig = async () => {
    const settings = {
        currentAcademicYear: '2024-25',
        activeBatches: ['2025', '2026'],
        allowLateRegistrations: false,
        maintenanceMode: false,
        supportEmail: 'support@nmims.edu',
        // Strategic Targets for the Dean
        targets: {
            placementRate: 95,
            averageCTC: 12.5,
            nirfHigherStudies: 15,
            medianSalary: 10.5
        },
        updatedAt: serverTimestamp()
    };
    await setDoc(doc(db, 'config', 'platformSettings'), settings);
};

// ── Main Orchestrator ──
export const seedAllAdminCollections = async () => {
    console.log('🚀 Starting Admin Collection Seeding...');
    
    const results: Record<string, string> = {};
    
    try {
        await seedCompanies(); results['companies'] = 'Success';
        await seedDrives(); results['drives'] = 'Success';
        await seedInterviews(); results['interviews'] = 'Success';
        await seedOffers(); results['offers'] = 'Success';
        await seedRules(); results['rules'] = 'Success';
        await seedAdmins(); results['admins'] = 'Success';
        await seedAuditLogs(); results['auditLogs'] = 'Success';
        await seedConfig(); results['config'] = 'Success';
        
        console.log('✅ All Admin collections seeded successfully.');
        return { success: true, results };
    } catch (error: any) {
        console.error('❌ Seeding failed:', error.message);
        return { success: false, results, error: error.message };
    }
};
