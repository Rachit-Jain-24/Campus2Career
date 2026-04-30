# Campus2Career — Project Reference

**Project Name:** Campus2Career (Virtual Placement Assistant)  
**Team:** Rachit Jain, Prasad Kannawar, Venkatesh Mahindra  
**Program:** B.Tech CSE (Data Science), Semester 8  
**Institution:** NMIMS Hyderabad  
**Duration:** August 2025 – February 2026  

---

## 1. Problem Statement

Students transitioning from campus to career face:
- No personalized, data-driven career guidance
- No systematic way to track placement readiness over 4 years
- Difficulty identifying skill gaps vs. industry benchmarks
- Limited structured interview practice
- Manual, inefficient placement management by administrators

---

## 2. Solution Overview

A dual-portal AI-powered platform:

- **Student Portal** — Career discovery, skill tracking, LeetCode integration, AI interview simulator, resume analysis, personalized roadmaps
- **Admin Portal** — Role-based placement management, batch analytics, company/drive/offer tracking, audit logs

---

## 3. Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 |
| Routing | React Router DOM 7 |
| Charts | Recharts |
| Icons | Lucide React |
| AI | OpenRouter via FastAPI proxy (Gemini 2.0 Flash primary, Claude/Llama fallback) |
| PDF | pdf-parse, pdfjs-dist |
| Auth | Supabase Auth |

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express 5 |
| Database | SQLite via Prisma ORM 6 |
| Port | 5000 (default) |

### AI / NLP
| Service | Purpose |
|---|---|
| OpenRouter models | Career assessment, interview Q generation, answer evaluation |
| Python FastAPI (ai-engine/) | AI proxy, resume NLP analysis, speech pattern analysis |
| Local fallback | Keyword-based ATS scoring when Python backend is offline |

### Infrastructure
| Service | Purpose |
|---|---|
| Supabase Auth | Student + admin authentication |
| Supabase PostgreSQL | Primary relational database |
| Supabase Storage | Resume PDF uploads |
| Firebase Hosting | Frontend deployment |

---

## 4. Project Structure

```
vpa-v2/
├── src/
│   ├── pages/
│   │   ├── auth/           # LoginPage, SignupPage
│   │   ├── student/        # Dashboard, Profile, Assessment, LeetCode, Roadmap,
│   │   │                   # InterviewSimulator, ResumeAnalyzer, SkillGapAnalysis
│   │   ├── admin/          # AdminDashboard, StudentsPage, BatchAnalytics,
│   │   │                   # CompaniesPage, DrivesPage, InterviewsPage, OffersPage,
│   │   │                   # ReportsPage, SettingsPage, AuditLogsPage, UsersPage,
│   │   │                   # EligibilityRulesPage, DatabaseTools
│   │   │   └── role/       # DeanDashboard, DirectorDashboard, FacultyDashboard,
│   │   │                   # PlacementOfficerDashboard, ProgramChairDashboard,
│   │   │                   # SystemAdminDashboard
│   │   ├── onboarding/     # CareerDiscoveryPage
│   │   └── role-login/     # PortalSelector + 6 role login pages
│   ├── components/
│   │   ├── admin/          # All admin UI components (audit, companies, dashboard,
│   │   │                   # drives, eligibility, interviews, layout, offers,
│   │   │                   # reports, settings, students, tools, users)
│   │   ├── role/           # RoleLayout, RoleLoginPage (shared portal shell)
│   │   ├── AICareerAdvisor/ # ChatWidget, ChatPanel, SuggestedPrompts
│   │   ├── charts/         # GaugeChart, RadarChart
│   │   ├── layout/         # DashboardLayout, Navbar, Sidebar
│   │   └── ui/             # Button, Card, Input, Badge, Toast, EmptyState,
│   │                       # LoadingSkeleton, ConfirmDialog, LogoutButton
│   ├── routes/
│   │   ├── AdminRoutes.tsx          # Legacy admin portal
│   │   ├── AdminPortalRoutes.tsx    # System Admin portal
│   │   ├── DeanPortalRoutes.tsx
│   │   ├── DirectorPortalRoutes.tsx
│   │   ├── FacultyPortalRoutes.tsx
│   │   ├── PlacementPortalRoutes.tsx
│   │   └── ProgramChairPortalRoutes.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx   # Supabase auth + local mockLogin for demos
│   │   └── ToastContext.tsx
│   ├── lib/
│   │   ├── firebase.ts
│   │   ├── gemini.ts
│   │   ├── aiService.ts
│   │   ├── skillGapAnalysis.ts
│   │   ├── roadmapGenerator.ts
│   │   ├── leetcode.ts
│   │   ├── pdfParser.ts
│   │   └── interviewEngine.ts
│   ├── config/
│   │   ├── admin/           # navigation.ts, permissions.ts, roleHierarchy.ts, roleRoutes.ts
│   │   └── roles/           # roleNavigation.ts
│   ├── services/
│   │   ├── admin/           # audit, companies, drives, eligibility, interviews,
│   │   │                    # offers, reports, settings, students, users services
│   │   └── student/         # syllabus.service.ts
│   ├── hooks/admin/         # useAuditLogs, useCompanies, useDashboardData, useDrives,
│   │                        # useEligibilityRules, useInterviews, useOffers, useReports,
│   │                        # useSettings, useStudents, useUsers
│   ├── types/               # auth.ts, admin.ts, adminDashboard.ts, and all admin types
│   ├── data/                # leetcodeProblems.ts, industryBenchmarks.ts, demoAccounts.ts,
│   │                        # batchStudentsData.ts, mock/
│   └── utils/               # seedDemoAccounts, createAdminAccount, fixStudentProfiles, etc.
├── server/
│   ├── index.ts             # Express API
│   └── prisma/
│       └── schema.prisma    # SQLite schema
└── ai-engine/
    └── main.py              # Python FastAPI AI/NLP backend
```

