/**
 * Campus2Career — Data Migration Script
 * Firestore → Supabase (PostgreSQL)
 * 
 * RUNNING THIS SCRIPT:
 * 1. Ensure .env has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * 2. Run: npx ts-node --esm scripts/migrate-to-supabase.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function migrate() {
    console.log('🚀 Starting Migration: Firestore → Supabase');

    try {
        // 1. Migrate Admins
        await migrateCollection('admins', async (doc, data) => {
            const { error } = await supabase.from('admins').upsert({
                email: data.email,
                uid: data.uid || doc.id,
                name: data.name || 'Admin',
                role: data.role || 'admin',
                department: data.department,
                status: data.status || 'active'
            });
            if (error) throw error;
        });

        // 2. Migrate Companies
        await migrateCollection('companies', async (doc, data) => {
            const { data: company, error } = await supabase.from('companies').upsert({
                firestore_id: doc.id,
                company_name: data.companyName || data.name,
                industry: data.industry,
                website: data.website,
                hr_name: data.hrName,
                hr_email: data.hrEmail,
                hr_phone: data.hrPhone,
                package_range: data.packageRange,
                location: data.location,
                hiring_mode: data.hiringMode || 'on-campus',
                status: data.status || 'active',
                notes: data.notes,
                logo_url: data.logoUrl
            }).select().single();

            if (error) throw error;

            if (company) {
                // Roles/Depts
                if (data.eligibleDepartments) {
                    const { error: deptError } = await supabase.from('company_departments').insert(
                        data.eligibleDepartments.map((d: any) => ({ company_id: company.id, department: d }))
                    );
                    if (deptError) throw deptError;
                }
            }
        });

        // 3. Migrate Students
        await migrateCollection('students', async (doc, data) => {
            const { data: student, error } = await supabase.from('students').upsert({
                sap_id: data.sapId || doc.id,
                uid: data.uid,
                name: data.name || 'Unknown',
                email: data.email || '',
                branch: data.branch || data.department,
                current_year: data.currentYear,
                cgpa: data.cgpa || data.academicDetails?.cgpa,
                placement_status: data.placementStatus || 'unplaced',
                leetcode_username: data.leetcode?.username,
                leetcode_total_solved: data.leetcodeStats?.totalSolved,
                resume_url: data.resumeUrl
            }).select().single();

            if (error) throw error;

            if (student) {
                // Skills
                const skills = data.skills || data.techSkills || [];
                if (skills.length > 0) {
                    const { error: skillError } = await supabase.from('student_skills').insert(
                        skills.map((s: any) => ({ student_id: student.id, skill: s, level: 'intermediate' }))
                    );
                    if (skillError) throw skillError;
                }
                // Projects
                if (data.projects) {
                    const { error: projectError } = await supabase.from('student_projects').insert(
                        data.projects.map((p: any) => ({ 
                            student_id: student.id, 
                            title: p.title || 'Untitled Project',
                            description: p.description,
                            tech_stack: p.techStack
                        }))
                    );
                    if (projectError) throw projectError;
                }
            }
        });

        // 4. Drives
        await migrateCollection('drives', async (doc, data) => {
            const { error } = await supabase.from('drives').upsert({
                firestore_id: doc.id,
                company_name: data.companyName,
                title: data.title,
                status: data.status,
                batch: data.batch,
                min_cgpa: data.minCGPA,
                ctc_offered: data.ctcOffered,
                location: data.location
            });
            if (error) throw error;
        });

        // 5. Interviews
        await migrateCollection('interviews', async (doc, data) => {
            const { error } = await supabase.from('interviews').upsert({
                firestore_id: doc.id,
                company_name: data.companyName || 'Unknown',
                round_type: data.roundType || 'Normal',
                scheduled_date: data.scheduledDate?.toDate ? data.scheduledDate.toDate().toISOString() : new Date().toISOString(),
                status: data.status || 'scheduled'
            });
            if (error) throw error;
        });

        // 6. Offers
        await migrateCollection('offers', async (doc, data) => {
            const { error } = await supabase.from('offers').upsert({
                firestore_id: doc.id,
                company_name: data.companyName,
                role: data.role,
                ctc: data.ctc,
                status: data.status || 'issued'
            });
            if (error) throw error;
        });

        // 7. Audit Logs
        await migrateCollection('auditLogs', async (doc, data) => {
            const { error } = await supabase.from('audit_logs').upsert({
                firestore_id: doc.id,
                actor_email: data.actorEmail || data.userEmail || 'system',
                action: data.action || 'Unknown',
                module: data.module || 'System',
                summary: data.summary || 'Logged action',
                timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString()
            });
            if (error) throw error;
        });

        console.log('✅ Migration Finished Successfully!');
    } catch (err) {
        console.error('❌ Migration Critical Failure:', err);
    }
}

async function migrateCollection(colName: string, mapFn: (doc: any, data: any) => Promise<void>) {
    console.log(`📦 Migrating collection: ${colName}...`);
    const snap = await getDocs(collection(db, colName));
    const total = snap.size;
    let count = 0;

    for (const d of snap.docs) {
        try {
            await mapFn(d, d.data());
            count++;
        } catch (e: any) {
            console.warn(`⚠️ Error in doc ${d.id} of ${colName}:`, e.message || e);
        }
    }
    console.log(`✅ Done ${colName}: ${count}/${total} migrated.`);
}

migrate();
