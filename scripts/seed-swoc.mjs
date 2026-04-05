/**
 * Campus2Career — Seed student_swoc table
 * Run: node scripts/seed-swoc.mjs
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
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
const now = () => new Date().toISOString();

const STRENGTHS = ['Problem Solving','Team Collaboration','Quick Learner','Communication','Technical Skills','Analytical Thinking','Creativity','Leadership','Adaptability','Time Management'];
const WEAKNESSES = ['Public Speaking','Networking','Documentation','Procrastination','Perfectionism','Delegation','Multitasking'];
const OPPORTUNITIES = ['AI/ML Boom','Remote Work','Startup Ecosystem','Open Source','Global Market','Cloud Computing Growth','Data Science Demand','Web3 Revolution'];
const CHALLENGES = ['Competitive Market','Skill Gap','Work-Life Balance','Rapid Tech Changes','Interview Pressure','Imposter Syndrome'];

async function seedSwoc() {
  console.log('🔄 Seeding student_swoc...');

  const { data: students } = await supabase.from('students').select('id,name');
  if (!students?.length) { console.log('No students found'); return; }

  console.log(`Found ${students.length} students`);

  let added = 0, failed = 0;
  for (const s of students) {
    const row = {
      student_id: s.id,
      strengths: pickN(STRENGTHS, 3),
      weaknesses: pickN(WEAKNESSES, 2),
      opportunities: pickN(OPPORTUNITIES, 2),
      challenges: pickN(CHALLENGES, 2),
      updated_at: now(),
    };

    const { error } = await supabase.from('student_swoc').insert(row);
    if (error) {
      // Try update if already exists
      const { error: upErr } = await supabase.from('student_swoc').update(row).eq('student_id', s.id);
      if (upErr) { failed++; }
      else { added++; }
    } else {
      added++;
    }
    process.stdout.write(`\r  Progress: ${added + failed}/${students.length}...`);
  }

  console.log(`\n  ✅ Done: ${added} added/updated, ${failed} failed`);
}

seedSwoc().catch(console.error);
