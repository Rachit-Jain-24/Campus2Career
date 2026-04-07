import type { KnowledgeChunk, RAGResult } from './types';
import type { StudentUser } from '../../types/auth';
import { industryBenchmarks } from '../../data/industryBenchmarks';
import { RECOMMENDED_PROBLEMS } from '../../data/leetcodeProblems';
import { searchKnowledge } from './knowledgeService';
// Using Supabase exclusively for database operations

// Internal interface for raw (pre-TF-IDF) chunks
export interface RawChunk {
  id: string;
  title: string;
  content: string;
  source: 'industry_benchmark' | 'leetcode' | 'faq' | 'student_profile';
  tags: string[];
}

/**
 * Tokenize text: lowercase, remove punctuation, split on whitespace,
 * filter tokens with length <= 2 (stop-word filtering by length).
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);
}

/**
 * Build the IDF table for a corpus of raw chunks.
 * Returns a Map from term → IDF value.
 */
export function buildIDF(chunks: RawChunk[]): Map<string, number> {
  const N = chunks.length;
  const tokenizedChunks = chunks.map(chunk => tokenize(chunk.title + ' ' + chunk.content));

  const df = new Map<string, number>();
  for (const tokens of tokenizedChunks) {
    const uniqueTerms = new Set(tokens);
    for (const term of uniqueTerms) {
      df.set(term, (df.get(term) ?? 0) + 1);
    }
  }

  const idf = new Map<string, number>();
  for (const [term, docFreq] of df) {
    idf.set(term, Math.log((1 + N) / (1 + docFreq)) + 1);
  }
  return idf;
}

/**
 * Compute TF-IDF vectors for a corpus of raw chunks and return KnowledgeChunk[].
 *
 * Formulas (from design):
 *   TF(term, chunk)  = count(term in chunk tokens) / chunk.tokens.length
 *   IDF(term)        = ln((1 + N) / (1 + df(term))) + 1
 *   TFIDF            = TF × IDF
 *   L2-normalize     = TFIDF / ||v||  where ||v|| = sqrt(sum(w²))
 *
 * The IDF table is built over the FULL corpus before any normalization.
 */
export function computeTFIDF(chunks: RawChunk[]): KnowledgeChunk[] {
  const N = chunks.length;

  // Step 1 — tokenize every chunk
  const tokenizedChunks = chunks.map(chunk => ({
    chunk,
    tokens: tokenize(chunk.title + ' ' + chunk.content),
  }));

  // Step 2 — build document-frequency (df) table over the full corpus
  const df = new Map<string, number>();
  for (const { tokens } of tokenizedChunks) {
    const uniqueTerms = new Set(tokens);
    for (const term of uniqueTerms) {
      df.set(term, (df.get(term) ?? 0) + 1);
    }
  }

  // Step 3 — compute TF-IDF and L2-normalize for each chunk
  return tokenizedChunks.map(({ chunk, tokens }) => {
    if (tokens.length === 0) {
      return {
        id: chunk.id,
        title: chunk.title,
        content: chunk.content,
        source: chunk.source,
        tags: chunk.tags,
        tfidfVector: new Map<string, number>(),
      };
    }

    // Term frequency counts
    const termCount = new Map<string, number>();
    for (const term of tokens) {
      termCount.set(term, (termCount.get(term) ?? 0) + 1);
    }

    // TF-IDF weights (un-normalized)
    const rawVector = new Map<string, number>();
    for (const [term, count] of termCount) {
      const tf = count / tokens.length;
      const idf = Math.log((1 + N) / (1 + (df.get(term) ?? 0))) + 1;
      rawVector.set(term, tf * idf);
    }

    // L2 normalization
    let norm = 0;
    for (const w of rawVector.values()) {
      norm += w * w;
    }
    norm = Math.sqrt(norm);

    const tfidfVector = new Map<string, number>();
    for (const [term, w] of rawVector) {
      tfidfVector.set(term, w / norm);
    }

    return {
      id: chunk.id,
      title: chunk.title,
      content: chunk.content,
      source: chunk.source,
      tags: chunk.tags,
      tfidfVector,
    };
  });
}

