/**
 * Sync students.internships/projects/certifications/achievements JSONB
 * → student_internships / student_projects / student_certifications / student_achievements
 * Run: node scripts/sync-relational-tables.mjs
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function sync() {
  console.log('🔄 Syncing JSONB → relational tables...\n');

  const { data: students } = await supabase
    .from('students')
    .select('id, sap_id, name, internships, projects, certifications, achievements, tech_skills, skills');

  if (!students?.length) { console.log('No students found'); return; }

  let internAdded = 0, projAdded = 0, certAdded = 0, achAdded = 0, skillAdded = 0;

  for (const s of students) {
    // ── Internships ──────────────────────────────────────────────────────────
    const internships = Array.isArray(s.internships) ? s.internships : [];
    if (internships.length > 0) {
      await supabase.from('student_internships').delete().eq('student_id', s.id);
      const rows = internships.map((i) => ({
        student_id: s.id,
        company: i.company || i.companyName || '',
        role: i.role || '',
        duration: i.period || i.duration || '',
        year: i.year || new Date().getFullYear().toString(),
        description: i.description || '',
      }));
      const { error } = await supabase.from('student_internships').insert(rows);
      if (!error) internAdded += rows.length;
      else console.log(`  ❌ ${s.name} internships: ${error.message}`);
    }

    // ── Projects ─────────────────────────────────────────────────────────────
    const projects = Array.isArray(s.projects) ? s.projects : [];
    if (projects.length > 0) {
      await supabase.from('student_projects').delete().eq('student_id', s.id);
      const rows = projects.map((p) => ({
        student_id: s.id,
        title: p.title || '',
        description: p.description || '',
        tech_stack: p.tech || p.tech_stack || (Array.isArray(p.tags) ? p.tags.join(', ') : '') || '',
        github_link: p.link || p.github_link || p.githubUrl || null,
        live_link: p.liveLink || p.live_link || null,
        year: p.year || new Date().getFullYear().toString(),
      }));
      const { error } = await supabase.from('student_projects').insert(rows);
      if (!error) projAdded += rows.length;
      else console.log(`  ❌ ${s.name} projects: ${error.message}`);
    }

    // ── Certifications ───────────────────────────────────────────────────────
    const certs = Array.isArray(s.certifications) ? s.certifications : [];
    if (certs.length > 0) {
      await supabase.from('student_certifications').delete().eq('student_id', s.id);
      const rows = certs.map((c) => ({
        student_id: s.id,
        name: typeof c === 'string' ? c : (c.name || ''),
        issuer: c.issuer || '',
        year: c.year || '',
        link: c.link || null,
      })).filter(r => r.name);
      if (rows.length > 0) {
        const { error } = await supabase.from('student_certifications').insert(rows);
        if (!error) certAdded += rows.length;
        else console.log(`  ❌ ${s.name} certs: ${error.message}`);
      }
    }

    // ── Achievements ─────────────────────────────────────────────────────────
    const achievements = Array.isArray(s.achievements) ? s.achievements : [];
    if (achievements.length > 0) {
      await supabase.from('student_achievements').delete().eq('student_id', s.id);
      const rows = achievements.map((a) => ({
        student_id: s.id,
        title: a.title || '',
        description: a.description || '',
        year: a.year || '',
      })).filter(r => r.title);
      if (rows.length > 0) {
        const { error } = await supabase.from('student_achievements').insert(rows);
        if (!error) achAdded += rows.length;
        else console.log(`  ❌ ${s.name} achievements: ${error.message}`);
      }
    }

    // ── Skills ───────────────────────────────────────────────────────────────
    const skillsArr = Array.isArray(s.tech_skills) ? s.tech_skills : (Array.isArray(s.skills) ? s.skills : []);
    if (skillsArr.length > 0) {
      // Only add if student has no skills in relational table yet
      const { count } = await supabase.from('student_skills').select('*', { count: 'exact', head: true }).eq('student_id', s.id);
      if ((count || 0) === 0) {
        const rows = skillsArr.map((sk) => ({
          student_id: s.id,
          skill: typeof sk === 'string' ? sk : (sk.name || sk),
          level: 'intermediate',
        }));
        const { error } = await supabase.from('student_skills').insert(rows);
        if (!error) skillAdded += rows.length;
      }
    }
  }

  console.log(`✅ Internships synced: ${internAdded}`);
  console.log(`✅ Projects synced:    ${projAdded}`);
  console.log(`✅ Certs synced:       ${certAdded}`);
  console.log(`✅ Achievements synced:${achAdded}`);
  console.log(`✅ Skills added:       ${skillAdded}`);

  // Final counts
  console.log('\n📊 Final relational table counts:');
  for (const t of ['student_internships','student_projects','student_certifications','student_achievements','student_skills']) {
    const { count } = await supabase.from(t).select('*', { count: 'exact', head: true });
    console.log(`  ${t.padEnd(30)} ${count} rows`);
  }
}

sync().catch(console.error);
