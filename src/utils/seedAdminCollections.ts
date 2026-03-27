/**
 * Master Seeding Utility
 * Seeds all organizational and operational Firestore collections with mock data.
 */
import {
    collection, getDocs, setDoc, doc, writeBatch, query, limit, deleteDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DEFAULT_SETTINGS } from '../services/admin/settings.service';

// ── Helpers ──────────────────────────────────────────────────
const id = () => Math.random().toString(36).slice(2, 10);
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000);
const daysFromNow = (n: number) => new Date(Date.now() + n * 86400000);

// ── Static reference data ─────────────────────────────────────
const COMPANIES = [
    { name: 'Infosys', industry: 'IT Services', website: 'https://infosys.com', ctcRange: [3.5, 6.5] },
    { name: 'TCS', industry: 'IT Services', website: 'https://tcs.com', ctcRange: [3.5, 7] },
    { name: 'Wipro', industry: 'IT Services', website: 'https://wipro.com', ctcRange: [3.5, 6] },
    { name: 'Cognizant', industry: 'IT Services', website: 'https://cognizant.com', ctcRange: [4, 7] },
    { name: 'Accenture', industry: 'Consulting', website: 'https://accenture.com', ctcRange: [4.5, 8] },
    { name: 'Google', industry: 'Technology', website: 'https://google.com', ctcRange: [25, 45] },
    { name: 'Microsoft', industry: 'Technology', website: 'https://microsoft.com', ctcRange: [20, 42] },
    { name: 'Amazon', industry: 'E-commerce', website: 'https://amazon.com', ctcRange: [18, 35] },
    { name: 'J.P. Morgan Chase', industry: 'Finance', website: 'https://jpmorgan.com', ctcRange: [12, 18] },
    { name: 'Goldman Sachs', industry: 'Finance', website: 'https://goldmansachs.com', ctcRange: [15, 22] },
];

const ROLES = [
    'Software Engineer', 'Data Analyst', 'ML Engineer', 'Backend Developer',
    'Full Stack Developer', 'Data Scientist', 'DevOps Engineer', 'Frontend Developer',
    'Business Analyst', 'Systems Engineer'
];

const ROUND_TYPES = ['aptitude_test', 'technical_interview', 'hr_interview', 'group_discussion', 'coding_round'];
const DRIVE_STATUSES = ['registration_open', 'ongoing', 'completed', 'upcoming'];
const OFFER_STATUSES = ['accepted', 'pending', 'rejected', 'issued'];

// ── Seeders ──────────────────────────────────────────────────

export async function seedCompanies(): Promise<string[]> {
    const batch = writeBatch(db);
    const companyIds: string[] = [];
    for (const c of COMPANIES) {
        const docId = id();
        companyIds.push(docId);
        batch.set(doc(db, 'companies', docId), {
            id: docId,
            name: c.name,
            industry: c.industry,
            website: c.website,
            status: 'active',
            hrContact: {
                name: `${c.name} HR`,
                email: `hr@${c.name.toLowerCase().replace(/\s/g, '')}.com`,
                phone: `+91 ${rand(70000, 99999)}${rand(10000, 99999)}`
            },
            eligibilityCriteria: {
                minCGPA: pick([6.5, 7.0, 7.5, 8.0]),
                allowedBranches: ['CSE', 'CSDS', 'IT'],
                skills: ['Python', 'SQL', 'Git']
            },
            createdAt: daysAgo(rand(30, 90)),
            updatedAt: new Date()
        });
    }
    await batch.commit();
    return companyIds;
}

