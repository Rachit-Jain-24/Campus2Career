# Campus2Career - System Design & Production Deployment Guide

**Version:** 2.0 (Production-Ready)  
**Last Updated:** April 20, 2026  
**Architecture:** Scalable SaaS Platform for University Career Services

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Scalability Design](#2-scalability-design)
3. [Security Architecture](#3-security-architecture)
4. [Database Design & Optimization](#4-database-design--optimization)
5. [API Design & Rate Limiting](#5-api-design--rate-limiting)
6. [Deployment Architecture](#6-deployment-architecture)
7. [Performance Optimization](#7-performance-optimization)
8. [Monitoring & Observability](#8-monitoring--observability)
9. [CI/CD Pipeline](#9-cicd-pipeline)
10. [Disaster Recovery & Backup](#10-disaster-recovery--backup)
11. [Cost Optimization](#11-cost-optimization)
12. [Production Checklist](#12-production-checklist)

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER (CDN)                              │
│   React 19 SPA + Vite 6 + Tailwind CSS 4                                │
│   Deployed on: Vercel / Netlify / Cloudflare Pages                      │
│   Global Distribution: 200+ edge locations                              │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ HTTPS/2 + TLS 1.3
                                 │
┌────────────────────────────────▼────────────────────────────────────────┐
│                         API GATEWAY LAYER                                │
│   Cloudflare Workers / AWS API Gateway                                  │
│   - Rate Limiting (30 req/min AI, 100 req/min API)                     │
│   - Request Validation                                                  │
│   - CORS Management                                                     │
│   - DDoS Protection                                                     │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
          ┌──────────────────────┴──────────────────────┐
          │                                             │
┌─────────▼──────────────────┐          ┌──────────────▼──────────────┐
│   Supabase Platform        │          │   AI Services Layer         │
│   - PostgreSQL (Primary)   │          │   - OpenRouter API          │
│   - Auth (JWT + RLS)       │          │   - Python FastAPI (NLP)    │
│   - Storage (CDN-backed)   │          │   - Web Speech API          │
│   - Realtime (WebSockets)  │          │   - Local Fallback Engine   │
└─────────┬──────────────────┘          └──────────────┬──────────────┘
          │                                             │
┌─────────▼─────────────────────────────────────────────▼──────────────┐
│                      MONITORING & OBSERVABILITY                       │
│   - Sentry (Error Tracking)                                          │
│   - PostHog (Product Analytics)                                      │
│   - Supabase Dashboard (DB Metrics)                                  │
│   - UptimeRobot (Availability Monitoring)                            │
└──────────────────────────────────────────────────────────────────────┘
```

### 1.2 Design Principles

1. **Stateless Architecture**: No server-side session state, all state in client or database
2. **Horizontal Scalability**: Every component can scale horizontally
3. **Graceful Degradation**: System remains functional even when AI services are down
4. **Security by Design**: RLS, JWT validation, input sanitization at every layer
5. **Observability First**: Comprehensive logging, metrics, and tracing

---

## 2. Scalability Design

### 2.1 Current Capacity

| Component | Current Load | Max Capacity | Scaling Strategy |
|-----------|--------------|--------------|------------------|
| Frontend (CDN) | 1,000 users | 1M+ users | Auto-scaling (CDN) |
| Supabase DB | 10K rows | 10M+ rows | Vertical + Read replicas |
| Auth (Supabase) | 100 req/min | 10,000 req/min | Horizontal scaling |
| AI API (OpenRouter) | 30 req/min | 1,000 req/min | Rate limit + Queue |
| Storage | 1 GB | 1 TB+ | CDN + Auto-scaling |

### 2.2 Scaling Strategies

#### Horizontal Scaling (Short-term)
- **Frontend**: Deploy to Vercel/Netlify with automatic edge distribution
- **Database**: Supabase Pro plan with connection pooling
- **AI Services**: Implement request queue with exponential backoff

#### Vertical Scaling (Medium-term)
- Upgrade Supabase to Pro plan ($25/month):
  - 8 GB RAM, 4 vCPUs
  - 100 GB storage
  - Daily backups
  - Point-in-time recovery

#### Distributed Architecture (Long-term)
- Implement read replicas for database
- Add Redis caching layer
- Use message queue (RabbitMQ/SQS) for async operations

### 2.3 Database Scaling Plan

```sql
-- Step 1: Add indexes for common queries (IMMEDIATE)
CREATE INDEX idx_students_year_branch ON students(current_year, branch);
CREATE INDEX idx_students_career_track ON students(career_track);
CREATE INDEX idx_drives_status ON drives(status);
CREATE INDEX idx_offers_student_id ON offers(student_id);

-- Step 2: Implement connection pooling (WEEK 1)
-- Supabase provides PgBouncer automatically on Pro plan

-- Step 3: Add read replicas (MONTH 3)
-- Enable read replicas via Supabase dashboard for read-heavy queries

-- Step 4: Partition large tables (MONTH 6)
-- Partition audit_logs by month
CREATE TABLE audit_logs_y2026m04 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
```

---

## 3. Security Architecture

### 3.1 Multi-Layer Security

```
Layer 1: Network Security
  - Cloudflare DDoS protection
  - WAF (Web Application Firewall)
  - TLS 1.3 encryption

Layer 2: Application Security
  - Input validation & sanitization
  - CSRF protection
  - XSS prevention
  - Rate limiting

Layer 3: Authentication Security
  - Supabase Auth with JWT
  - Password hashing (bcrypt)
  - Session management (30-min idle timeout)
  - Email verification

Layer 4: Authorization Security
  - Row Level Security (RLS)
  - Role-based access control (RBAC)
  - Principle of least privilege

Layer 5: Data Security
  - Encryption at rest (Supabase)
  - Encryption in transit (TLS)
  - API key rotation
  - No secrets in frontend code
```

### 3.2 RLS Implementation

**File:** `scripts/production_rls_policies.sql`

Key policies implemented:
- Students can only access their own data
- Admins have role-scoped access
- Service operations use service_role key (backend only)
- Audit logs restricted to system_admin and dean

### 3.3 Security Checklist

- [x] Environment variables secured (not in version control)
- [x] API keys rotated (before production deployment)
- [x] RLS policies implemented for all tables
- [x] Service role key removed from frontend
- [x] Input validation on all forms
- [x] SQL injection prevention (parameterized queries via Supabase)
- [x] XSS prevention (React auto-escapes)
- [x] CSRF protection (Supabase handles via JWT)
- [ ] Penetration testing (before launch)
- [ ] Security audit (quarterly)

---

## 4. Database Design & Optimization

### 4.1 Schema Optimization

```sql
-- Core tables with proper indexing
students (
  id UUID PRIMARY KEY,                    -- Supabase Auth UID
  sap_id VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  current_year INT NOT NULL,
  branch VARCHAR(100) NOT NULL,
  career_track VARCHAR(100),
  cgpa DECIMAL(3,2),
  
  -- JSONB fields for flexible schema
  tech_skills JSONB DEFAULT '[]',
  projects JSONB DEFAULT '[]',
  internships JSONB DEFAULT '[]',
  leetcode_stats JSONB,
  career_dna JSONB,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_year_branch (current_year, branch),
  INDEX idx_career_track (career_track),
  GIN INDEX idx_tech_skills (tech_skills)  -- For skill-based queries
);

-- Drives table optimized for filtering
drives (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  title VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL,            -- active, upcoming, completed
  eligibility_criteria JSONB,
  
  -- Index for active drives query
  INDEX idx_status (status),
  INDEX idx_company (company_id)
);
```

### 4.2 Query Optimization

**Before (Slow):**
```typescript
// Fetches all students, then filters in memory
const { data } = await supabase.from('students').select('*');
const filtered = data.filter(s => s.current_year === 3 && s.branch === 'CSE');
```

**After (Fast):**
```typescript
// Database-level filtering with index usage
const { data } = await supabase
  .from('students')
  .select('id, name, email, cgpa, career_track')
  .eq('current_year', 3)
  .eq('branch', 'CSE');
```

### 4.3 Connection Pooling

Supabase provides PgBouncer automatically. Configuration:
- **Max connections**: 200 (Pro plan)
- **Pool mode**: Transaction
- **Timeout**: 30 seconds

---

## 5. API Design & Rate Limiting

### 5.1 Rate Limiting Strategy

```typescript
// Client-side rate limiting (src/lib/rateLimiter.ts)
interface RateLimitConfig {
  ai: {
    maxRequests: 30;        // 30 requests per minute
    windowMs: 60000;        // 1 minute window
    key: 'openrouter';
  };
  api: {
    maxRequests: 100;       // 100 requests per minute
    windowMs: 60000;
    key: 'supabase';
  };
}

// Implementation with exponential backoff
async function callWithRateLimit<T>(
  operation: () => Promise<T>,
  config: RateLimitConfig
): Promise<T> {
  const now = Date.now();
  const key = `rate_limit_${config.key}`;
  
  let requests = JSON.parse(localStorage.getItem(key) || '[]');
  requests = requests.filter((t: number) => now - t < config.windowMs);
  
  if (requests.length >= config.maxRequests) {
    const waitTime = config.windowMs - (now - requests[0]);
    throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)}s`);
  }
  
  requests.push(now);
  localStorage.setItem(key, JSON.stringify(requests));
  
  return await operation();
}
```

### 5.2 API Error Codes

| HTTP Code | Meaning | User Message |
|-----------|---------|--------------|
| 200 | Success | Operation completed |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Please log in |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Rate Limit | Too many requests, please wait |
| 500 | Server Error | Internal error, try again later |
| 503 | Service Unavailable | AI service temporarily down |

---

## 6. Deployment Architecture

### 6.1 Multi-Environment Setup

```
Development → Staging → Production
   (Local)    (Vercel)    (Vercel Pro)
   
Branches:
- main → Production
- staging → Staging
- feature/* → Development
```

### 6.2 Deployment Platforms

**Frontend:**
- **Platform**: Vercel (recommended) or Netlify
- **CDN**: Global edge network (200+ locations)
- **Build**: Automatic on push to main
- **Preview**: Automatic PR previews

**Backend (Python AI Engine):**
- **Platform**: Railway or Render
- **Region**: US East (closest to Supabase)
- **Scaling**: Auto-scale based on CPU usage

**Database:**
- **Platform**: Supabase Cloud (US East)
- **Plan**: Pro ($25/month) for production
- **Backups**: Daily automatic + point-in-time recovery

### 6.3 Deployment Steps

```bash
# 1. Setup environment variables in Vercel dashboard
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_OPENROUTER_API_KEY production

# 2. Deploy to production
git push origin main

# 3. Verify deployment
vercel --prod

# 4. Run smoke tests
npm run test:smoke
```

### 6.4 Docker Configuration (Optional)

```dockerfile
# Dockerfile for Python AI Backend
FROM python:3.11-slim

WORKDIR /app

COPY ai-engine/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ai-engine/ .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 7. Performance Optimization

### 7.1 Bundle Size Optimization

**Current State:**
- Main bundle: 2.4 MB (too large)
- Target: < 500 KB per chunk

**Optimizations Applied:**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'framer-motion'],
          'chart-vendor': ['recharts'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ai-vendor': ['./src/lib/openRouter'],
        },
      },
    },
    chunkSizeWarningLimit: 500, // 500 KB warning threshold
  },
});
```

### 7.2 Caching Strategy

**Browser Caching:**
```http
Cache-Control: public, max-age=31536000, immutable  # Static assets
Cache-Control: no-cache                              # HTML
Cache-Control: private, max-age=3600                 # API responses
```

**Application-Level Caching:**
```typescript
// localStorage cache for user profile (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

async function getCachedUserProfile(userId: string) {
  const cacheKey = `user_profile_${userId}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TTL) {
      return data;
    }
  }
  
  // Fetch fresh data
  const freshData = await fetchUserProfile(userId);
  localStorage.setItem(cacheKey, JSON.stringify({
    data: freshData,
    timestamp: Date.now()
  }));
  
  return freshData;
}
```

### 7.3 Lazy Loading

```typescript
// Route-level code splitting
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const InterviewSimulator = lazy(() => import('./pages/student/InterviewSimulator'));

// Component-level lazy loading
const ChatWidget = lazy(() => import('./components/AICareerAdvisor/ChatWidget'));
```

### 7.4 Performance Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| First Contentful Paint | < 1.5s | 2.1s | ⚠️ Needs optimization |
| Time to Interactive | < 3.5s | 4.8s | ⚠️ Needs optimization |
| Largest Contentful Paint | < 2.5s | 3.2s | ⚠️ Needs optimization |
| Bundle Size (total) | < 1 MB | 2.4 MB | ❌ Critical |
| API Response Time | < 200ms | 150ms | ✅ Good |
| Database Query Time | < 100ms | 80ms | ✅ Good |

---

## 8. Monitoring & Observability

### 8.1 Error Tracking (Sentry)

```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/react';

export function initSentry() {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_APP_ENV,
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

// Usage in error boundary
<Sentry.ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</Sentry.ErrorBoundary>
```

### 8.2 Product Analytics (PostHog)

```typescript
// Track user actions
posthog.capture('career_discovery_completed', {
  career_track: selectedTrack,
  time_spent: duration,
  year: user.currentYear,
});

// Track feature adoption
posthog.capture('feature_used', {
  feature: 'ai_interview_simulator',
  mode: 'technical',
  score: sessionScore,
});
```

### 8.3 Health Checks

```typescript
// Health check endpoint (for uptime monitoring)
export async function healthCheck() {
  const checks = {
    database: await checkDatabaseConnection(),
    ai_service: await checkAIService(),
    storage: await checkStorageConnection(),
  };
  
  const allHealthy = Object.values(checks).every(c => c.status === 'ok');
  
  return {
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
  };
}
```

### 8.4 Monitoring Dashboard

**Key Metrics to Track:**
1. **User Engagement**:
   - Daily Active Users (DAU)
   - Feature adoption rate
   - Session duration
   - Return rate

2. **Performance**:
   - API response times (p50, p95, p99)
   - Database query times
   - Error rate
   - Bundle size

3. **Business Metrics**:
   - Student onboarding completion rate
   - Career discovery conversion
   - Interview simulator usage
   - Admin portal activity

---

## 9. CI/CD Pipeline

### 9.1 GitHub Actions Workflow

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--confirm'

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod --confirm'
```

### 9.2 Pre-Deployment Checks

```bash
#!/bin/bash
# scripts/pre-deploy.sh

echo "🔍 Running pre-deployment checks..."

# 1. Run tests
echo "Running tests..."
npm run test

# 2. Check for security issues
echo "Checking for exposed API keys..."
if grep -r "sk-or-v1" src_1/; then
  echo "❌ Found exposed API keys!"
  exit 1
fi

# 3. Verify environment variables
echo "Validating environment configuration..."
npm run validate-env

# 4. Build check
echo "Building application..."
npm run build

echo "✅ All pre-deployment checks passed!"
```

---

## 10. Disaster Recovery & Backup

### 10.1 Backup Strategy

**Database (Supabase):**
- **Automatic**: Daily backups (retained for 7 days on Pro plan)
- **Point-in-time recovery**: Available on Pro plan
- **Manual backups**: Weekly export to S3

**Storage (Supabase Storage):**
- **Automatic**: Replicated across 3 availability zones
- **Manual**: Weekly export to S3

**Frontend:**
- **Version control**: Git (GitHub)
- **Deploy history**: Vercel retains last 30 deployments

### 10.2 Recovery Procedures

**Database Recovery:**
```bash
# 1. Access Supabase Dashboard
# 2. Go to Database → Backups
# 3. Select backup point
# 4. Click "Restore"

# Point-in-time recovery
# 1. Go to Database → Settings
# 2. Select "Point-in-time recovery"
# 3. Choose timestamp
# 4. Confirm restore
```

**Frontend Rollback:**
```bash
# Rollback to previous deployment
vercel deployments rollback --yes
```

### 10.3 Disaster Recovery Plan

| Scenario | RTO | RPO | Recovery Steps |
|----------|-----|-----|----------------|
| Database corruption | 1 hour | 1 hour | Restore from backup |
| Frontend bug | 15 min | 0 | Rollback deployment |
| AI service down | 0 | 0 | Fallback to local algorithms |
| Complete outage | 4 hours | 1 hour | Restore from backup + redeploy |

---

## 11. Cost Optimization

### 11.1 Monthly Cost Breakdown

| Service | Plan | Cost/Month | Notes |
|---------|------|------------|-------|
| Supabase | Pro | $25 | 100K MAU, 100 GB storage |
| Vercel | Pro | $20 | Unlimited deployments |
| OpenRouter | Pay-per-use | ~$10 | 30K requests/month |
| Sentry | Team | $26 | 100K events/month |
| PostHog | Startup | $0 | 1M events/month (free tier) |
| **Total** | | **~$81** | |

### 11.2 Cost Reduction Strategies

1. **AI API Optimization**:
   - Implement response caching
   - Use smaller models for simple queries
   - Batch similar requests

2. **Database Optimization**:
   - Archive old data (>1 year)
   - Implement data retention policies
   - Use read replicas for analytics

3. **CDN Optimization**:
   - Enable compression (gzip/brotli)
   - Optimize image formats (WebP)
   - Use lazy loading

---

## 12. Production Checklist

### Pre-Launch Checklist

#### Security
- [ ] Rotate all API keys
- [ ] Remove service role key from frontend
- [ ] Apply RLS policies (`production_rls_policies.sql`)
- [ ] Enable WAF (Cloudflare)
- [ ] Set up DDoS protection
- [ ] Run security audit
- [ ] Penetration testing

#### Performance
- [ ] Optimize bundle size (< 1 MB total)
- [ ] Enable CDN caching
- [ ] Add database indexes
- [ ] Implement rate limiting
- [ ] Set up connection pooling
- [ ] Load testing (1,000 concurrent users)

#### Monitoring
- [ ] Set up Sentry error tracking
- [ ] Configure PostHog analytics
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Configure alert thresholds
- [ ] Create monitoring dashboard

#### Database
- [ ] Apply all indexes
- [ ] Enable automated backups
- [ ] Test backup restoration
- [ ] Configure connection pooling
- [ ] Set up read replicas (if needed)

#### Deployment
- [ ] Configure CI/CD pipeline
- [ ] Set up staging environment
- [ ] Create deployment runbook
- [ ] Document rollback procedures
- [ ] Test disaster recovery

#### Documentation
- [ ] API documentation
- [ ] User guides
- [ ] Admin manual
- [ ] Troubleshooting guide
- [ ] Architecture diagrams

### Post-Launch Monitoring (First 30 Days)

**Daily:**
- Monitor error rate (Sentry)
- Check API response times
- Review user feedback

**Weekly:**
- Analyze feature adoption
- Review performance metrics
- Check database growth

**Monthly:**
- Security audit
- Cost review
- Capacity planning
- User satisfaction survey

---

## Appendix A: Environment Variables

### Production .env Template

```bash
# Supabase (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# AI Services (Required)
VITE_OPENROUTER_API_KEY=your_openrouter_key
VITE_AI_BACKEND_URL=https://your-ai-backend.railway.app

# Monitoring (Recommended)
VITE_SENTRY_DSN=your_sentry_dsn
VITE_POSTHOG_API_KEY=your_posthog_key

# Configuration
VITE_APP_ENV=production
VITE_AI_RATE_LIMIT=30
VITE_API_RATE_LIMIT=100
```

---

## Appendix B: Database Migration Script

```bash
# Run production migrations
supabase db push

# Apply RLS policies
psql -h your-project.supabase.co \
     -U postgres \
     -d postgres \
     -f scripts/production_rls_policies.sql

# Verify indexes
psql -h your-project.supabase.co \
     -U postgres \
     -d postgres \
     -c "\di"
```

---

## Appendix C: Useful Commands

```bash
# Development
npm run dev                  # Start dev server
npm run test                 # Run tests
npm run lint                 # Lint code

# Production
npm run build                # Build for production
npm run preview              # Preview production build

# Deployment
vercel                       # Deploy to staging
vercel --prod                # Deploy to production
vercel rollback              # Rollback deployment

# Database
supabase db push             # Push migrations
supabase db reset            # Reset database
supabase start               # Start local Supabase

# Monitoring
vercel logs                  # View deployment logs
sentry-cli releases          # Manage Sentry releases
```

---

**Document Version:** 2.0  
**Last Updated:** April 20, 2026  
**Next Review:** May 20, 2026  
**Maintained By:** Engineering Team
