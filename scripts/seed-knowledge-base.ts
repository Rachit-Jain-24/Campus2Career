/**
 * Campus2Career — Native Search Seeding Script
 * FAQ + Industry Benchmarks → Supabase Full-Text Index
 * 
 * RUNNING:
 * npx tsx scripts/seed-knowledge-base.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

// Data extracted from ragEngine.ts source
const FAQ_CORPUS = [
  {
    id: 'faq-placement-1',
    title: 'How do campus placement drives work?',
    content: 'Campus placement drives are organized by the Training & Placement (T&P) cell. Companies visit campus in two seasons: the main season (Aug–Dec for final-year students) and the lateral season (Jan–Mar). Each drive typically has: (1) Pre-placement talk (PPT), (2) Online aptitude/coding test, (3) Technical interview rounds (1–3), (4) HR interview, and (5) Offer letter.',
    source: 'faq',
    tags: ['placement_drive', 'campus_placement', 'placement_process']
  },
  {
    id: 'faq-placement-2',
    title: 'What is the typical placement drive timeline?',
    content: 'Placement season for final-year students usually begins in August. Dream companies (high-package) visit first, followed by mass recruiters. The process for each company spans 1–3 days. Offer letters are typically issued within 2 weeks of the final interview.',
    source: 'faq',
    tags: ['placement_drive', 'drive_timeline', 'offer_letter']
  },
  {
    id: 'faq-placement-3',
    title: 'How do I register for a placement drive?',
    content: 'Log in to the Campus2Career portal, navigate to "Placement Drives", check eligibility criteria, and click "Register" before the deadline. Upload your latest resume in PDF format.',
    source: 'faq',
    tags: ['placement_drive', 'registration', 'eligibility']
  },
  {
    id: 'faq-placement-4',
    title: 'What happens after I get placed?',
    content: 'Review and accept your offer letter within 7 days. Your status updates to "Placed" in the portal. You may be restricted from further drives per college policy.',
    source: 'faq',
    tags: ['placement_drive', 'offer_letter', 'post_placement']
  },
  {
    id: 'faq-eligibility-1',
    title: 'What CGPA is required for placement drives?',
    content: 'CGPA cutoffs vary: Dream companies (8.5+), Product-based (7.5–8.0), Service-based (6.0–7.0). Maintain a CGPA above 7.5 to keep maximum options open.',
    source: 'faq',
    tags: ['eligibility', 'cgpa', 'placement_drive']
  },
  {
    id: 'faq-interview-1',
    title: 'How should I prepare for technical interview rounds?',
    content: 'DSA: Solve 150+ LeetCode problems (Arrays, Trees, Graphs, DP). System Design: Scalability, load balancing, caching. Core CS: OS, DBMS, Networks, OOP.',
    source: 'faq',
    tags: ['interview', 'technical_round', 'dsa', 'preparation']
  }
];

// Pre-seeded roles from industryBenchmarks.ts
const BENCHMARK_ROLES = [
  'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 
  'Data Scientist', 'DevOps Engineer', 'Mobile App Developer',
  'Software Testing Engineer', 'UI/UX Designer', 'Cloud Engineer',
  'Cybersecurity Analyst', 'Product Manager', 'Data Engineer'
];

async function seed() {
  console.log('🚀 Starting Native Search Seeding...');
  
  const allData = [
    ...FAQ_CORPUS.map(f => ({ 
      content: f.content, 
      metadata: { title: f.title, source: f.source, tags: f.tags } 
    })),
    ...BENCHMARK_ROLES.map(role => ({
      content: `Industry Benchmark for ${role}. Typical salary: 8-20 LPA. Requires strong proficiency in relevant tech stacks, internships, and project experience.`,
      metadata: { title: `${role} Benchmark`, source: 'industry_benchmark', tags: [role.toLowerCase(), 'benchmark'] }
    }))
  ];

  console.log(`📦 Preparing to upload ${allData.length} snippets...`);

  const { error } = await supabase
    .from('knowledge_base')
    .insert(allData);

  if (error) {
    console.error('❌ Seeding Failed:', error.message);
  } else {
    console.log('✅ Seeding Finished Successfully!');
  }
}

seed();