export async function seedDrives(companyIds: string[]): Promise<string[]> {
    const batch = writeBatch(db);
    const driveIds: string[] = [];
    const templates = [
        { title: 'Campus Hiring 2026', role: 'Software Engineer' },
        { title: 'Data Analytics Program', role: 'Data Analyst' },
        { title: 'Tech Analyst Hiring', role: 'Business Analyst' },
        { title: 'Graduate Trainee 2026', role: 'Systems Engineer' },
        { title: 'Full Stack Excellence', role: 'Full Stack Developer' },
    ];

    for (let i = 0; i < templates.length; i++) {
        const t = templates[i];
        const companyId = companyIds[i % companyIds.length];
        const status = pick(DRIVE_STATUSES);
        const docId = id();
        driveIds.push(docId);

        batch.set(doc(db, 'drives', docId), {
            id: docId,
            title: t.title,
            companyId,
            companyName: COMPANIES[i % COMPANIES.length].name,
            jobRole: t.role,
            status,
            location: pick(['Hyderabad', 'Remote', 'Mumbai', 'Bangalore']),
            mode: pick(['on-campus', 'off-campus', 'virtual']),
            registrationStart: daysAgo(rand(5, 15)),
            registrationEnd: daysFromNow(rand(5, 15)),
            ctcOffered: rand(5, 25),
            applicantCount: rand(50, 200),
            shortlistedCount: rand(10, 50),
            stages: [
                { name: 'Aptitude Test', date: daysAgo(2) },
                { name: 'Technical Interview', date: daysFromNow(2) }
            ],
            createdAt: daysAgo(30),
            updatedAt: new Date()
        });
    }
    await batch.commit();
    return driveIds;
}

export async function seedInterviews(driveIds: string[]): Promise<void> {
    const snap = await getDocs(query(collection(db, 'students'), limit(20)));
    const students = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
    if (students.length === 0) return;

    const batch = writeBatch(db);
    for (let i = 0; i < 20; i++) {
        const student = students[i % students.length];
        const docId = id();
        batch.set(doc(db, 'interviews', docId), {
            id: docId,
            studentId: student.id,
            studentName: student.name || 'Student',
            driveId: pick(driveIds),
            companyName: pick(COMPANIES).name,
            roundType: pick(ROUND_TYPES),
            scheduledDate: daysFromNow(rand(1, 10)),
            status: 'scheduled',
            venue: 'Virtual - Microsoft Teams',
            createdAt: new Date()
        });
    }
    await batch.commit();
}

export async function seedOffers(driveIds: string[]): Promise<void> {
    const snap = await getDocs(query(collection(db, 'students'), limit(15)));
    const students = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
    if (students.length === 0) return;

    const batch = writeBatch(db);
    for (let i = 0; i < 10; i++) {
        const student = students[i % students.length];
        const docId = id();
        const ctc = rand(6, 18);
        batch.set(doc(db, 'offers', docId), {
            id: docId,
            studentId: student.id,
            studentName: student.name || 'Student',
            companyName: pick(COMPANIES).name,
            driveId: pick(driveIds),
            role: pick(ROLES),
            ctc,
            status: pick(OFFER_STATUSES),
            offerDate: daysAgo(rand(1, 10)),
            createdAt: new Date()
        });
    }
    await batch.commit();
}

export async function seedAdminUsers(): Promise<void> {
    const admins = [
        { name: 'Dr. Rajesh Kumar', email: 'dean@nmims.edu.in', role: 'dean', department: 'Management', status: 'active' },
        { name: 'Prof. Sunita Sharma', email: 'director@nmims.edu.in', role: 'director', department: 'Administration', status: 'active' },
        { name: 'Dr. Anil Verma', email: 'program.chair@nmims.edu.in', role: 'program_chair', department: 'CSE', status: 'active' },
        { name: 'Ms. Priya Nair', email: 'placement@nmims.edu.in', role: 'placement_officer', department: 'Corp Relations', status: 'active' },
        { name: 'System Admin', email: 'admin@nmims.edu.in', role: 'system_admin', department: 'IT', status: 'active' },
    ];

    const batch = writeBatch(db);
    for (const a of admins) {
        batch.set(doc(db, 'adminUsers', id()), {
            ...a,
            createdAt: daysAgo(180),
            lastLogin: daysAgo(1)
        });
    }
    await batch.commit();
}