---

## 5. Authentication Flow

### Student Login
1. Student enters SAP ID/email + password at `/auth`
2. App resolves SAP ID to the linked email through Supabase student data
3. Supabase Auth authenticates with resolved email + password
4. Session cached in `localStorage` as `c2c_user`

### Admin Login
- Admins sign in through the unified `/auth` page
- Portal selector at `/portal` shows all 6 role portals
- Local preview/mock login is available only where explicitly enabled for demos
- After Supabase auth, role is verified from the `admins` table
- Redirects to role-specific dashboard via `getDefaultAdminRoute(role)`

### Admin Roles & Portals
| Role | Portal URL | Dashboard |
|---|---|---|
| system_admin | `/admin/*` | SystemAdminDashboard |
| dean | `/dean/*` | DeanDashboard |
| director | `/director/*` | DirectorDashboard |
| program_chair | `/program-chair/*` | ProgramChairDashboard |
| faculty | `/faculty/*` | FacultyDashboard |
| placement_officer | `/placement/*` | PlacementOfficerDashboard |

### Route Guards
- `ProtectedRoute` — checks authenticated user + role (student vs admin)
- `RoleGuard` — checks specific admin sub-role
- `SystemAdminRoute` — restricts dev/seed tools to system_admin only

---

## 6. Database Structure

### Supabase Tables

**`students`**
```
uid, sapId, rollNo, name, email, branch, currentYear, batch, cgpa,
phone, bio, location, role: 'student',
careerTrack, careerTrackEmoji, careerDiscoveryCompleted,
assessmentResults: { swoc: { strengths, weaknesses, opportunities, challenges } },
techSkills[], projects[], internships[], certifications[], achievements[],
leetcode (username), leetcodeStats: { totalSolved, easySolved, mediumSolved,
  hardSolved, ranking, acceptanceRate, streak, lastUpdated },
resumeUrl, resumeName, resumeDescription,
githubUrl, linkedinUrl,
interviewSessions[],
placementStatus, profileCompleted, onboardingStep,
createdAt, updatedAt
```

**`admins`**
```
uid, role (AdminRole), name, email, department, createdAt
```

**`companies`** — name, industry, website, hrContact, eligibilityCriteria

**`drives`** — companyId, title, eligibilityCriteria, rounds[], status, applicants[]

**`interviews`** — driveId, studentId, round, scheduledDate, status, feedback, result

**`offers`** — studentId, companyId, driveId, package (ctc/stipend/location), status

**`audit_logs`** — userId, action, resource, timestamp, details

### Prisma / SQLite (server/)
Used for server-side user management and digital twin profiles. Schema in `server/prisma/schema.prisma`.

---

## 7. Key Features & Algorithms

### Career Readiness Score (Student Dashboard)
Calculated in real-time from Supabase profile data:
- Profile completeness: 20 pts
- CGPA (9+ = 20, 8+ = 15, 7+ = 10): up to 20 pts
- Technical skills (10+ = 20, 5+ = 15): up to 20 pts
- Projects (4+ = 25, 2+ = 20, 1+ = 10): up to 25 pts
- LeetCode (200+ = 20, 100+ = 15, 50+ = 10): up to 20 pts
- Resume uploaded: 10 pts

