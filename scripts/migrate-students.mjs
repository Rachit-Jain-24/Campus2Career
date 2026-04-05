/**
 * Campus2Career — Sutherland Student Migration Script
 * Firestore → Supabase Auth + students table (Enhanced for Sutherland Data)
 *
 * This script is specifically tuned to handle the NMIMS CSE (DS) batch data
 * sourced from the Sutherland Excel sheets.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

// ─── Firebase ─────────────────────────────────────────────────────────────────
const firebaseConfig = {
    apiKey:            process.env.VITE_FIREBASE_API_KEY,
    authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             process.env.VITE_FIREBASE_APP_ID,
};
const firebaseApp = initializeApp(firebaseConfig);
const firestoreDb = getFirestore(firebaseApp);

// ─── Supabase (Service Role key required) ───────────────────────────────────
const SUPABASE_URL          = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; 

if (!SUPABASE_SERVICE_KEY || SUPABASE_SERVICE_KEY === 'YOUR_SERVICE_ROLE_KEY_HERE') {
    console.error('❌  SUPABASE_SERVICE_ROLE_KEY is not set correctly in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toNum = (v) => {
    if (v === undefined || v === null || v === '') return null;
    const n = parseFloat(String(v));
    return isNaN(n) ? null : n;
};
const toInt = (v) => {
    if (v === undefined || v === null || v === '') return null;
    const n = parseInt(String(v));
    return isNaN(n) ? null : n;
};
const toArr = (v) => (Array.isArray(v) ? v : []);
const toStr = (v) => (v !== undefined && v !== null ? String(v).trim() : null);

async function migrate() {
    console.log('🚀  Migrating 32 Sutherland Students: Firestore → Supabase');
    console.log('─'.repeat(60));

    const snap = await getDocs(collection(firestoreDb, 'students'));
    console.log(`📦  Found ${snap.size} documents in Firestore\n`);

    let created = 0, updated = 0, failed = 0;

    for (const docSnap of snap.docs) {
        const d = docSnap.data();
        
        // Extract sapId: check docId first, then sapId field
        let sapId = toStr(d.sapId);
        if (!sapId || sapId.length < 5) sapId = docSnap.id; 

        // Use SAP ID to construct student email if missing
        const email = toStr(d.email) || `${sapId}@nmims.edu.in`;
        const password = sapId; // Default password is SAP ID

        // ─── Sutherland Batch Detection ──────────────────────────────
        const sutherlandEmails = [
            'divya.sri010@nmims.edu.in', 'pavithra.sevakula011@nmims.edu.in', 
            'ruthwik.akula028@nmims.edu.in', 'snehil.a030@nmims.edu.in',
            // Add more as needed, or check for specific domains/patterns
        ];
        
        // A more robust check: if they have "CSDS" in Firestore or are in the known list
        const isSutherland = sutherlandEmails.includes(email.toLowerCase()) || 
                            toStr(d.branch)?.includes('CSDS') || 
                            toStr(d.department)?.includes('CSDS');

        let currentYear, branch;
        
        if (isSutherland) {
            currentYear = '4';
            branch = 'B.Tech CSDS';
        } else {
            // Distribute mock students across 1st, 2nd, 3rd years
            const mockYear = (created + updated + failed) % 3 + 1;
            currentYear = String(mockYear);
            
            // Distribute across other branches
            const branches = ['B.Tech CSE', 'B.Tech IT', 'B.Tech AIML', 'B.Tech CSBS'];
            branch = branches[(created + updated + failed) % branches.length];
        }

        process.stdout.write(`  → [${sapId}] ${toStr(d.name || d.fullName) || 'Unknown'} (${branch}, Yr ${currentYear}) ... `);

        try {
            // ── 1. Create Supabase Auth User ─────────────────────────────
            let authUid = null;
            let isExisting = false;
            
            // Try creating the user
            const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { name: toStr(d.name || d.fullName), sap_id: sapId, role: 'student' }
            });

            if (authError) {
                if (authError.message.includes('already been registered') || authError.code === 'email_exists') {
                   // Correct way to find an existing user by email in Supabase Admin API
                   // Increase perPage to 1000 to see all 109 students
                   const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
                   if (listError) throw new Error(`Auth List: ${listError.message}`);
                   
                   const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
                   
                   if (existingUser) {
                       authUid = existingUser.id;
                       isExisting = true;
                   } else {
                       throw new Error(`Auth: User exists but not found (Pagination/Mismatch)`);
                   }
                } else {
                   throw new Error(`Auth: ${authError.message}`);
                }
            } else {
                authUid = newUser.user.id;
            }

            // ── 2. Build Profile Row ──────────────────────────────────────
            // ── 3. Handle Skills ─────────────────────────────────────────
            // Extract from Firestore if present
            const skillsMap = d.skills && typeof d.skills === 'object' ? d.skills : {};
            let techSkills = Object.keys(skillsMap).length > 0 
                ? Object.keys(skillsMap) 
                : toArr(d.techSkills || d.skills);

            // If no skills found (mock students), provide random relevant ones
            if (techSkills.length === 0) {
                const pool = ['Java', 'Python', 'React', 'Node.js', 'SQL', 'C++', 'ML', 'Cloud'];
                techSkills = pool.sort(() => 0.5 - Math.random()).slice(0, 3);
            }

            const studentRow = {
                sap_id:    sapId,
                uid:       authUid,
                roll_no:   toStr(d.rollNo),
                name:      toStr(d.name || d.fullName) || 'Unknown',
                email,
                branch,
                current_year: currentYear,
                batch:     isSutherland ? '2022-2026' : `Batch ${2026 + (4 - parseInt(currentYear))}`,
                phone:     toStr(d.phone || d.contact),
                cgpa:      toNum(d.cgpa || d.academicDetails?.cgpa) || (7 + Math.random() * 2),
                
                career_track:       toStr(d.careerTrack || d.careerGoal) || (isSutherland ? 'Data Scientist' : 'Software Engineer'),
                career_track_emoji: toStr(d.careerTrackEmoji) || (isSutherland ? '🎯' : '💻'),
                
                // Onboarding fulfillment (all landing on dashboard for now)
                career_discovery_completed: true,
                profile_completed:          true,
                assessment_completed:       true,
                onboarding_step:            5,
                
                github_url:   toStr(d.githubUrl || d.socialLinks?.github),
                linkedin_url: toStr(d.linkedinUrl || d.socialLinks?.linkedin),
                leetcode_username: toStr(d.leetcodeUsername || d.leetcode?.username || d.leetcode),
                
                leetcode_total_solved: toInt(d.leetcodeSolved || d.leetcodeStats?.totalSolved) || Math.floor(Math.random() * 100),
                resume_url: toStr(d.resumeUrl),
            };

            // Check if student with this UID already exists to avoid unique constraint error
            const { data: existingStudent } = await supabase
                .from('students')
                .select('id, sap_id')
                .eq('uid', authUid)
                .maybeSingle();

            let studentId;
            if (existingStudent) {
                // Update existing record
                const { data: updated, error: updateErr } = await supabase
                    .from('students')
                    .update(studentRow)
                    .eq('id', existingStudent.id)
                    .select('id')
                    .single();
                if (updateErr) throw new Error(`DB Update: ${updateErr.message}`);
                studentId = updated.id;
            } else {
                // Insert new record (conflict handle by sap_id)
                const { data: inserted, error: insertErr } = await supabase
                    .from('students')
                    .upsert(studentRow, { onConflict: 'sap_id' })
                    .select('id')
                    .single();
                if (insertErr) throw new Error(`DB Insert: ${insertErr.message}`);
                studentId = inserted.id;
            }

            // ── 3. Handle Sutherland Specific Achievements (Publications/Hackathons) ──
            const achievements = [];
            
            // Map Sutherland achievements array
            toArr(d.achievements).forEach(a => achievements.push({ title: "Achievement", description: toStr(a) }));
            
            // Map Sutherland hackathons
            if (d.hackathons?.details) {
                toArr(d.hackathons.details).forEach(h => achievements.push({ title: "Hackathon", description: toStr(h) }));
            }
            
            // Map Sutherland publications
            if (d.publications?.details) {
                toArr(d.publications.details).forEach(p => achievements.push({ title: "Publication", description: toStr(p) }));
            }

            if (achievements.length > 0) {
                await supabase.from('student_achievements').delete().eq('student_id', studentId);
                await supabase.from('student_achievements').insert(
                    achievements.map(a => ({ student_id: studentId, title: a.title, description: a.description }))
                );
            }

            // ── 4. Map Internships ────────────────────────────────────────
            const internshipsArr = [];
            if (d.internships?.companies) {
                // Sutherland style
                toArr(d.internships.companies).forEach(comp => {
                    internshipsArr.push({ company: comp, role: "Intern", duration: toStr(d.internships.duration) });
                });
            } else {
                // Standard style
                toArr(d.internships).forEach(i => internshipsArr.push({ 
                    company: i.company, role: i.role, duration: i.period || i.duration, description: i.description 
                }));
            }

            if (internshipsArr.length > 0) {
                await supabase.from('student_internships').delete().eq('student_id', studentId);
                await supabase.from('student_internships').insert(
                    internshipsArr.map(i => ({ student_id: studentId, ...i }))
                );
            }

            // ── 5. Map Skills ─────────────────────────────────────────────
            if (techSkills.length > 0) {
                await supabase.from('student_skills').delete().eq('student_id', studentId);
                await supabase.from('student_skills').insert(
                    techSkills.map(s => ({ student_id: studentId, skill: String(s), level: 'intermediate' }))
                );
            }

            console.log(isExisting ? '🔄 updated' : '✅ created');
            isExisting ? updated++ : created++;

        } catch (err) {
            console.log(`❌ FAILED — ${err.message}`);
            failed++;
        }
    }

    console.log('\n' + '─'.repeat(60));
    console.log(`🏁  Migration Finished. Total: ${snap.size}. Created: ${created}, Updated: ${updated}, Failed: ${failed}`);
}

migrate().catch(console.error);