// ---------------------------------------------------------------------------
// FAQ Corpus — 20+ Q&A chunks covering placement, eligibility, interviews,
// and offer negotiation.
// ---------------------------------------------------------------------------
const FAQ_CORPUS: RawChunk[] = [
  // ── Placement Process ──────────────────────────────────────────────────
  {
    id: 'faq-placement-1',
    title: 'How do campus placement drives work?',
    content:
      'Campus placement drives are organized by the Training & Placement (T&P) cell. Companies visit campus in two seasons: the main season (Aug–Dec for final-year students) and the lateral season (Jan–Mar). Each drive typically has: (1) Pre-placement talk (PPT) where the company presents its culture and roles, (2) Online aptitude/coding test, (3) Technical interview rounds (1–3), (4) HR interview, and (5) Offer letter. Students must register for each drive separately through the placement portal.',
    source: 'faq',
    tags: ['placement_drive', 'campus_placement', 'placement_process', 'drive_timeline'],
  },
  {
    id: 'faq-placement-2',
    title: 'What is the typical placement drive timeline?',
    content:
      'Placement season for final-year (4th year) students usually begins in August. Dream companies (high-package) visit first, followed by mass recruiters. The process for each company spans 1–3 days. Offer letters are typically issued within 2 weeks of the final interview. Students who receive an offer in the first half of the season may be restricted from applying to other companies depending on college policy (one-offer rule). Pre-placement offers (PPOs) from internships are honored before the main season.',
    source: 'faq',
    tags: ['placement_drive', 'drive_timeline', 'offer_letter', 'ppo'],
  },
  {
    id: 'faq-placement-3',
    title: 'How do I register for a placement drive?',
    content:
      'To register for a placement drive: (1) Log in to the Campus2Career portal, (2) Navigate to "Placement Drives" and find the active drive, (3) Check eligibility criteria (CGPA, backlogs, branch), (4) Click "Register" before the deadline — late registrations are not accepted, (5) Upload your latest resume in PDF format, (6) Confirm your registration via email. Keep your profile updated with current skills, projects, and CGPA before registering.',
    source: 'faq',
    tags: ['placement_drive', 'registration', 'placement_process', 'eligibility'],
  },
  {
    id: 'faq-placement-4',
    title: 'What happens after I get placed?',
    content:
      'After receiving a placement offer: (1) You will receive an official offer letter via email within 2 weeks, (2) Review the offer carefully — CTC, joining date, bond clauses, location, (3) Accept or decline within the stipulated deadline (usually 7 days), (4) Once accepted, your placement status is updated to "Placed" in the portal, (5) You may be restricted from attending further drives per college policy, (6) Complete any background verification documents requested by the company, (7) Prepare for the joining date — some companies have pre-joining tasks or training.',
    source: 'faq',
    tags: ['placement_drive', 'offer_letter', 'post_placement', 'joining'],
  },
  {
    id: 'faq-placement-5',
    title: 'What is a Pre-Placement Offer (PPO)?',
    content:
      'A Pre-Placement Offer (PPO) is an offer extended by a company to a student who completed an internship with them, before the main placement season begins. PPOs are highly valued because: (1) They are based on demonstrated performance, (2) The CTC is often higher than regular campus offers, (3) They reduce placement season stress. To maximize PPO chances: perform exceptionally during your internship, deliver projects on time, ask for feedback, and express interest in a full-time role before your internship ends.',
    source: 'faq',
    tags: ['ppo', 'internship', 'placement_drive', 'offer_letter'],
  },

  // ── Eligibility Criteria ───────────────────────────────────────────────
  {
    id: 'faq-eligibility-1',
    title: 'What CGPA is required for placement drives?',
    content:
      'CGPA cutoffs vary by company tier: (1) Dream companies (Google, Microsoft, Amazon): typically 8.5+ CGPA, (2) Product-based companies (Flipkart, Paytm, Zomato): 7.5–8.0 CGPA, (3) Service-based companies (TCS, Infosys, Wipro, Accenture): 6.0–7.0 CGPA, (4) Startups: often no strict CGPA cutoff but prefer 7.0+. Your CGPA is calculated up to the last completed semester. Some companies consider only core subject marks. Maintain a CGPA above 7.5 to keep maximum options open.',
    source: 'faq',
    tags: ['eligibility', 'cgpa', 'placement_drive', 'criteria'],
  },
  {
    id: 'faq-eligibility-2',
    title: 'How do backlogs affect placement eligibility?',
    content:
      'Backlogs (failed subjects) significantly impact placement eligibility: (1) Most top companies (FAANG, product-based) have a strict zero-backlog policy — even one active backlog disqualifies you, (2) Service-based companies (TCS, Infosys) may allow up to 1–2 cleared backlogs but no active backlogs at the time of joining, (3) Some companies check for backlogs at the time of offer acceptance and can revoke offers if backlogs are found. Clear all backlogs before the placement season begins. History of backlogs (even cleared) must be disclosed honestly.',
    source: 'faq',
    tags: ['eligibility', 'backlogs', 'criteria', 'placement_drive'],
  },
  {
    id: 'faq-eligibility-3',
    title: 'What is the attendance requirement for placements?',
    content:
      'Most colleges require a minimum of 75% attendance to be eligible for placement drives. Some companies additionally verify attendance records during background checks. If your attendance is below 75%: (1) You may be barred from placement drives by the college, (2) Contact your department coordinator immediately to understand options, (3) Medical certificates can sometimes be used to condone attendance shortfalls. Maintain attendance above 85% to stay safe and avoid last-minute issues during placement season.',
    source: 'faq',
    tags: ['eligibility', 'attendance', 'criteria', 'placement_drive'],
  },
  {
    id: 'faq-eligibility-4',
    title: 'Can students from all branches apply to all companies?',
    content:
      'Not all companies are open to all branches. Common branch restrictions: (1) Core IT companies (software roles): open to CS, IT, ECE, and sometimes EEE, (2) Data Science roles: prefer CS, IT, Mathematics, or Statistics backgrounds, (3) Core engineering companies: prefer branch-specific students (Mechanical, Civil, etc.), (4) Some companies explicitly list eligible branches in the job description. Always check the "Eligible Branches" field in the drive details before registering. Cross-branch applications are sometimes allowed for students with strong relevant skills and projects.',
    source: 'faq',
    tags: ['eligibility', 'branch', 'criteria', 'placement_drive'],
  },

  // ── Interview Tips ─────────────────────────────────────────────────────
  {
    id: 'faq-interview-1',
    title: 'How should I prepare for technical interview rounds?',
    content:
      'Technical interview preparation strategy: (1) DSA: Solve 150+ LeetCode problems covering arrays, strings, linked lists, trees, graphs, and DP. Focus on medium-difficulty problems, (2) System Design (for 3rd/4th year): Study scalability, load balancing, databases, caching, and microservices. Practice designing systems like URL shorteners, chat apps, and e-commerce platforms, (3) Core CS subjects: Revise OS (processes, threads, memory management), DBMS (normalization, SQL queries, transactions), Computer Networks (TCP/IP, HTTP, DNS), and OOP concepts, (4) Projects: Be ready to explain every line of your projects — architecture decisions, challenges faced, and improvements you would make.',
    source: 'faq',
    tags: ['interview', 'technical_round', 'dsa', 'system_design', 'preparation'],
  },
  {
    id: 'faq-interview-2',
    title: 'How do I crack the HR interview round?',
    content:
      'HR interview tips: (1) Self-introduction: Prepare a crisp 2-minute intro covering your background, key skills, notable projects, and career goals, (2) Common questions: "Tell me about yourself", "Why this company?", "Where do you see yourself in 5 years?", "What are your strengths and weaknesses?", "Describe a challenge you overcame", (3) Research the company: Know their products, recent news, culture, and values, (4) Salary discussion: Know the market rate for your role and be prepared to justify your expectations, (5) Body language: Maintain eye contact, sit upright, speak clearly and confidently, (6) Ask thoughtful questions at the end — about team culture, growth opportunities, or the role.',
    source: 'faq',
    tags: ['interview', 'hr_round', 'behavioral', 'preparation', 'self_introduction'],
  },
  {
    id: 'faq-interview-3',
    title: 'What are common behavioral interview questions and how to answer them?',
    content:
      'Behavioral questions use the STAR method (Situation, Task, Action, Result): (1) "Tell me about a time you failed" — describe a real failure, what you learned, and how you improved, (2) "Describe a conflict with a teammate" — focus on resolution and collaboration, (3) "Give an example of leadership" — describe a project where you led a team or initiative, (4) "How do you handle tight deadlines?" — give a specific example with measurable outcomes, (5) "What motivates you?" — align your answer with the company\'s mission. Prepare 5–6 STAR stories that can be adapted to different questions. Avoid vague or generic answers.',
    source: 'faq',
    tags: ['interview', 'behavioral', 'hr_round', 'star_method', 'preparation'],
  },
  {
    id: 'faq-interview-4',
    title: 'How do I prepare for coding rounds in placement drives?',
    content:
      'Coding round preparation: (1) Platform practice: Solve problems on LeetCode, HackerRank, and CodeChef regularly — aim for 2–3 problems daily in the 3 months before placements, (2) Time management: In a 90-minute coding test with 3 problems, spend max 30 minutes per problem. If stuck, move on and return later, (3) Read the problem carefully: Identify edge cases (empty arrays, negative numbers, overflow) before coding, (4) Communicate your approach: In live coding interviews, explain your thought process before writing code, (5) Test your code: Trace through examples manually before submitting, (6) Common topics: Two pointers, sliding window, BFS/DFS, dynamic programming, and sorting algorithms appear most frequently.',
    source: 'faq',
    tags: ['interview', 'coding_round', 'dsa', 'leetcode', 'preparation'],
  },
  {
    id: 'faq-interview-5',
    title: 'What should I do the day before an interview?',
    content:
      'Day-before interview checklist: (1) Review your resume thoroughly — be ready to discuss every point, (2) Revise 2–3 key projects you have listed, (3) Do a light DSA revision — don\'t try to learn new topics, (4) Research the company: products, tech stack, recent news, (5) Prepare your outfit and documents (resume copies, ID proof, offer letter if applicable), (6) Sleep at least 7–8 hours — mental clarity is crucial, (7) Avoid cramming new material — consolidate what you know, (8) Practice speaking your self-introduction aloud. On the day: arrive 15 minutes early, stay calm, and remember that interviewers want you to succeed.',
    source: 'faq',
    tags: ['interview', 'preparation', 'day_before', 'tips'],
  },

  // ── Offer Negotiation ──────────────────────────────────────────────────
  {
    id: 'faq-offer-1',
    title: 'How do I evaluate a job offer?',
    content:
      'Evaluating a job offer — key factors: (1) CTC vs Take-Home: Understand the difference between Cost to Company (CTC) and in-hand salary. Variable pay, PF contributions, and benefits reduce take-home, (2) Role and growth: Is the role aligned with your career goals? Does the company have a clear growth path? (3) Location: Consider cost of living in the city — a ₹10 LPA offer in Mumbai may be equivalent to ₹7 LPA in a tier-2 city, (4) Company stability: Check funding status (for startups), revenue, and employee reviews on Glassdoor, (5) Work culture: Notice period, WFH policy, team size, and manager quality matter for long-term satisfaction, (6) Bond clauses: Some companies require a 1–2 year bond with a penalty for early exit — read carefully.',
    source: 'faq',
    tags: ['offer_negotiation', 'offer_letter', 'ctc', 'evaluation', 'salary'],
  },
  {
    id: 'faq-offer-2',
    title: 'Can I negotiate a campus placement offer?',
    content:
      'Negotiating campus placement offers: (1) Most mass recruiters (TCS, Infosys, Wipro) have fixed packages for campus hires — negotiation is rarely possible, (2) Product-based and startup offers have more flexibility — especially if you have competing offers or exceptional skills, (3) How to negotiate: Express enthusiasm for the role first, then mention your competing offer or market research, ask if there is flexibility in the base salary or joining bonus, (4) What to negotiate: Base salary, joining bonus, stock options (ESOPs), role/team preference, joining date, (5) Be professional: Never give ultimatums. Frame it as "I am very excited about this opportunity — is there any flexibility on the compensation given my background?", (6) Get everything in writing before accepting.',
    source: 'faq',
    tags: ['offer_negotiation', 'salary', 'ctc', 'negotiation_tactics'],
  },
  {
    id: 'faq-offer-3',
    title: 'What is a good salary for a fresher in India?',
    content:
      'Fresher salary benchmarks in India (2024): (1) Service-based (TCS, Infosys, Wipro, Accenture): ₹3.5–6 LPA, (2) Mid-tier product companies (Capgemini, Cognizant, HCL): ₹4–8 LPA, (3) Good product companies (Flipkart, Paytm, Zomato, Swiggy): ₹12–25 LPA, (4) Top product companies (Google, Microsoft, Amazon India): ₹20–45 LPA, (5) Startups: highly variable — ₹6–30 LPA depending on funding stage and role. Factors that increase your offer: strong DSA skills, relevant internship experience, open-source contributions, and competitive programming ratings.',
    source: 'faq',
    tags: ['offer_negotiation', 'salary', 'ctc', 'fresher', 'benchmarks'],
  },
  {
    id: 'faq-offer-4',
    title: 'Should I accept the first offer I receive?',
    content:
      'Whether to accept the first offer depends on: (1) Company tier: If it is a dream company (Google, Microsoft, top startup), accepting immediately is usually wise, (2) Competing drives: If better companies are yet to visit campus, you may want to wait — but check your college\'s one-offer policy, (3) Financial situation: If you need income security, a good offer in hand is worth more than a potentially better offer later, (4) Role fit: A lower-paying role at a company with excellent learning opportunities can be more valuable long-term than a higher-paying but stagnant role. General advice: Do not reject a solid offer without a concrete alternative. Evaluate based on your personal priorities and risk tolerance.',
    source: 'faq',
    tags: ['offer_negotiation', 'offer_letter', 'decision', 'placement_drive'],
  },
  {
    id: 'faq-offer-5',
    title: 'What are ESOPs and should I value them in an offer?',
    content:
      'ESOPs (Employee Stock Ownership Plans) are stock options given to employees, common in startups and some product companies: (1) Vesting schedule: Typically 4-year vesting with a 1-year cliff — you get 25% after year 1, then monthly/quarterly thereafter, (2) Value: ESOPs are only valuable if the company grows and has a liquidity event (IPO or acquisition), (3) Risk: Early-stage startup ESOPs are high-risk — the company may not succeed, (4) How to evaluate: Check the company\'s valuation, funding stage, and growth trajectory. Ask for the strike price and current FMV (Fair Market Value), (5) For campus placements: ESOPs are a bonus, not a guarantee. Do not accept a lower base salary purely for ESOPs unless you strongly believe in the company\'s future.',
    source: 'faq',
    tags: ['offer_negotiation', 'esops', 'salary', 'startup', 'evaluation'],
  },
  {
    id: 'faq-offer-6',
    title: 'How do I compare multiple job offers?',
    content:
      'Comparing multiple offers — a structured approach: (1) Create a comparison table with: CTC, take-home salary, role, location, growth potential, company stability, work culture, and bond clauses, (2) Calculate real take-home: Subtract PF (12% of basic), professional tax, and income tax from CTC, (3) Assign weights to factors based on your priorities (e.g., growth 30%, salary 25%, location 20%, culture 25%), (4) Talk to current employees: LinkedIn and Glassdoor reviews give real insights into work culture and growth, (5) Consider the 3-year picture: Where will you be in 3 years at each company? Which offers better learning, mentorship, and career trajectory? (6) Trust your gut: After the analysis, go with the offer that excites you most.',
    source: 'faq',
    tags: ['offer_negotiation', 'offer_comparison', 'salary', 'evaluation', 'decision'],
  },
];

