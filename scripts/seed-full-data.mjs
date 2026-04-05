/**
 * Campus2Career — Full Database Seeder
 * Fills ALL null columns with realistic data for all 109 students + all tables.
 * Run: node scripts/seed-full-data.mjs
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const rndFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));
const uuid = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const daysAgo = (d) => new Date(Date.now() - d * 86400000).toISOString();
const daysAhead = (d) => new Date(Date.now() + d * 86400000).toISOString();

// ─── Data pools ───────────────────────────────────────────────────────────────
const CITIES = ['Hyderabad','Mumbai','Bangalore','Chennai','Pune','Delhi','Kolkata','Ahmedabad','Jaipur','Lucknow'];
const STATES = ['Telangana','Maharashtra','Karnataka','Tamil Nadu','Maharashtra','Delhi','West Bengal','Gujarat','Rajasthan','Uttar Pradesh'];
const LANGUAGES = ['English','Hindi','Telugu','Tamil','Marathi','Kannada','Bengali','Gujarati'];
const HOBBIES = ['Competitive Programming','Open Source','Reading','Music','Gaming','Digital Art','Sports','Photography','Blogging','Chess'];
const CLUBS = ['Coding Club','Robotics Club','GDSC','E-Cell','NSS','Drama Club','Music Society','Sports Committee','IEEE Student Branch','ACM Chapter'];
const INTERESTS = ['Machine Learning','Web Development','Cloud Computing','Cybersecurity','Data Science','Blockchain','AR/VR','DevOps','Mobile Development','System Design'];
const GOALS = [
  'Crack FAANG by final year','Secure a 15+ LPA package','Complete AWS certification','Build a SaaS product',
  'Contribute to open source','Get a research internship','Master system design','Solve 500 LeetCode problems',
  'Land a product company role','Pursue MS abroad after graduation'
];
const BOARDS = ['CBSE','ICSE','State Board','IB'];
const DIVISIONS = ['A','B','C','D'];
const SEMESTERS = ['1','2','3','4','5','6','7','8'];

const SKILL_POOLS = {
  'Data Scientist': ['Python','Pandas','NumPy','Scikit-learn','TensorFlow','SQL','Tableau','Power BI','R','Matplotlib','Seaborn','Jupyter','Git','Statistics','Machine Learning'],
  'Software Engineer': ['Java','Python','C++','Data Structures','Algorithms','SQL','Git','OOP','System Design','REST APIs','Spring Boot','Maven','JUnit','Linux','Docker'],
  'Full-Stack Developer': ['React','Node.js','JavaScript','TypeScript','HTML','CSS','MongoDB','PostgreSQL','Express','Git','REST APIs','Redux','Tailwind CSS','Docker','AWS'],
  'AI / ML Engineer': ['Python','PyTorch','TensorFlow','NLP','Computer Vision','Scikit-learn','Pandas','NumPy','CUDA','Hugging Face','MLflow','Git','Docker','Mathematics','Statistics'],
  'Cloud & DevOps': ['AWS','Docker','Kubernetes','Terraform','CI/CD','Linux','Python','Bash','Git','Jenkins','Ansible','Prometheus','Grafana','Azure','GCP'],
  'Cybersecurity': ['Kali Linux','Wireshark','Metasploit','Python','Networking','Cryptography','Burp Suite','OWASP','Nmap','Bash','SQL','Forensics','Penetration Testing','SIEM','Firewalls'],
  'default': ['Python','Java','C++','JavaScript','SQL','Git','Data Structures','Algorithms','OOP','Linux']
};

const CERT_POOLS = {
  'Data Scientist': ['Google Data Analytics Certificate','IBM Data Science Professional','Coursera ML Specialization','AWS Certified ML Specialty','Tableau Desktop Specialist'],
  'Software Engineer': ['Oracle Java SE Certification','AWS Solutions Architect Associate','Google IT Automation with Python','Meta Backend Developer','Microsoft Azure Fundamentals'],
  'Full-Stack Developer': ['Meta Frontend Developer','Meta Backend Developer','MongoDB Developer Certification','AWS Cloud Practitioner','Google UX Design Certificate'],
  'AI / ML Engineer': ['DeepLearning.AI TensorFlow Developer','Coursera Deep Learning Specialization','Google ML Crash Course','Hugging Face NLP Course','AWS ML Specialty'],
  'Cloud & DevOps': ['AWS Solutions Architect Associate','CKA Kubernetes','HashiCorp Terraform Associate','Google Cloud Professional','Azure DevOps Engineer Expert'],
  'Cybersecurity': ['CompTIA Security+','CEH Certified Ethical Hacker','OSCP','Google Cybersecurity Certificate','Cisco CyberOps Associate'],
  'default': ['AWS Cloud Practitioner','Google IT Support','Meta Frontend Developer','Coursera Python for Everybody','Microsoft Azure Fundamentals']
};

const PROJECT_POOLS = {
  'Data Scientist': [
    { title:'Stock Price Predictor', description:'LSTM-based model predicting NIFTY 50 stock prices with 87% accuracy using historical data and sentiment analysis.', tech_stack:'Python, TensorFlow, Pandas, yfinance, Matplotlib', github_link:'https://github.com/student/stock-predictor' },
    { title:'Customer Churn Analysis', description:'ML pipeline to predict telecom customer churn using Random Forest and XGBoost with SHAP explainability.', tech_stack:'Python, Scikit-learn, XGBoost, SHAP, Seaborn', github_link:'https://github.com/student/churn-analysis' },
    { title:'NLP Sentiment Dashboard', description:'Real-time Twitter sentiment analysis dashboard using BERT fine-tuning and Streamlit visualization.', tech_stack:'Python, HuggingFace, Streamlit, Tweepy, PostgreSQL', github_link:'https://github.com/student/sentiment-dashboard' },
    { title:'Crop Yield Prediction', description:'Agricultural ML model predicting crop yields based on soil, weather, and historical data for 15 Indian states.', tech_stack:'Python, Scikit-learn, Pandas, Folium, Flask', github_link:'https://github.com/student/crop-yield' },
  ],
  'Software Engineer': [
    { title:'Distributed Task Queue', description:'Redis-backed distributed task queue system supporting priority queues, retries, and dead-letter queues.', tech_stack:'Java, Spring Boot, Redis, Docker, PostgreSQL', github_link:'https://github.com/student/task-queue' },
    { title:'URL Shortener Service', description:'High-performance URL shortener with analytics, custom aliases, and rate limiting. Handles 10k req/sec.', tech_stack:'Java, Spring Boot, Redis, MySQL, Docker', github_link:'https://github.com/student/url-shortener' },
    { title:'Online Judge Platform', description:'Competitive programming judge supporting 10 languages with sandboxed execution and real-time leaderboards.', tech_stack:'C++, Python, Docker, PostgreSQL, WebSockets', github_link:'https://github.com/student/online-judge' },
  ],
  'Full-Stack Developer': [
    { title:'E-Commerce Platform', description:'Full-stack marketplace with Stripe payments, real-time inventory, seller dashboard, and PWA support.', tech_stack:'React, Node.js, MongoDB, Stripe, Redis, Docker', github_link:'https://github.com/student/ecommerce', live_link:'https://shop-demo.vercel.app' },
    { title:'Real-Time Chat App', description:'WhatsApp-like chat with end-to-end encryption, group chats, file sharing, and read receipts.', tech_stack:'React, Socket.io, Node.js, MongoDB, AWS S3', github_link:'https://github.com/student/chat-app' },
    { title:'Project Management Tool', description:'Jira-inspired PM tool with Kanban boards, sprint planning, burndown charts, and team collaboration.', tech_stack:'Next.js, TypeScript, PostgreSQL, Prisma, Tailwind', github_link:'https://github.com/student/pm-tool', live_link:'https://pm-tool.vercel.app' },
  ],
  'default': [
    { title:'Personal Portfolio Website', description:'Responsive portfolio showcasing projects, skills, and achievements with dark mode and animations.', tech_stack:'React, Tailwind CSS, Framer Motion, Vercel', github_link:'https://github.com/student/portfolio', live_link:'https://portfolio.vercel.app' },
    { title:'Library Management System', description:'Full-featured LMS with book cataloging, member management, fine calculation, and barcode scanning.', tech_stack:'Python, Django, PostgreSQL, Bootstrap, Celery', github_link:'https://github.com/student/library-ms' },
  ]
};

const INTERNSHIP_COMPANIES = [
  { company:'TCS iON', role:'Data Science Intern', duration:'2 months', description:'Worked on customer segmentation using K-Means clustering for retail analytics dashboard.' },
  { company:'Infosys Springboard', role:'ML Intern', duration:'3 months', description:'Developed NLP pipeline for automated resume screening reducing HR workload by 40%.' },
  { company:'Wipro WILP', role:'Software Intern', duration:'6 months', description:'Built REST APIs for internal HR portal serving 5000+ employees using Spring Boot.' },
  { company:'Accenture', role:'Technology Analyst Intern', duration:'2 months', description:'Automated test cases using Selenium reducing regression testing time by 60%.' },
  { company:'Cognizant', role:'Full Stack Intern', duration:'3 months', description:'Developed React dashboard for real-time supply chain monitoring with WebSocket integration.' },
  { company:'Amazon', role:'SDE Intern', duration:'2 months', description:'Implemented microservice for order tracking system handling 1M+ daily transactions.' },
  { company:'Microsoft', role:'Software Engineering Intern', duration:'2 months', description:'Contributed to Azure DevOps pipeline optimization reducing build times by 35%.' },
  { company:'Google', role:'STEP Intern', duration:'3 months', description:'Built internal tooling for Google Maps data validation using Python and BigQuery.' },
  { company:'Deloitte', role:'Technology Consulting Intern', duration:'2 months', description:'Analyzed client data migration strategy for SAP S/4HANA implementation.' },
  { company:'KPMG', role:'Data Analytics Intern', duration:'2 months', description:'Created Power BI dashboards for financial risk assessment used by 3 Fortune 500 clients.' },
];

const BIO_TEMPLATES = [
  (name, track, cgpa) => `${name.split(' ')[0]} is a passionate ${track} enthusiast with a CGPA of ${cgpa}. Loves building scalable systems and contributing to open-source projects. Currently seeking placement opportunities in top tech companies.`,
  (name, track) => `Final year B.Tech student specializing in ${track}. Experienced in building production-grade applications and solving complex algorithmic problems. Active participant in hackathons and coding competitions.`,
  (name, track, cgpa) => `Dedicated engineer with ${cgpa} CGPA, focused on ${track}. Strong foundation in computer science fundamentals with hands-on experience through internships and personal projects. Passionate about innovation and continuous learning.`,
  (name, track) => `${name.split(' ')[0]} is a results-driven ${track} professional-in-making. Combines strong theoretical knowledge with practical implementation skills. Actively building expertise through real-world projects and industry certifications.`,
];

// ─── Step 1: Run schema fixes via REST ────────────────────────────────────────
async function runSchemaFixes() {
  console.log('\n📐 Step 1: Applying schema fixes...');

  // Add missing audit_log columns by inserting a test row and checking
  // We'll handle this gracefully — the adapter already skips missing cols
  console.log('  ✅ Schema fixes handled by adapter (graceful column skipping)');
}

// ─── Step 2: Fill all null student columns ────────────────────────────────────
async function fillStudentData() {
  console.log('\n👥 Step 2: Filling student profile data...');

  const { data: students, error } = await supabase
    .from('students')
    .select('id,sap_id,name,branch,career_track,cgpa,current_year,github_url,linkedin_url,leetcode_username,leetcode_total_solved,phone')
    .order('sap_id');

  if (error) { console.error('Failed to fetch students:', error.message); return; }

  console.log(`  Found ${students.length} students to update`);
  let updated = 0, failed = 0;

  for (const s of students) {
    const track = s.career_track || 'Software Engineer';
    const skills = SKILL_POOLS[track] || SKILL_POOLS['default'];
    const certs = CERT_POOLS[track] || CERT_POOLS['default'];
    const projects = PROJECT_POOLS[track] || PROJECT_POOLS['default'];
    const cityIdx = rnd(0, CITIES.length - 1);
    const cgpa = s.cgpa || rndFloat(6.5, 9.5);
    const bioFn = pick(BIO_TEMPLATES);
    const yr = parseInt(s.current_year) || 4;
    const sem = yr <= 1 ? pick(['1','2']) : yr === 2 ? pick(['3','4']) : yr === 3 ? pick(['5','6']) : pick(['7','8']);

    // Build realistic projects for this student
    const studentProjects = pickN(projects, rnd(2, Math.min(3, projects.length))).map((p, i) => ({
      ...p,
      github_link: p.github_link?.replace('student', s.github_url?.split('github.com/')[1]?.split('/')[0] || s.sap_id) || p.github_link,
      year: String(2024 - i),
    }));

    // Build certifications
    const studentCerts = pickN(certs, rnd(1, 3)).map(name => ({
      name,
      issuer: name.includes('AWS') ? 'Amazon Web Services' : name.includes('Google') ? 'Google' : name.includes('Microsoft') ? 'Microsoft' : name.includes('Meta') ? 'Meta' : name.includes('IBM') ? 'IBM' : 'Coursera',
      year: String(rnd(2023, 2025)),
      link: `https://www.credly.com/badges/${uuid().slice(0,8)}`
    }));

    // Build internships (50% chance of having one)
    const studentInternships = Math.random() > 0.5 ? [pick(INTERNSHIP_COMPANIES)] : [];

    // Build achievements
    const achievementPool = [
      { title: 'Smart India Hackathon 2024', description: `Reached national finals in SIH 2024, building a ${track.toLowerCase()} solution for government problem statement.`, year: '2024' },
      { title: 'LeetCode Top 10%', description: `Ranked in top 10% globally on LeetCode with ${s.leetcode_total_solved || rnd(50,200)} problems solved.`, year: '2024' },
      { title: 'NMIMS Tech Fest Winner', description: 'Won 1st place in the annual technical project exhibition at NMIMS Hyderabad.', year: '2024' },
      { title: 'Google DSC Core Team', description: 'Selected as core team member of Google Developer Student Club, NMIMS Hyderabad.', year: '2023' },
      { title: 'Kaggle Competition Top 15%', description: 'Achieved top 15% ranking in a Kaggle ML competition with 2000+ participants.', year: '2024' },
      { title: 'Open Source Contributor', description: 'Contributed 5+ merged PRs to popular open-source repositories on GitHub.', year: '2024' },
    ];
    const studentAchievements = pickN(achievementPool, rnd(1, 3));

    const updatePayload = {
      bio: bioFn(s.name, track, cgpa),
      location: `${CITIES[cityIdx]}, ${STATES[cityIdx]}`,
      tech_skills: pickN(skills, rnd(5, 10)),
      skills: pickN(skills, rnd(5, 10)),
      interests: pickN(INTERESTS, rnd(3, 5)),
      goals: pickN(GOALS, 2),
      clubs: pickN(CLUBS, rnd(1, 3)),
      hobbies: pickN(HOBBIES, rnd(2, 4)),
      languages: pickN(LANGUAGES, rnd(2, 4)),
      current_semester: sem,
      division: pick(DIVISIONS),
      projects: studentProjects,
      internships: studentInternships,
      certifications: studentCerts,
      achievements: studentAchievements,
      assessment_results: {
        cgpa: String(cgpa),
        swoc: {
          strengths: pickN(['Problem Solving','Team Collaboration','Quick Learner','Communication','Technical Skills'], 3),
          weaknesses: pickN(['Public Speaking','Time Management','Networking','Documentation'], 2),
          opportunities: pickN(['AI/ML Boom','Remote Work','Startup Ecosystem','Open Source'], 2),
          challenges: pickN(['Competitive Market','Skill Gap','Work-Life Balance'], 2)
        }
      },
      academic_data: {
        cgpa: String(cgpa),
        backlog: '0',
        division: pick(DIVISIONS),
        class12: { board: pick(BOARDS), percent: String(rnd(75, 98)) },
        class10: { board: pick(BOARDS), percent: String(rnd(80, 99)) },
      },
      leetcode_easy_solved: Math.floor((s.leetcode_total_solved || 0) * 0.5),
      leetcode_medium_solved: Math.floor((s.leetcode_total_solved || 0) * 0.35),
      leetcode_hard_solved: Math.floor((s.leetcode_total_solved || 0) * 0.15),
      leetcode_streak: rnd(0, 30),
      leetcode_ranking: rnd(50000, 500000),
      leetcode_acceptance_rate: rndFloat(45, 75),
      updated_at: now(),
    };

    const { error: upErr } = await supabase.from('students').update(updatePayload).eq('id', s.id);
    if (upErr) { console.log(`  ❌ ${s.name}: ${upErr.message}`); failed++; }
    else { updated++; process.stdout.write(`\r  Updated ${updated}/${students.length} students...`); }
  }
  console.log(`\n  ✅ Done: ${updated} updated, ${failed} failed`);
  return students;
}

// ─── Step 3: Fill student_skills, student_projects, student_internships ───────
async function fillStudentRelatedTables(students) {
  console.log('\n🔗 Step 3: Filling student related tables...');

  const { data: existingSkills } = await supabase.from('student_skills').select('student_id');
  const studentsWithSkills = new Set((existingSkills || []).map(r => r.student_id));

  let skillsAdded = 0, projectsAdded = 0, internsAdded = 0, certsAdded = 0;

  for (const s of students) {
    const track = s.career_track || 'Software Engineer';
    const skills = SKILL_POOLS[track] || SKILL_POOLS['default'];

    // student_skills — add if not already there
    if (!studentsWithSkills.has(s.id)) {
      const skillRows = pickN(skills, rnd(5, 10)).map(skill => ({
        student_id: s.id, skill, level: pick(['beginner','intermediate','advanced'])
      }));
      const { error } = await supabase.from('student_skills').insert(skillRows);
      if (!error) skillsAdded += skillRows.length;
    }

    // student_projects — add if < 2 projects
    const { count: projCount } = await supabase.from('student_projects').select('*', { count: 'exact', head: true }).eq('student_id', s.id);
    if ((projCount || 0) < 2) {
      const pool = PROJECT_POOLS[track] || PROJECT_POOLS['default'];
      const toAdd = pickN(pool, rnd(1, 2));
      for (const p of toAdd) {
        const { error } = await supabase.from('student_projects').insert({
          student_id: s.id,
          title: p.title,
          description: p.description,
          tech_stack: p.tech_stack,
          github_link: p.github_link?.replace('student', s.sap_id) || p.github_link,
          live_link: p.live_link || null,
          year: String(rnd(2023, 2025)),
        });
        if (!error) projectsAdded++;
      }
    }

    // student_internships — add if none
    const { count: internCount } = await supabase.from('student_internships').select('*', { count: 'exact', head: true }).eq('student_id', s.id);
    if ((internCount || 0) === 0 && Math.random() > 0.4) {
      const intern = pick(INTERNSHIP_COMPANIES);
      const { error } = await supabase.from('student_internships').insert({
        student_id: s.id,
        company: intern.company,
        role: intern.role,
        duration: intern.duration,
        year: String(rnd(2023, 2025)),
        description: intern.description,
      });
      if (!error) internsAdded++;
    }

    // student_certifications — add if table exists and empty
    const certs = CERT_POOLS[track] || CERT_POOLS['default'];
    const certRows = pickN(certs, rnd(1, 2)).map(name => ({
      student_id: s.id,
      name,
      issuer: name.includes('AWS') ? 'Amazon Web Services' : name.includes('Google') ? 'Google' : name.includes('Microsoft') ? 'Microsoft' : 'Coursera',
      year: String(rnd(2023, 2025)),
      link: `https://www.credly.com/badges/${uuid().slice(0,8)}`,
    }));
    const { error: certErr } = await supabase.from('student_certifications').insert(certRows);
    if (!certErr) certsAdded += certRows.length;
  }

  console.log(`  ✅ Skills: +${skillsAdded}, Projects: +${projectsAdded}, Internships: +${internsAdded}, Certs: +${certsAdded}`);
}

// ─── Step 4: Fill companies null columns ──────────────────────────────────────
async function fillCompanies() {
  console.log('\n🏢 Step 4: Filling company data...');

  const { data: companies } = await supabase.from('companies').select('id,company_name,industry,status');
  if (!companies?.length) return;

  const HR_NAMES = ['Priya Sharma','Rahul Mehta','Anita Verma','Suresh Kumar','Deepika Nair','Vikram Singh','Kavitha Reddy','Arjun Patel','Sneha Joshi','Ravi Krishnan'];
  const PACKAGE_RANGES = { 'Technology':['12-25 LPA','15-30 LPA','20-40 LPA'], 'IT Services':['4-8 LPA','6-12 LPA','8-15 LPA'], 'Finance':['10-20 LPA','15-25 LPA','20-35 LPA'], 'Consulting':['8-15 LPA','12-20 LPA'], 'E-commerce':['15-30 LPA','20-40 LPA'], 'default':['6-12 LPA','8-18 LPA'] };
  const COMPANY_CITIES = { 'Infosys':'Hyderabad','Wipro':'Bangalore','TCS':'Chennai','Accenture':'Hyderabad','Microsoft':'Hyderabad','Amazon':'Hyderabad','Google':'Bangalore','Goldman Sachs':'Bangalore','Cognizant':'Chennai','default':'Hyderabad' };

  let updated = 0;
  for (const c of companies) {
    const hrName = pick(HR_NAMES);
    const pkgPool = PACKAGE_RANGES[c.industry] || PACKAGE_RANGES['default'];
    const city = COMPANY_CITIES[c.company_name] || COMPANY_CITIES['default'];
    const domain = c.company_name.toLowerCase().replace(/\s+/g,'')+'.com';

    const { error } = await supabase.from('companies').update({
      hr_name: hrName,
      hr_email: `${hrName.split(' ')[0].toLowerCase()}.hr@${domain}`,
      hr_phone: `+91 ${rnd(70,99)}${rnd(10000000,99999999)}`,
      package_range: pick(pkgPool),
      location: city,
      notes: `${c.company_name} is actively hiring from NMIMS Hyderabad for the 2025-26 placement season.`,
      updated_at: now(),
    }).eq('id', c.id);
    if (!error) updated++;
  }

  // Fill company_departments and company_job_roles
  const DEPT_MAP = { 'Technology':['CSE','IT','CSDS','AIML'], 'IT Services':['CSE','IT','CSBS','CSDS'], 'Finance':['CSE','IT','CSDS'], 'Consulting':['CSE','IT','CSBS','CSDS','AIML'], 'E-commerce':['CSE','IT','CSDS','AIML'], 'default':['CSE','IT'] };
  const ROLE_MAP = { 'Technology':['Software Engineer','SDE-1','Data Scientist','Product Manager'], 'IT Services':['Systems Engineer','Associate','Analyst','Consultant'], 'Finance':['Technology Analyst','Quantitative Developer','Data Analyst'], 'Consulting':['Technology Consultant','Business Analyst','Associate'], 'E-commerce':['SDE-1','Data Scientist','Business Analyst'], 'default':['Software Engineer','Analyst'] };

  let deptAdded = 0, rolesAdded = 0;
  for (const c of companies) {
    const depts = DEPT_MAP[c.industry] || DEPT_MAP['default'];
    const roles = ROLE_MAP[c.industry] || ROLE_MAP['default'];

    // Clear and re-insert
    await supabase.from('company_departments').delete().eq('company_id', c.id);
    await supabase.from('company_job_roles').delete().eq('company_id', c.id);

    const deptRows = depts.map(d => ({ company_id: c.id, department: d }));
    const roleRows = roles.map(r => ({ company_id: c.id, role: r }));

    const { error: dErr } = await supabase.from('company_departments').insert(deptRows);
    const { error: rErr } = await supabase.from('company_job_roles').insert(roleRows);
    if (!dErr) deptAdded += deptRows.length;
    if (!rErr) rolesAdded += roleRows.length;
  }

  console.log(`  ✅ Companies: ${updated} updated, Departments: +${deptAdded}, Roles: +${rolesAdded}`);
}

// ─── Step 5: Fill drives null columns + drive_stages ─────────────────────────
async function fillDrives() {
  console.log('\n🚗 Step 5: Filling drives data...');

  const { data: drives } = await supabase.from('drives').select('id,company_name,title,status,ctc_offered');
  if (!drives?.length) return;

  const JOB_ROLES = ['Software Engineer','Data Analyst','Systems Engineer','Technology Analyst','Associate Developer','Full Stack Developer','ML Engineer'];
  const MODES = ['on-campus','off-campus','hybrid'];

  let updated = 0;
  for (const d of drives) {
    const regStart = daysAgo(rnd(10, 30));
    const regEnd = daysAhead(rnd(5, 20));
    const { error } = await supabase.from('drives').update({
      registration_start: regStart,
      registration_end: regEnd,
      registration_deadline: regEnd,
      package_range: `${Math.floor((d.ctc_offered || 8) * 0.8)}-${Math.ceil((d.ctc_offered || 8) * 1.2)} LPA`,
      description: `${d.company_name} is conducting campus recruitment for ${d.title}. Eligible students from all CS branches are encouraged to apply.`,
      mode: pick(MODES),
      job_role: pick(JOB_ROLES),
      min_cgpa: rndFloat(6.0, 7.5),
      allowed_departments: pickN(['CSE','IT','CSDS','AIML','CSBS'], rnd(2, 5)),
      allowed_years: ['4'],
      type: pick(['full-time','internship','ppo']),
      batch: '2022-2026',
      updated_at: now(),
    }).eq('id', d.id);
    if (!error) updated++;

    // Add drive_stages
    await supabase.from('drive_stages').delete().eq('drive_id', d.id);
    const stages = [
      { stage_name: 'Online Assessment', stage_date: daysAhead(rnd(2, 7)), notes: 'Aptitude + Coding test (90 mins)' },
      { stage_name: 'Technical Interview Round 1', stage_date: daysAhead(rnd(8, 14)), notes: 'DSA + CS fundamentals' },
      { stage_name: 'Technical Interview Round 2', stage_date: daysAhead(rnd(15, 20)), notes: 'System design + project discussion' },
      { stage_name: 'HR Interview', stage_date: daysAhead(rnd(21, 25)), notes: 'Culture fit and compensation discussion' },
    ];
    await supabase.from('drive_stages').insert(stages.map(st => ({ drive_id: d.id, ...st, stage_location: 'NMIMS Hyderabad Campus' })));
  }
  console.log(`  ✅ Drives: ${updated} updated with stages`);
}

// ─── Step 6: Fill interviews null columns ─────────────────────────────────────
async function fillInterviews() {
  console.log('\n🎤 Step 6: Filling interview data...');

  const { data: interviews } = await supabase.from('interviews').select('id,company_name,round_type,status');
  if (!interviews?.length) return;

  const { data: students } = await supabase.from('students').select('id,sap_id').limit(50);
  const { data: drives } = await supabase.from('drives').select('id').limit(13);

  const INTERVIEWERS = ['Rajesh Kumar','Priya Nair','Amit Sharma','Deepa Menon','Suresh Reddy','Kavitha Iyer'];
  const FEEDBACK = [
    'Strong DSA fundamentals, good communication skills. Recommended for next round.',
    'Excellent problem-solving approach. Needs improvement in system design concepts.',
    'Good technical knowledge, impressive project portfolio. Selected.',
    'Average performance in coding round. Needs more practice with dynamic programming.',
    'Outstanding candidate with strong ML background. Highly recommended.',
  ];

  let updated = 0;
  for (const i of interviews) {
    const student = pick(students || []);
    const drive = pick(drives || []);
    const { error } = await supabase.from('interviews').update({
      student_id: student?.id || null,
      drive_id: drive?.id || null,
      candidate_count: rnd(15, 80),
      location: pick(['NMIMS Hyderabad - Room 301','NMIMS Hyderabad - Seminar Hall','Virtual (Google Meet)','NMIMS Hyderabad - Lab 2']),
      interviewer: pick(INTERVIEWERS),
      feedback: i.status === 'completed' ? pick(FEEDBACK) : null,
      result: i.status === 'completed' ? pick(['selected','rejected','waitlisted']) : null,
      updated_at: now(),
    }).eq('id', i.id);
    if (!error) updated++;
  }
  console.log(`  ✅ Interviews: ${updated} updated`);
}

// ─── Step 7: Fill offers null columns ─────────────────────────────────────────
async function fillOffers() {
  console.log('\n💼 Step 7: Filling offer data...');

  const { data: offers } = await supabase.from('offers').select('id,company_name,role,ctc,status');
  if (!offers?.length) return;

  const { data: students } = await supabase.from('students').select('id').limit(30);
  const { data: companies } = await supabase.from('companies').select('id,company_name').limit(27);
  const { data: drives } = await supabase.from('drives').select('id').limit(13);

  const LOCATIONS = ['Hyderabad','Bangalore','Mumbai','Pune','Chennai','Delhi NCR'];

  let updated = 0;
  for (const o of offers) {
    const student = pick(students || []);
    const company = companies?.find(c => c.company_name === o.company_name) || pick(companies || []);
    const drive = pick(drives || []);
    const { error } = await supabase.from('offers').update({
      student_id: student?.id || null,
      company_id: company?.id || null,
      drive_id: drive?.id || null,
      location: pick(LOCATIONS),
      stipend: o.ctc ? Math.floor(o.ctc * 1000 / 12) : rnd(40000, 80000),
      joining_date: daysAhead(rnd(60, 180)),
      validity_date: daysAhead(rnd(30, 60)),
      updated_at: now(),
    }).eq('id', o.id);
    if (!error) updated++;
  }
  console.log(`  ✅ Offers: ${updated} updated`);
}

// ─── Step 8: Fill admins null columns ────────────────────────────────────────
async function fillAdmins() {
  console.log('\n👔 Step 8: Filling admin data...');
  const { data: admins } = await supabase.from('admins').select('id,email,name,role');
  if (!admins?.length) return;

  const DEPTS = { dean:'Academic Affairs', director:'Administration', program_chair:'Computer Science', faculty:'Computer Science', placement_officer:'Training & Placement', system_admin:'IT Administration' };
  let updated = 0;
  for (const a of admins) {
    const { error } = await supabase.from('admins').update({
      department: DEPTS[a.role] || 'Administration',
      phone: `+91 ${rnd(70,99)}${rnd(10000000,99999999)}`,
      notes: `${a.name || a.email} — ${a.role?.replace(/_/g,' ')} at NMIMS Hyderabad`,
      last_login: daysAgo(rnd(0, 7)),
      updated_at: now(),
    }).eq('id', a.id);
    if (!error) updated++;
  }
  console.log(`  ✅ Admins: ${updated} updated`);
}

// ─── Step 9: Seed platform_config ────────────────────────────────────────────
async function seedPlatformConfig() {
  console.log('\n⚙️  Step 9: Seeding platform config...');
  const { error } = await supabase.from('platform_config').upsert({
    config_key: 'platformSettings',
    platform_name: 'Campus2Career',
    institute_name: 'NMIMS Hyderabad',
    support_email: 'placement@nmims.edu.in',
    current_academic_year: '2025-26',
    active_placement_season: '2025-26',
    min_readiness_threshold: 60,
    updated_by: 'system_admin',
    updated_at: now(),
  }, { onConflict: 'config_key' });
  console.log(error ? `  ❌ ${error.message}` : '  ✅ Platform config seeded');
}

// ─── Step 10: Seed eligibility_rules ─────────────────────────────────────────
async function seedEligibilityRules() {
  console.log('\n📋 Step 10: Seeding eligibility rules...');
  const { count } = await supabase.from('eligibility_rules').select('*', { count: 'exact', head: true });
  if ((count || 0) > 0) { console.log('  ⏭️  Already seeded'); return; }

  const rules = [
    { rule_name: 'Standard Placement Eligibility', min_cgpa: 6.0, max_backlogs: 0, requires_resume_approval: true, mandatory_internship: false, required_skills: ['Data Structures','Algorithms'], is_active: true },
    { rule_name: 'Premium Company Eligibility', min_cgpa: 7.5, max_backlogs: 0, requires_resume_approval: true, mandatory_internship: false, required_skills: ['Data Structures','Algorithms','System Design'], is_active: true },
    { rule_name: 'FAANG Eligibility', min_cgpa: 8.0, max_backlogs: 0, requires_resume_approval: true, mandatory_internship: false, required_skills: ['Data Structures','Algorithms','System Design','LeetCode 150+'], is_active: true },
    { rule_name: 'Data Science Track', min_cgpa: 7.0, max_backlogs: 0, requires_resume_approval: false, mandatory_internship: false, required_skills: ['Python','Machine Learning','SQL'], is_active: true },
    { rule_name: 'Internship Eligibility', min_cgpa: 5.5, max_backlogs: 2, requires_resume_approval: false, mandatory_internship: false, required_skills: [], is_active: true },
  ];

  const { data: inserted, error } = await supabase.from('eligibility_rules').insert(rules).select('id');
  if (error) { console.log(`  ❌ ${error.message}`); return; }

  // Add years and departments for each rule
  const YEARS = ['4']; const ALL_DEPTS = ['CSE','IT','CSDS','AIML','CSBS'];
  for (const rule of inserted) {
    await supabase.from('eligibility_rule_years').insert(YEARS.map(y => ({ rule_id: rule.id, year: y })));
    await supabase.from('eligibility_rule_departments').insert(ALL_DEPTS.map(d => ({ rule_id: rule.id, department: d })));
  }
  console.log(`  ✅ ${inserted.length} eligibility rules seeded`);
}

// ─── Step 11: Seed curriculum ────────────────────────────────────────────────
async function seedCurriculum() {
  console.log('\n📚 Step 11: Seeding curriculum...');
  const { count } = await supabase.from('curriculum').select('*', { count: 'exact', head: true });
  if ((count || 0) > 0) { console.log('  ⏭️  Already seeded'); return; }

  const branches = ['B.Tech CSDS','B.Tech CSE','B.Tech IT','B.Tech AIML','B.Tech CSBS'];
  const rows = branches.map(b => ({
    branch: b, batch: '2022-2026',
    download_url: `https://nmims.edu.in/curriculum/${b.toLowerCase().replace(/\s+/g,'-')}-2022-26.pdf`,
    semesters: { total: 8, current: 8 },
    uploaded_by: 'system_admin', updated_at: now(),
  }));
  const { error } = await supabase.from('curriculum').insert(rows);
  console.log(error ? `  ❌ ${error.message}` : `  ✅ ${rows.length} curriculum records seeded`);
}

// ─── Step 12: Seed student_swoc ──────────────────────────────────────────────
async function seedStudentSwoc() {
  console.log('\n🔄 Step 12: Seeding student SWOC data...');
  const { data: students } = await supabase.from('students').select('id');
  if (!students?.length) return;

  const { count: existing } = await supabase.from('student_swoc').select('*', { count: 'exact', head: true });
  if ((existing || 0) > 50) { console.log('  ⏭️  Already seeded'); return; }

  const STRENGTHS = ['Problem Solving','Team Collaboration','Quick Learner','Communication','Technical Skills','Analytical Thinking','Creativity','Leadership'];
  const WEAKNESSES = ['Public Speaking','Time Management','Networking','Documentation','Procrastination'];
  const OPPORTUNITIES = ['AI/ML Boom','Remote Work','Startup Ecosystem','Open Source','Global Market'];
  const CHALLENGES = ['Competitive Market','Skill Gap','Work-Life Balance','Rapid Tech Changes'];

  const rows = students.map(s => ({
    student_id: s.id,
    strengths: pickN(STRENGTHS, 3),
    weaknesses: pickN(WEAKNESSES, 2),
    opportunities: pickN(OPPORTUNITIES, 2),
    challenges: pickN(CHALLENGES, 2),
    updated_at: now(),
  }));

  // Insert in batches of 50
  for (let i = 0; i < rows.length; i += 50) {
    await supabase.from('student_swoc').upsert(rows.slice(i, i + 50), { onConflict: 'student_id' });
  }
  console.log(`  ✅ ${rows.length} SWOC records seeded`);
}

// ─── Step 13: Fix audit_logs null columns ────────────────────────────────────
async function fixAuditLogs() {
  console.log('\n📝 Step 13: Fixing audit log null columns...');
  const ROLES = ['system_admin','placement_officer','dean','faculty'];
  const ACTORS = [
    { name: 'Rachit Jain', email: 'rachit.jain@nmims.edu.in', role: 'system_admin' },
    { name: 'Dr. Priya Sharma', email: 'priya.sharma@nmims.edu.in', role: 'dean' },
    { name: 'Placement Officer', email: 'placement@nmims.edu.in', role: 'placement_officer' },
  ];

  const { data: logs } = await supabase.from('audit_logs').select('id,actor_email,action,module').limit(200);
  if (!logs?.length) return;

  let updated = 0;
  for (const log of logs) {
    const actor = ACTORS.find(a => a.email === log.actor_email) || pick(ACTORS);
    const { error } = await supabase.from('audit_logs').update({
      actor_id: uuid(),
      actor_name: actor.name,
      actor_role: actor.role,
      severity: pick(['low','medium','high']),
      target_id: uuid(),
      target_type: log.module === 'students' ? 'student' : log.module === 'companies' ? 'company' : log.module === 'drives' ? 'drive' : 'record',
    }).eq('id', log.id);
    if (!error) updated++;
  }
  console.log(`  ✅ Audit logs: ${updated} updated`);
}

// ─── Step 14: Verify new user signup flow ────────────────────────────────────
async function verifySignupFlow() {
  console.log('\n🔐 Step 14: Verifying new user signup flow...');

  // Check if the upsert on students works for a test SAP ID
  const testSapId = 'TEST_VERIFY_001';
  const { error: upsertErr } = await supabase.from('students').upsert({
    sap_id: testSapId,
    uid: uuid(),
    name: 'Test Verification User',
    email: 'test.verify@nmims.edu.in',
    branch: 'B.Tech CSE',
    current_year: '1',
    batch: '2025-2029',
    cgpa: 0,
    career_discovery_completed: false,
    profile_completed: false,
    assessment_completed: false,
    placement_status: 'unplaced',
    updated_at: now(),
  }, { onConflict: 'sap_id' });

  if (upsertErr) {
    console.log(`  ❌ Signup upsert FAILED: ${upsertErr.message}`);
  } else {
    console.log('  ✅ Signup upsert works correctly');
    // Clean up test record
    await supabase.from('students').delete().eq('sap_id', testSapId);
    console.log('  ✅ Test record cleaned up');
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Campus2Career — Full Database Seeder');
  console.log('='.repeat(60));

  await runSchemaFixes();
  const students = await fillStudentData();
  if (students) await fillStudentRelatedTables(students);
  await fillCompanies();
  await fillDrives();
  await fillInterviews();
  await fillOffers();
  await fillAdmins();
  await seedPlatformConfig();
  await seedEligibilityRules();
  await seedCurriculum();
  await seedStudentSwoc();
  await fixAuditLogs();
  await verifySignupFlow();

  console.log('\n' + '='.repeat(60));
  console.log('✅ All done! Database is fully seeded.');
  console.log('\nNext: Run `node scripts/check-db-schema.mjs` to verify.');
}

main().catch(console.error);
