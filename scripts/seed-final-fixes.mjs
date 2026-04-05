/**
 * Campus2Career — Final fixes
 * 1. Seed student_syllabi with real student SAP IDs
 * 2. Verify everything is complete
 * Run: node scripts/seed-final-fixes.mjs
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const now = () => new Date().toISOString();
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const SUBJECT_POOLS = {
  '1': ['Engineering Mathematics I','Engineering Physics','Engineering Chemistry','Basic Electrical Engineering','Programming Fundamentals','Engineering Drawing'],
  '2': ['Engineering Mathematics II','Data Structures','Digital Electronics','Object Oriented Programming','Discrete Mathematics','Communication Skills'],
  '3': ['Design & Analysis of Algorithms','Database Management Systems','Computer Organization','Operating Systems','Software Engineering','Statistics & Probability'],
  '4': ['Theory of Computation','Computer Networks','Compiler Design','Microprocessors','Web Technologies','Professional Ethics'],
  '5': ['Machine Learning','Artificial Intelligence','Cloud Computing','Information Security','Mobile Computing','Elective I'],
  '6': ['Deep Learning','Big Data Analytics','Distributed Systems','IoT & Embedded Systems','Project Management','Elective II'],
  '7': ['Advanced ML','Natural Language Processing','Computer Vision','Blockchain Technology','Industry Internship','Major Project I'],
  '8': ['Research Methodology','Entrepreneurship','Major Project II','Elective III','Elective IV','Placement Preparation'],
};

async function seedSyllabi() {
  console.log('📚 Seeding student_syllabi...');

  // Get all students with their SAP IDs
  const { data: students, error } = await supabase
    .from('students')
    .select('sap_id, current_year, branch')
    .order('sap_id');

  if (error || !students?.length) {
    console.log('  ❌ Could not fetch students:', error?.message);
    return;
  }

  console.log(`  Found ${students.length} students`);

  // Clear existing (in case of partial data)
  await supabase.from('student_syllabi').delete().neq('student_sap_id', 'NONE');

  const rows = [];
  for (const s of students) {
    const yr = parseInt(s.current_year) || 4;
    // Each student gets syllabi for all completed semesters
    const completedSems = yr * 2; // 4th year = 8 sems, 3rd = 6, etc.
    for (let sem = 1; sem <= Math.min(completedSems, 8); sem++) {
      const subjects = SUBJECT_POOLS[String(sem)] || SUBJECT_POOLS['1'];
      rows.push({
        student_sap_id: s.sap_id,
        semester: sem,
        file_name: `${s.branch?.replace(/\s+/g, '_')}_Sem${sem}_Syllabus_2025.pdf`,
        download_url: `https://nmims.edu.in/syllabus/${s.sap_id}/sem${sem}.pdf`,
        uploaded_at: now(),
      });
    }
  }

  console.log(`  Inserting ${rows.length} syllabus records...`);

  // Insert in batches of 100
  let added = 0;
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100);
    const { error: insErr } = await supabase.from('student_syllabi').insert(batch);
    if (insErr) {
      console.log(`  ❌ Batch ${i}-${i+100}: ${insErr.message}`);
    } else {
      added += batch.length;
      process.stdout.write(`\r  Inserted ${added}/${rows.length}...`);
    }
  }
  console.log(`\n  ✅ Done: ${added} syllabus records added`);
}

async function finalVerification() {
  console.log('\n📊 FINAL DATABASE VERIFICATION');
  console.log('='.repeat(55));

  const tables = [
    'students','admins','companies','company_departments','company_job_roles',
    'drives','drive_stages','interviews','offers','audit_logs',
    'platform_config','eligibility_rules','eligibility_rule_years',
    'eligibility_rule_departments','eligibility_rule_drives',
    'student_skills','student_projects','student_internships',
    'student_certifications','student_achievements','student_swoc',
    'student_syllabi','curriculum'
  ];

  let allGood = true;
  for (const t of tables) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    const rows = count || 0;
    const icon = rows > 0 ? '✅' : '⚠️ ';
    if (rows === 0) allGood = false;
    console.log(`  ${icon} ${t.padEnd(35)} ${String(rows).padStart(4)} rows`);
  }

  // Check views
  console.log('\n  Views:');
  for (const v of ['student_readiness_v', 'placement_analytics_v']) {
    const { data, error } = await supabase.from(v).select('*').limit(1);
    console.log(`  ${error ? '❌' : '✅'} ${v.padEnd(35)} ${error ? error.message : 'OK'}`);
  }

  // Check a student has full data
  console.log('\n  Sample student data check:');
  const { data: sample } = await supabase
    .from('students')
    .select('name,bio,location,tech_skills,interests,goals,clubs,hobbies,languages,projects,internships,certifications,achievements,assessment_results,academic_data')
    .not('bio', 'is', null)
    .limit(1)
    .single();

  if (sample) {
    const fields = ['bio','location','tech_skills','interests','goals','clubs','hobbies','languages','projects','internships','certifications','achievements','assessment_results','academic_data'];
    fields.forEach(f => {
      const val = sample[f];
      const filled = val !== null && val !== undefined && (Array.isArray(val) ? val.length > 0 : true);
      console.log(`    ${filled ? '✅' : '⚠️ '} ${f}`);
    });
  }

  console.log('\n' + '='.repeat(55));
  console.log(allGood ? '✅ All tables have data!' : '⚠️  Some tables still empty — check above');
}

async function main() {
  console.log('🔧 Campus2Career — Final Fixes\n');
  await seedSyllabi();
  await finalVerification();
}

main().catch(console.error);