// ---------------------------------------------------------------------------
// Chunk builders
// ---------------------------------------------------------------------------

function buildIndustryBenchmarkChunks(): RawChunk[] {
  return Object.values(industryBenchmarks).map((benchmark) => {
    const coreSkills = benchmark.requiredSkills
      .filter((s) => s.category === 'core')
      .map((s) => s.skill);
    const importantSkills = benchmark.requiredSkills
      .filter((s) => s.category === 'important')
      .map((s) => s.skill);
    const niceToHaveSkills = benchmark.requiredSkills
      .filter((s) => s.category === 'nice-to-have')
      .map((s) => s.skill);

    const content = [
      `Role: ${benchmark.role}`,
      `Industry Demand: ${benchmark.industryDemand}`,
      `Average Salary: ${benchmark.avgSalary}`,
      `Minimum CGPA: ${benchmark.minCGPA}`,
      `Average LeetCode Problems Solved: ${benchmark.avgLeetCodeProblems}`,
      `Average Projects: ${benchmark.avgProjects}`,
      `Average Internships: ${benchmark.avgInternships}`,
      coreSkills.length > 0 ? `Core Skills (must-have): ${coreSkills.join(', ')}` : '',
      importantSkills.length > 0 ? `Important Skills: ${importantSkills.join(', ')}` : '',
      niceToHaveSkills.length > 0 ? `Nice-to-have Skills: ${niceToHaveSkills.join(', ')}` : '',
    ]
      .filter(Boolean)
      .join('. ');

    const allSkills = benchmark.requiredSkills
      .map((s) => s.skill)
      .filter((s): s is string => typeof s === 'string' && s.length > 0)
      .map((s) => s.toLowerCase());

    return {
      id: `industry_benchmark-${benchmark.role.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      title: `${benchmark.role} — Industry Benchmark`,
      content,
      source: 'industry_benchmark' as const,
      tags: [benchmark.role.toLowerCase(), ...allSkills, benchmark.industryDemand, 'salary', 'benchmark'],
    };
  });
}

function buildLeetcodeChunks(): RawChunk[] {
  return RECOMMENDED_PROBLEMS.map((problem) => ({
    id: `leetcode-${problem.id}`,
    title: `LeetCode: ${problem.title}`,
    content: `Problem: ${problem.title}. Difficulty: ${problem.difficulty}. Category: ${problem.category}. Recommended for Year ${problem.level} students. Practice this problem to strengthen your ${problem.category} skills for placement coding rounds.`,
    source: 'leetcode' as const,
    tags: [
      problem.difficulty.toLowerCase(),
      problem.category.toLowerCase().replace(/\s+/g, '_'),
      `year_${problem.level}`,
      'leetcode',
      'dsa',
      'coding_round',
    ],
  }));
}

function buildStudentProfileChunks(student: StudentUser): RawChunk[] {
  const chunks: RawChunk[] = [];
  const uid = student.uid;

  // Skills chunk — guard against non-array and non-string values from Firestore
  const rawSkillsArr: unknown[] = Array.isArray(student.skills) ? student.skills : [];
  const rawTechSkillsArr: unknown[] = Array.isArray(student.techSkills) ? student.techSkills : [];
  const allSkills = [...rawSkillsArr, ...rawTechSkillsArr]
    .filter((s): s is string => typeof s === 'string' && s.length > 0);
  if (allSkills.length > 0) {
    chunks.push({
      id: `student_profile-${uid}-skills`,
      title: `${student.name}'s Skills`,
      content: `Student ${student.name} has the following skills: ${allSkills.join(', ')}. Career track: ${student.careerTrack ?? 'Not set'}. Branch: ${student.branch}. Year: ${student.currentYear}.`,
      source: 'student_profile',
      tags: allSkills.map((s) => s.toLowerCase()),
    });
  } else {
    chunks.push({
      id: `student_profile-${uid}-skills`,
      title: `${student.name}'s Skills`,
      content: `Student ${student.name} is in Year ${student.currentYear}, ${student.branch}. Career track: ${student.careerTrack ?? 'Not set'}. No skills listed yet — consider adding your technical skills to your profile.`,
      source: 'student_profile',
      tags: ['skills', 'profile'],
    });
  }

  // Projects chunk
  const projects = student.projects ?? [];
  if (projects.length > 0) {
    const projectSummaries = projects
      .map((p) => `${p.title}: ${p.description}${p.tech ? ` (Tech: ${p.tech})` : ''}`)
      .join('; ');
    chunks.push({
      id: `student_profile-${uid}-projects`,
      title: `${student.name}'s Projects`,
      content: `${student.name} has ${projects.length} project(s): ${projectSummaries}.`,
      source: 'student_profile',
      tags: ['projects', 'portfolio', ...projects.flatMap((p) => (p.tags ?? []).filter((t): t is string => typeof t === 'string').map((t) => t.toLowerCase()))],
    });
  } else {
    chunks.push({
      id: `student_profile-${uid}-projects`,
      title: `${student.name}'s Projects`,
      content: `${student.name} has no projects listed yet. Adding 2–3 strong projects significantly improves placement chances.`,
      source: 'student_profile',
      tags: ['projects', 'portfolio'],
    });
  }

  // Internships chunk
  const internships = student.internships ?? [];
  if (internships.length > 0) {
    const internshipSummaries = internships
      .map((i) => `${i.role} at ${i.company} (${i.period}): ${i.description}`)
      .join('; ');
    chunks.push({
      id: `student_profile-${uid}-internships`,
      title: `${student.name}'s Internships`,
      content: `${student.name} has ${internships.length} internship(s): ${internshipSummaries}.`,
      source: 'student_profile',
      tags: ['internships', 'experience', ...internships.map((i) => typeof i.company === 'string' ? i.company.toLowerCase() : '').filter(Boolean)],
    });
  } else {
    chunks.push({
      id: `student_profile-${uid}-internships`,
      title: `${student.name}'s Internships`,
      content: `${student.name} has no internships listed yet. Internship experience is highly valued by recruiters and can lead to Pre-Placement Offers (PPOs).`,
      source: 'student_profile',
      tags: ['internships', 'experience'],
    });
  }

  // Goals and interests chunk — guard against non-array Firestore values
  const rawGoals: unknown[] = Array.isArray(student.goals) ? student.goals : [];
  const rawInterests: unknown[] = Array.isArray(student.interests) ? student.interests : [];
  const goals = rawGoals.filter((g): g is string => typeof g === 'string');
  const interests = rawInterests.filter((i): i is string => typeof i === 'string');
  chunks.push({
    id: `student_profile-${uid}-goals`,
    title: `${student.name}'s Goals and Interests`,
    content: [
      goals.length > 0 ? `Career goals: ${goals.join(', ')}.` : 'No career goals listed.',
      interests.length > 0 ? `Interests: ${interests.join(', ')}.` : 'No interests listed.',
      student.careerTrack ? `Target career track: ${student.careerTrack}.` : '',
      student.bio ? `Bio: ${student.bio}` : '',
    ]
      .filter(Boolean)
      .join(' '),
    source: 'student_profile',
    tags: [
      'goals',
      'interests',
      ...(student.careerTrack && typeof student.careerTrack === 'string' ? [student.careerTrack.toLowerCase()] : []),
      ...goals.map((g) => g.toLowerCase()),
      ...interests.map((i) => i.toLowerCase()),
    ],
  });

  // LeetCode stats chunk
  const stats = student.leetcodeStats;
  if (stats) {
    chunks.push({
      id: `student_profile-${uid}-leetcode`,
      title: `${student.name}'s LeetCode Stats`,
      content: `LeetCode stats for ${student.name}: Total solved: ${stats.totalSolved} (Easy: ${stats.easySolved}, Medium: ${stats.mediumSolved}, Hard: ${stats.hardSolved}). Acceptance rate: ${stats.acceptanceRate?.toFixed(1) ?? 'N/A'}%. Ranking: ${stats.ranking ?? 'N/A'}. Streak: ${stats.streak ?? 0} days.`,
      source: 'student_profile',
      tags: ['leetcode', 'dsa', 'coding', 'stats'],
    });
  } else {
    chunks.push({
      id: `student_profile-${uid}-leetcode`,
      title: `${student.name}'s LeetCode Stats`,
      content: `${student.name} has not linked a LeetCode account yet. Solving LeetCode problems is essential for clearing coding rounds in placement drives.`,
      source: 'student_profile',
      tags: ['leetcode', 'dsa', 'coding', 'stats'],
    });
  }

  return chunks;
}

