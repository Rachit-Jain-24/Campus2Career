/**
 * Campus2Career — Fix remaining seeding issues
 * Handles: drives, admins, platform_config, eligibility_rules with correct schemas
 * Run: node scripts/seed-remaining.mjs
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const rndFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));
const now = () => new Date().toISOString();
const daysAgo = (d) => new Date(Date.now() - d * 86400000).toISOString();
const daysAhead = (d) => new Date(Date.now() + d * 86400000).toISOString();

// ─── Fix drives (only columns that exist) ────────────────────────────────────
async function fixDrives() {
  console.log('🚗 Fixing drives...');
  const { data: drives } = await supabase.from('drives').select('id,company_name,title,status,ctc_offered,location');
  if (!drives?.length) return;

  let updated = 0;
  for (const d of drives) {
    const regStart = daysAgo(rnd(5, 20));
    const regEnd = daysAhead(rnd(5, 25));
    const { error } = await supabase.from('drives').update({
      registration_start: regStart,
      registration_end: regEnd,
      registration_deadline: regEnd,
      min_cgpa: rndFloat(6.0, 7.5),
      batch: '2022-2026',
      type: pick(['full-time','internship','ppo']),
      updated_at: now(),
    }).eq('id', d.id);
    if (!error) updated++;
    else console.log(`  Drive error: ${error.message}`);
  }

  // Add drive_stages
  let stagesAdded = 0;
  for (const d of drives) {
    await supabase.from('drive_stages').delete().eq('drive_id', d.id);
    const stages = [
      { drive_id: d.id, stage_name: 'Online Assessment', stage_date: daysAhead(rnd(2,7)), stage_location: 'NMIMS Hyderabad', notes: 'Aptitude + Coding (90 mins)' },
      { drive_id: d.id, stage_name: 'Technical Interview 1', stage_date: daysAhead(rnd(8,14)), stage_location: 'NMIMS Hyderabad', notes: 'DSA + CS fundamentals' },
      { drive_id: d.id, stage_name: 'Technical Interview 2', stage_date: daysAhead(rnd(15,20)), stage_location: 'NMIMS Hyderabad', notes: 'System design + projects' },
      { drive_id: d.id, stage_name: 'HR Interview', stage_date: daysAhead(rnd(21,25)), stage_location: 'NMIMS Hyderabad', notes: 'Culture fit + compensation' },
    ];
    const { error } = await supabase.from('drive_stages').insert(stages);
    if (!error) stagesAdded += stages.length;
  }
  console.log(`  ✅ Drives: ${updated} updated, ${stagesAdded} stages added`);
}

// ─── Fix admins (only existing columns: id,uid,email,name,role,department,status) ──
async function fixAdmins() {
  console.log('👔 Fixing admins...');
  const { data: admins } = await supabase.from('admins').select('id,email,name,role,department');
  if (!admins?.length) return;

  const DEPTS = {
    dean: 'Academic Affairs',
    director: 'Administration',
    program_chair: 'Computer Science',
    faculty: 'Computer Science',
    placement_officer: 'Training & Placement',
    system_admin: 'IT Administration'
  };

  let updated = 0;
  for (const a of admins) {
    const dept = DEPTS[a.role] || 'Administration';
    if (a.department === dept) { updated++; continue; } // already set
    const { error } = await supabase.from('admins').update({
      department: dept,
      updated_at: now(),
    }).eq('id', a.id);
    if (!error) updated++;
    else console.log(`  Admin error: ${error.message}`);
  }
  console.log(`  ✅ Admins: ${updated} updated`);
}

// ─── Fix platform_config (correct schema) ────────────────────────────────────
// Real columns: id, config_key, current_academic_year, active_placement_season (bool),
// platform_name, institute_name, support_email, min_readiness_threshold,
// session_timeout_minutes, audit_logging_enabled (bool), updated_at, updated_by
async function fixPlatformConfig() {
  console.log('⚙️  Fixing platform config...');
  const { error } = await supabase.from('platform_config').upsert({
    config_key: 'platformSettings',
    platform_name: 'Campus2Career',
    institute_name: 'NMIMS Hyderabad',
    support_email: 'placement@nmims.edu.in',
    current_academic_year: '2025-26',
    active_placement_season: true,
    min_readiness_threshold: 60,
    session_timeout_minutes: 480,
    audit_logging_enabled: true,
    updated_by: 'system_admin',
    updated_at: now(),
  }, { onConflict: 'config_key' });
  console.log(error ? `  ❌ ${error.message}` : '  ✅ Platform config seeded');
}

// ─── Fix eligibility_rules (correct schema) ──────────────────────────────────
// Real columns: id, firestore_id, rule_name, description, min_cgpa, active (bool),
// max_active_backlogs, max_history_backlogs, created_at, updated_at
async function fixEligibilityRules() {
  console.log('📋 Fixing eligibility rules...');
  const { count } = await supabase.from('eligibility_rules').select('*', { count: 'exact', head: true });
  if ((count || 0) > 0) { console.log('  ⏭️  Already has data'); return; }

  const rules = [
    { rule_name: 'Standard Placement Eligibility', description: 'Minimum requirements for all placement drives at NMIMS Hyderabad.', min_cgpa: 6.0, active: true, max_active_backlogs: 0, max_history_backlogs: 2 },
    { rule_name: 'Premium Company Eligibility', description: 'Requirements for top-tier companies offering 15+ LPA packages.', min_cgpa: 7.5, active: true, max_active_backlogs: 0, max_history_backlogs: 0 },
    { rule_name: 'FAANG / Dream Company Eligibility', description: 'Strict criteria for FAANG and equivalent companies.', min_cgpa: 8.0, active: true, max_active_backlogs: 0, max_history_backlogs: 0 },
    { rule_name: 'Data Science Track Eligibility', description: 'For data science and analytics roles requiring Python/ML skills.', min_cgpa: 7.0, active: true, max_active_backlogs: 0, max_history_backlogs: 1 },
    { rule_name: 'Internship Eligibility', description: 'Relaxed criteria for internship opportunities.', min_cgpa: 5.5, active: true, max_active_backlogs: 2, max_history_backlogs: 4 },
  ];

  const { data: inserted, error } = await supabase.from('eligibility_rules').insert(rules).select('id');
  if (error) { console.log(`  ❌ ${error.message}`); return; }

  // Add years and departments
  const YEARS = ['4'];
  const ALL_DEPTS = ['CSE','IT','CSDS','AIML','CSBS'];
  for (const rule of inserted) {
    await supabase.from('eligibility_rule_years').insert(YEARS.map(y => ({ rule_id: rule.id, year: y })));
    await supabase.from('eligibility_rule_departments').insert(ALL_DEPTS.map(d => ({ rule_id: rule.id, department: d })));
  }
  console.log(`  ✅ ${inserted.length} eligibility rules seeded with years + departments`);
}

// ─── Fix supabaseAdapter to use correct platform_config schema ────────────────
async function verifyAndReport() {
  console.log('\n📊 Final verification...');
  const tables = ['students','admins','companies','drives','drive_stages','interviews','offers','audit_logs','platform_config','eligibility_rules','eligibility_rule_years','eligibility_rule_departments','student_skills','student_projects','student_internships','student_certifications','student_achievements','student_swoc','curriculum'];

  for (const t of tables) {
    const { count } = await supabase.from(t).select('*', { count: 'exact', head: true });
    const icon = (count || 0) > 0 ? '✅' : '⚠️ ';
    console.log(`  ${icon} ${t.padEnd(35)} ${count || 0} rows`);
  }
}

async function main() {
  console.log('🔧 Campus2Career — Fix Remaining Schema Issues');
  console.log('='.repeat(55));
  await fixDrives();
  await fixAdmins();
  await fixPlatformConfig();
  await fixEligibilityRules();
  await verifyAndReport();
  console.log('\n✅ All fixes applied!');
}

main().catch(console.error);