### Skill Gap Analysis (`src/lib/skillGapAnalysis.ts`)
Compares student profile against 6 industry role benchmarks:
- Roles: Full-Stack Dev, Data Scientist, Backend Engineer, AI/ML Engineer, Frontend Dev, DevOps
- Readiness score weights: Core skills 40%, Important skills 30%, Nice-to-have 10%, LeetCode 10%, Projects 5%, Internships 5%
- Output: readiness %, missing skills by category, gap analysis, recommendations, estimated time to ready

### Roadmap Generator (`src/lib/roadmapGenerator.ts`)
Algorithm-based (not AI), uses year + career track + skill gaps:
- Generates 6 prioritized action steps (critical/high/medium)
- Maps to academic curriculum (Year 1–4)
- Outputs: skills to master, projects to build, certifications to earn, milestones

### AI Interview Simulator (`src/pages/student/InterviewSimulator.tsx`)
- 3 modes: Technical, Project Deep-Dive, HR/Behavioral
- OpenRouter/Gemini generates 5 resume-specific questions
- Web Speech API for voice recording (120s per answer)
- Dual evaluation: OpenRouter/Gemini (technical score) + Python NLP (communication metrics)
- Stores sessions in `user.interviewSessions[]`

### Resume Analyzer (`src/pages/student/ResumeAnalyzer.tsx`)
- Primary: Python FastAPI backend (`http://localhost:8000/api/analyze-resume`)
- Fallback: Local keyword matching (24 tech keywords)
- Output: ATS match score, missing keywords, optimization suggestions

---

## 8. Running the Project

### Prerequisites
- Node.js 18+
- Python 3.10+ (for AI engine, optional)

### Frontend
```bash
cd vpa-v2
npm install
npm run dev          # http://localhost:5173
npm run build        # Production build
npm run preview      # Preview production build
```

### Backend (Express + Prisma)
```bash
cd vpa-v2/server
npm install
npx prisma generate
npx prisma migrate dev
npm run dev          # http://localhost:5000
```

### AI Engine (Python, optional)
```bash
cd vpa-v2/ai-engine
python -m venv venv
venv/Scripts/activate   # Windows
pip install -r requirements.txt
python main.py           # http://localhost:8000
```

### Environment Variables
Copy `.env.example` to `.env` and fill in:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_GEMINI_API_KEY=
```

---

## 9. Demo Accounts

Seed via `/admin/seed-demo` (requires system_admin login or use the seed page directly).

| SAP ID | Password | Year | Profile |
|---|---|---|---|
| DEMO1001 | demo123 | 1st | 2 projects, 1 cert, 32 LC problems, CGPA 8.2 |
| DEMO2002 | demo123 | 2nd | 3 projects, 2 certs, 1 internship, 67 LC, CGPA 8.7 |
| DEMO3003 | demo123 | 3rd | 4 projects, 3 certs, 2 internships, 142 LC, CGPA 9.1 |
| DEMO4004 | demo123 | 4th | 5 projects, 4 certs, 3 internships, 218 LC, CGPA 9.4 |

Admin demo (use Preview button on login page — no Firebase needed):
- `/login/admin` → Preview as System Admin
- `/login/dean` → Preview as Dean
- `/login/placement-officer` → Preview as Placement Officer

---

## 10. Deployment

- **Frontend:** Firebase Hosting (`firebase deploy`)
- **Backend:** Express server on any Node.js host (Railway, Render, etc.)
- **Database:** Supabase PostgreSQL for active app data; SQLite/Prisma server is legacy prototype code
- **Firebase config:** `.firebaserc` + `firebase.json`

---

## 11. Known Limitations / Future Work

- Legacy SQLite/Prisma server is dev-only; active production data should remain in Supabase PostgreSQL
- Python AI engine must run locally; should be deployed as a microservice
- LeetCode API is unofficial (scraping-based); may break on API changes
- `mockLogin` is dev-only and disabled in production builds
- Resume storage uses Supabase Storage; large-scale deployments may add a CDN
- No real-time notifications (WebSocket/FCM not yet implemented)
- Mobile responsiveness is partial — needs full audit on smaller screens

---

## 12. Report / Presentation Key Points

- **Novelty:** Longitudinal 4-year tracking (not just a one-time assessment tool)
- **AI Integration:** Gemini for career assessment, interview Q&A, and evaluation; Python NLP for resume ATS
- **RBAC:** 6 admin roles with separate portals, not just a single admin panel
- **Real Data:** 30+ student profiles seeded with realistic data for batch analytics
- **Dual Backend:** Firebase (real-time, auth) + Express/Prisma (structured data, server logic)
- **Industry Benchmarks:** Skill gap analysis against 6 real job roles with weighted scoring