// ---------------------------------------------------------------------------
// RAG Engine state
// ---------------------------------------------------------------------------

let _knowledgeBase: KnowledgeChunk[] = [];
let _initialized = false;
let _idfTable: Map<string, number> = new Map();
let _corpusSize = 0;

/**
 * Build and index the full knowledge base for a given student.
 * Runs TF-IDF computation over all chunks (FAQ + industry benchmarks +
 * LeetCode problems + student profile).
 *
 * The heavy work is deferred via setTimeout(..., 0) so it does not block
 * the initial render.
 */
export function initialize(student: StudentUser): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const rawChunks: RawChunk[] = [
        ...FAQ_CORPUS,
        ...buildIndustryBenchmarkChunks(),
        ...buildLeetcodeChunks(),
        ...buildStudentProfileChunks(student),
      ];

      _idfTable = buildIDF(rawChunks);
      _corpusSize = rawChunks.length;
      _knowledgeBase = computeTFIDF(rawChunks);
      _initialized = true;
      resolve();
    }, 0);
  });
}

/**
 * Replace only the student-profile chunks in the knowledge base with fresh
 * ones built from the updated profile, then recompute TF-IDF over the full
 * corpus.
 */
export function refreshProfileChunks(student: StudentUser): void {
  const nonProfileChunks = _knowledgeBase.map((c) => ({
    id: c.id,
    title: c.title,
    content: c.content,
    source: c.source,
    tags: c.tags,
  })) as RawChunk[];

  const withoutProfile = nonProfileChunks.filter((c) => c.source !== 'student_profile');
  const freshProfile = buildStudentProfileChunks(student);
  const allChunks = [...withoutProfile, ...freshProfile];

  _idfTable = buildIDF(allChunks);
  _corpusSize = allChunks.length;
  _knowledgeBase = computeTFIDF(allChunks);
}

