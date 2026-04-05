/**
 * Campus2Career — Supabase Schema Inspector
 * Run: node scripts/check-db-schema.mjs
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const TABLES = [
  'students', 'admins',
  'companies', 'company_departments', 'company_job_roles',
  'drives', 'drive_stages',
  'interviews', 'offers',
  'audit_logs', 'platform_config',
  'eligibility_rules', 'eligibility_rule_years', 'eligibility_rule_departments', 'eligibility_rule_drives',
  'student_skills', 'student_projects', 'student_internships',
  'student_certifications', 'student_achievements', 'student_swoc',
  'student_syllabi', 'curriculum',
];

const VIEWS = ['student_readiness_v', 'placement_analytics_v'];

async function inspect() {
  console.log('='.repeat(70));
  console.log('  SUPABASE SCHEMA INSPECTION — Campus2Career');
  console.log('='.repeat(70));

  // --- Tables ---
  console.log('\n📋 TABLES\n');
  const tableResults = {};
  for (const t of TABLES) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (error) {
      tableResults[t] = { exists: false, error: error.message };
      console.log(`  ❌  ${t.padEnd(35)} → ${error.message}`);
    } else {
      const cols = data.length > 0 ? Object.keys(data[0]) : [];
      tableResults[t] = { exists: true, cols };
      console.log(`  ✅  ${t.padEnd(35)} (${cols.length} cols)`);
    }
  }

  // --- Views ---
  console.log('\n👁️  VIEWS\n');
  for (const v of VIEWS) {
    const { data, error } = await supabase.from(v).select('*').limit(1);
    if (error) {
      console.log(`  ❌  ${v.padEnd(35)} → ${error.message}`);
    } else {
      const cols = data.length > 0 ? Object.keys(data[0]) : [];
      console.log(`  ✅  ${v.padEnd(35)} (${cols.length} cols)`);
    }
  }

  // --- Row Counts ---
  console.log('\n📊 ROW COUNTS\n');
  const countTables = ['students','admins','companies','drives','interviews','offers','audit_logs','student_skills','student_projects','student_internships','student_achievements'];
  for (const t of countTables) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    if (!error) console.log(`  ${t.padEnd(35)} ${count} rows`);
  }

  // --- Detailed Column Inspection for key tables ---
  console.log('\n🔍 DETAILED COLUMNS\n');
  const detailTables = ['students', 'admins', 'companies', 'drives', 'interviews', 'offers', 'audit_logs'];
  for (const t of detailTables) {
    if (!tableResults[t]?.exists) continue;
    const { data } = await supabase.from(t).select('*').limit(1);
    if (data?.length > 0) {
      console.log(`\n  [${t}]`);
      Object.keys(data[0]).forEach(col => {
        const val = data[0][col];
        const type = val === null ? 'null' : typeof val === 'object' ? 'json/array' : typeof val;
        console.log(`    ${col.padEnd(35)} ${type}`);
      });
    } else {
      console.log(`\n  [${t}] — empty table`);
    }
  }

  // --- Missing Tables Summary ---
  const missing = TABLES.filter(t => !tableResults[t]?.exists);
  if (missing.length > 0) {
    console.log('\n⚠️  MISSING TABLES:\n');
    missing.forEach(t => console.log(`  - ${t}`));
  } else {
    console.log('\n✅  All expected tables exist.');
  }

  // --- Check audit_logs for missing columns ---
  console.log('\n🔎 AUDIT LOG COLUMN CHECK\n');
  const requiredAuditCols = ['id','actor_id','actor_name','actor_email','actor_role','action','module','severity','summary','target_id','target_type','timestamp','metadata','before_snapshot','after_snapshot','ip_address','user_agent'];
  const { data: auditSample } = await supabase.from('audit_logs').select('*').limit(1);
  if (auditSample?.length > 0) {
    const existing = Object.keys(auditSample[0]);
    requiredAuditCols.forEach(col => {
      const has = existing.includes(col);
      console.log(`  ${has ? '✅' : '❌'} ${col}`);
    });
  }

  console.log('\n' + '='.repeat(70));
}

inspect().catch(console.error);
