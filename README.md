# Campus2Career — Virtual Placement Assistant

An AI-powered career guidance and placement management platform designed for students transitioning from campus to professional careers.

---

## 🚀 Overview

**Campus2Career** is a dual-portal platform that empowers students with personalized, data-driven career guidance while providing administrators with a robust system to track and manage placements.

- **Student Portal**: Career discovery, skill tracking, LeetCode integration, AI interview simulator, resume analysis, and personalized roadmap generation.
- **Admin Portal**: Role-based management for Deans, Directors, Program Chairs, Faculty, and Placement Officers with detailed batch analytics, company/drive tracking, and audit logs.

---

## ✨ Key Features

### For Students
- **AI Career Advisor**: Real-time chat integration with OpenRouter (Gemini 2.0 Flash, Claude 3.5 Haiku, Llama 3.1) for career assessments and guidance.
- **Skill Gap Analysis**: Compares student profiles against 6 industry-standard benchmarks (Full-Stack, AI/ML, DevOps, etc.).
- **AI Interview Simulator**: Voice-enabled practice interviews with AI-generated technical and behavioral questions.
- **Resume Analyzer**: ATS-based scoring and optimization suggestions using a Python NLP engine.
- **Personalized Roadmaps**: 4-year prioritized action plans mapped to academic milestones.
- **Study Kit Generation**: Comprehensive notes with theoretical foundations, algorithms, and academic references.
- **Syllabus-Driven Learning**: Upload syllabus PDFs to generate personalized learning roadmaps.

### For Administrators
- **Role-Based Access Control (RBAC)**: 6 distinct portals with specific permissions and views.
- **Batch Analytics**: Comprehensive dashboards showing placement readiness, skill distributions, and eligibility metrics.
- **Placement Management**: End-to-end tracking of companies, placement drives, interviews, and final offers.
- **Audit Logs & Tools**: Systematic tracking of all administrative actions and powerful data-seeding tools.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 6, Tailwind CSS 4, Recharts, Lucide React |
| **Backend** | Node.js, Express 5, SQLite via Prisma ORM 6 |
| **AI / NLP** | OpenRouter API via FastAPI proxy (Gemini 2.0 Flash, Claude 3.5 Haiku, Llama 3.1 70B), Python FastAPI |
| **Database / Auth** | Supabase Auth, Supabase PostgreSQL, Supabase Storage |
| **Infrastructure** | Firebase Hosting, Supabase Cloud |

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- Node.js 18+
- Python 3.10+ (for AI Engine)
- Git

### 2. Global Setup (Frontend)
```bash
# Clone the repository
git clone https://github.com/Rachit-Jain-24/Campus2Career.git
cd vpa-v2

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your Supabase and OpenRouter API keys
```

### 3. Backend Setup (Optional but Recommended)
```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev
npm run dev # Starts server on http://localhost:5000
```

### 4. AI Engine Setup (Optional)
```bash
cd ai-engine
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python main.py # Starts AI engine on http://localhost:8000
```

### 5. Start Development
```bash
# From the root directory
npm run dev # Starts frontend on http://localhost:5173
```

---

## 🔑 Environment Variables

Create a `.env` file in the root with the following:

```env
# Firebase Configuration (for auth compatibility)
# Supabase Configuration (Auth + Primary Database)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_DB_PROVIDER=supabase

# Judge0 Code Execution (Optional)
VITE_JUDGE0_API_KEY=your_judge0_key
VITE_JUDGE0_BASE_URL=https://judge0-ce.p.rapidapi.com

# AI Backend URL (FastAPI proxy; keep OPENROUTER_API_KEY server-side)
VITE_AI_BACKEND_URL=http://localhost:8000
```

---

## 🗝️ Portals & Demo Accounts

### Portals
- **Student**: `/login`
- **Admin Portal Selector**: `/portal`
- **Direct Admin Logins**: `/login/admin`, `/login/dean`, `/login/director`, `/login/program-chair`, `/login/faculty`, `/login/placement-officer`

### Demo Access
Use the unified auth page or portal selector for demos. Admin preview/mock login is available only where enabled for local demonstration and should remain disabled for production.

---

## 🏗️ Project Structure

```
vpa-v2/
├── src_1/                    # Core frontend code
│   ├── components/           # Reusable UI components
│   ├── pages/                # Page components (student, admin, auth)
│   ├── lib/                  # Core logic engines
│   │   ├── ai/               # AI services (chatbot, copilot, RAG)
│   │   ├── openRouter.ts     # OpenRouter API integration
│   │   └── supabase.ts       # Database client
│   ├── services/             # API services
│   ├── contexts/             # React contexts (Auth, Toast)
│   └── hooks/                # Custom React hooks
├── server/                   # Express backend and Prisma/SQLite
├── ai-engine/                # Python FastAPI service for NLP
├── public/                   # Static assets
└── dist/                     # Production build
```

---

## 🤖 AI Features

### OpenRouter Integration
The platform uses OpenRouter as the primary AI provider with multi-model fallback:
- **Gemini 2.0 Flash** - Primary model for fast responses
- **Claude 3.5 Haiku** - Fallback for complex reasoning
- **Llama 3.1 70B** - Fallback for diverse tasks

### RAG-Powered Chatbot
- Retrieves relevant knowledge from curated career guidance content
- Provides transparent citations for all AI-generated responses
- Falls back gracefully when API is unavailable

### Study Kit Generation
- Comprehensive theoretical foundations with mathematical underpinnings
- Academic references (IEEE, ACM, Stanford, MIT)
- Industry applications and interview preparation
- Algorithm complexity analysis

---

## 📄 License

Developed for **NMIMS Hyderabad** (B.Tech CSE - Data Science, Semester 8).  
© 2025–2026 Rachit Jain, Prasad Kannawar, Venkatesh Mahindra.