/** Returns true once initialize() has completed. */
export function isInitialized(): boolean {
  return _initialized;
}

/** Expose the current knowledge base (used by retrieve and tests). */
export function getKnowledgeBase(): KnowledgeChunk[] {
  return _knowledgeBase;
}

/**
 * Retrieve the top-K most relevant chunks for a query using cosine similarity.
 * Logic:
 * 1. If Supabase is enabled: Use Semantic Search (Gemini Embeddings + pgvector).
 * 2. If Firestore is enabled: Use local TF-IDF (keyword-based).
 */
export async function retrieve(query: string, topK: number = 5): Promise<RAGResult> {
  // Always use Supabase for semantic search
  {
    try {
      const results = await searchKnowledge(query, topK);
      if (results.length > 0) {
        return {
          chunks: results.map(r => ({
            id: r.id,
            title: r.metadata?.title || 'Knowledge Base',
            content: r.content,
            source: (r.metadata?.source || 'faq') as any,
            tags: r.metadata?.tags || [],
            tfidfVector: new Map() // Not used in native search mode
          })) as KnowledgeChunk[],
          queryVector: new Map()
        };
      }
    } catch (err) {
      console.warn("Native search failed, falling back to local TF-IDF:", err);
    }
  }

  // FALLBACK: Local TF-IDF Logic
  const queryTokens = tokenize(query);

  // Build raw query vector using stored IDF table; unknown terms get IDF = 1
  const rawQueryVector = new Map<string, number>();
  for (const token of queryTokens) {
    const idf = _idfTable.get(token) ?? 1;
    rawQueryVector.set(token, (rawQueryVector.get(token) ?? 0) + idf);
  }

  // L2-normalize the query vector
  let norm = 0;
  for (const w of rawQueryVector.values()) {
    norm += w * w;
  }
  norm = Math.sqrt(norm);

  const queryVector = new Map<string, number>();
  if (norm > 0) {
    for (const [term, w] of rawQueryVector) {
      queryVector.set(term, w / norm);
    }
  }

  // Compute cosine similarity (dot product of L2-normalized vectors) for each chunk
  const scored = _knowledgeBase.map((chunk) => {
    let score = 0;
    for (const [term, qw] of queryVector) {
      const cw = chunk.tfidfVector.get(term);
      if (cw !== undefined) {
        score += qw * cw;
      }
    }
    return { chunk, score };
  });

  // Sort descending by score and take top-K
  scored.sort((a, b) => b.score - a.score);
  const topChunks = scored.slice(0, topK).map((s) => s.chunk);

  return { chunks: topChunks, queryVector };
}
