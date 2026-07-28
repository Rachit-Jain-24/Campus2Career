# Campus2Career — Virtual Placement Assistant

An AI-powered career guidance and placement management platform designed for students transitioning from campus to professional careers.

---

## Overview

**Campus2Career** is a dual-portal platform that empowers students with personalized, data-driven career guidance while providing administrators with a robust system to track and manage placements.

- **Student Portal**: Career discovery, skill tracking, LeetCode integration, AI interview simulator, resume analysis, and personalized roadmap generation.
- **Admin Portal**: Role-based management for Deans, Directors, Program Chairs, Faculty, and Placement Officers with detailed batch analytics, company/drive tracking, and audit logs.

---

## Key Features

### For Students
- **AI Career Advisor**: Real-time chat powered by OpenRouter (Gemini 2.0 Flash, Claude 3.5 Haiku, Llama 3.1) for career assessments and guidance.
- **Skill Gap Analysis**: Compares student profiles against 6 industry-standard benchmarks (Full-Stack, AI/ML, DevOps, etc.).
- **AI Interview Simulator**: Voice-enabled practice interviews with AI-generated technical and behavioral questions.
- **Resume Analyzer**: ATS-based scoring and optimization suggestions using a Python NLP engine.
- **Personalized Roadmaps**: 4-year prioritized action plans mapped to NMIMS academic milestones.
- **Study Kit Generation**: Comprehensive notes with theoretical foundations, algorithms, and academic references.
- **Syllabus-Driven Learning**: Upload syllabus PDFs to generate personalized learning roadmaps.

### For Administrators
- **Role-Based Access Control (RBAC)**: 6 distinct portals with specific permissions and views.
- **Batch Analytics**: Comprehensive dashboards showing placement readiness, skill distributions, and eligibility metrics.
- **Placement Management**: End-to-end tracking of companies, placement drives, interviews, and final offers.
- **Audit Logs & Tools**: Systematic tracking of all administrative actions and powerful data-seeding tools.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript 5.8, Vite 6, TailwindCSS 4, Recharts, Lucide React, Monaco Editor |
| **Database / Auth** | Supabase PostgreSQL, Supabase Auth, Supabase Storage |
| **AI / NLP Engine** | Python FastAPI, OpenRouter API (Gemini 2.0 Flash, Claude 3.5 Haiku, Llama 3.1 70B), scikit-learn |
| **Monitoring** | Sentry (error tracking), PostHog (product analytics) |
| **Hosting** | Firebase Hosting (frontend), Railway/Render (AI Engine) |

---

## Installation & Setup

### Prerequisites
- Node.js 18+
- Python 3.10+ (for AI Engine)
- Git

### 1. Frontend Setup
```bash
# Clone the repository
git clone https://github.com/Rachit-Jain-24/Campus2Career.git
cd vpa-v2

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your Supabase URL and anon key

# Start development server
npm run dev   # http://localhost:5173
```

### 2. AI Engine Setup (Optional — required for AI features)
```bash
cd ai-engine
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt

# Set your OpenRouter API key
export OPENROUTER_API_KEY=sk-or-v1-your-key-here

python main.py   # http://localhost:8000
```

### 3. Run Tests
```bash
npm run test        # Run once
npm run test:watch  # Watch mode
```

### 4. Production Build
```bash
npm run build        # Standard build
npm run build:prod   # Production-env build
```

---

## Environment Variables

See `.env.example` for the complete reference. Key variables:

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase public anon key |
| `VITE_AI_BACKEND_URL` | Yes (prod) | URL of the Python AI Engine |
| `VITE_SENTRY_DSN` | No | Sentry error tracking DSN |
| `VITE_POSTHOG_API_KEY` | No | PostHog analytics key |

**Server-side only** (set in Railway/Render dashboard, never in `.env`):
- `OPENROUTER_API_KEY` — OpenRouter API key for AI models
- `ONECOMPILER_API_KEY` — OneCompiler code execution API key

---

## Project Structure

```
vpa-v2/
├── src_1/                      # Frontend (React + TypeScript)
│   ├── components/             # Reusable UI components
│   │   ├── admin/              # Admin portal components
│   │   ├── interview/          # Interview simulator UI
│   │   ├── AICareerAdvisor/    # AI chatbot widget
│   │   └── ui/                 # Base UI primitives
│   ├── pages/                  # Route pages (student, admin, auth)
│   ├── lib/                    # Core logic and integrations
│   │   ├── ai/                 # AI services (chatbot, copilot, RAG)
│   │   ├── openRouter.ts       # AI backend proxy client
│   │   ├── supabase.ts         # Supabase client
│   │   ├── errorHandler.ts     # Centralized error handling
│   │   └── rateLimiter.ts      # Client-side rate limiting
│   ├── services/               # Data services layer
│   │   ├── admin/              # Admin feature services
│   │   └── db/                 # Supabase adapter (database.service.ts)
│   ├── contexts/               # React contexts (Auth, Toast)
│   ├── hooks/                  # Custom React hooks
│   └── types/                  # TypeScript type definitions
├── ai-engine/                  # Python FastAPI AI service
├── public/                     # Static assets
└── scripts/                    # SQL reference migrations
```

---

## AI Architecture

The platform uses a secure server-side proxy pattern for all AI operations:

```
Browser  -->  FastAPI AI Engine  -->  OpenRouter API
                (keeps key secure)     (Gemini, Claude, Llama)
```

- API keys never leave the server
- In-memory IP-based rate limiting (30 req/min)
- Multi-model fallback: Gemini 2.0 Flash → Claude 3.5 Haiku → Llama 3.1 70B
- Resume analysis uses TF-IDF cosine similarity (scikit-learn)
- Code execution proxied via OneCompiler API

---

## Deployment

The frontend is hosted on **Firebase Hosting** and the AI engine on **Railway/Render**. Configure environment variables in your hosting dashboard — never commit secrets to the repo. See `.env.example` for the full list of required variables.

---

## License

Developed for **NMIMS Hyderabad** (B.Tech CSE – Data Science, Semester 8).
© 2025–2026 Rachit Jain, Prasad Kannawar, Venkatesh Mahindra.