export async function seedEligibilityRules(): Promise<void> {
    const batch = writeBatch(db);
    const rules = [
        { ruleName: 'Premium Tech Criteria', description: 'Rules for Tier-1 companies like Google/MS', minCGPA: 8.5, active: true, allowedDepartments: ['CSE', 'CSDS'], allowedYears: ['4'] },
        { ruleName: 'General Placement Criteria', description: 'Standard eligibility for mass recruiters', minCGPA: 6.0, active: true, allowedDepartments: ['CSE', 'CSDS', 'IT'], allowedYears: ['3', '4'] },
        { ruleName: 'Internship Eligibility', description: 'Rules for 3rd year internship drives', minCGPA: 7.0, active: true, allowedDepartments: ['CSE'], allowedYears: ['3'] },
    ];

    for (const r of rules) {
        const docId = id();
        batch.set(doc(db, 'eligibility_rules', docId), {
            id: docId,
            ...r,
            createdAt: daysAgo(60),
            updatedAt: new Date()
        });
    }
    await batch.commit();
}

export async function seedSettings(): Promise<void> {
    await setDoc(doc(db, 'config', 'platformSettings'), {
        ...DEFAULT_SETTINGS,
        updatedAt: new Date(),
        updatedBy: 'system_admin'
    });
}

export async function seedAuditLogs(): Promise<void> {
    const batch = writeBatch(db);
    for (let i = 0; i < 20; i++) {
        batch.set(doc(db, 'auditLogs', id()), {
            actorId: 'admin_1',
            actorName: 'System Admin',
            actorRole: 'system_admin',
            action: pick(['create', 'update', 'status_change', 'login']),
            module: pick(['drives', 'companies', 'students', 'users', 'settings']),
            severity: 'low',
            summary: `Periodic system maintenance log #${i}`,
            timestamp: daysAgo(rand(0, 7))
        });
    }
    await batch.commit();
}

// ── Master Functions ──────────────────────────────────────────

export async function seedAllAdminCollections(): Promise<{ success: boolean; results: Record<string, string>; error?: string }> {
    const results: Record<string, string> = {};
    try {
        const companyIds = await seedCompanies();
        results.companies = `✅ ${companyIds.length} companies`;

        const driveIds = await seedDrives(companyIds);
        results.drives = `✅ ${driveIds.length} drives`;

        await seedInterviews(driveIds);
        results.interviews = '✅ Interviews seeded';

        await seedOffers(driveIds);
        results.offers = '✅ Offers seeded';

        await seedAdminUsers();
        results.adminUsers = '✅ Admin accounts seeded';

        await seedEligibilityRules();
        results.eligibility_rules = '✅ Eligibility rules seeded';

        await seedSettings();
        results.settings = '✅ Platform configurations seeded';

        await seedAuditLogs();
        results.auditLogs = '✅ Audit history seeded';

        return { success: true, results };
    } catch (err: any) {
        return { success: false, results, error: err.message };
    }
}

export async function checkAdminCollectionsExist(): Promise<Record<string, number>> {
    const collections = ['companies', 'drives', 'interviews', 'offers', 'auditLogs', 'adminUsers', 'eligibility_rules'];
    const counts: Record<string, number> = {};
    for (const col of collections) {
        const snap = await getDocs(query(collection(db, col), limit(1)));
        counts[col] = snap.size;
    }
    return counts;
}

export async function clearAllAdminData(): Promise<void> {
    const collections = ['companies', 'drives', 'interviews', 'offers', 'auditLogs', 'adminUsers', 'eligibility_rules'];
    for (const col of collections) {
        const snap = await getDocs(collection(db, col));
        const promises = snap.docs.map(d => deleteDoc(d.ref));
        await Promise.all(promises);
    }
    await deleteDoc(doc(db, 'config', 'platformSettings'));
}
