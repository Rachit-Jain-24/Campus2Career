# 🚀 Campus2Career - Production Deployment Quick Guide

**Follow this guide step-by-step to deploy Campus2Career to production.**

---

## ⚠️ CRITICAL: Before You Deploy

### 1. Rotate ALL API Keys (IMMEDIATE)

Your current `.env` file contains exposed API keys. You MUST rotate these before deployment:

- [ ] **Supabase Anon Key**: Go to Supabase Dashboard → Project Settings → API → Regenerate
- [ ] **OpenRouter API Key**: Go to https://openrouter.ai/keys → Create new key
- [ ] **Judge0 API Key**: Go to RapidAPI → Regenerate key
- [ ] **Supabase Service Role**: REGENERATE and NEVER expose in frontend

### 2. Remove Service Role Key from Frontend

**CRITICAL SECURITY ISSUE**: Your current `.env` has `SUPABASE_SERVICE_ROLE_KEY` in the frontend config.

**Fix:**
```bash
# Remove this line from .env (frontend should NOT have service role key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # ← DELETE THIS LINE

# Service role key should ONLY be in:
# - Backend server .env files
# - CI/CD secrets (GitHub Actions, Vercel)
# - Migration scripts (run locally, not committed)
```

---

## 📋 Deployment Checklist

### Phase 1: Security Fixes (Do First)

```bash
# 1. Create new .env from template
cp .env.example .env

# 2. Fill in NEW API keys (DO NOT use old exposed keys)
# Edit .env with your favorite editor

# 3. Verify .env is in .gitignore
cat .gitignore | grep ".env"  # Should show: .env

# 4. Never commit .env
git status  # Make sure .env is NOT listed
```

### Phase 2: Database Setup

```bash
# 1. Run RLS policies in Supabase Dashboard → SQL Editor
# File: scripts/production_rls_policies.sql

# 2. Add database indexes
# File: scripts/production_database_indexes.sql

# 3. Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

# 4. Test database connection
# Run: npm run dev → Try logging in
```

### Phase 3: Local Testing

```bash
# 1. Install dependencies
npm install

# 2. Run environment validation
npm run dev  # Should show: "✅ Environment configuration validated"

# 3. Run tests
npm run test

# 4. Build for production
npm run build

# 5. Preview production build
npm run preview  # Test at http://localhost:4173
```

### Phase 4: Deploy to Vercel

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Link to project
vercel link

# 4. Add environment variables in Vercel Dashboard
# Go to: Project Settings → Environment Variables
# Add:
#   VITE_SUPABASE_URL
#   VITE_SUPABASE_ANON_KEY
#   VITE_OPENROUTER_API_KEY
#   VITE_JUDGE0_API_KEY
#   VITE_APP_ENV=production

# 5. Deploy to staging (test first)
vercel

# 6. Test staging deployment
# Visit the staging URL provided

# 7. Deploy to production
vercel --prod
```

### Phase 5: Post-Deployment

```bash
# 1. Verify deployment
curl -I https://your-app.vercel.app

# 2. Check for errors in Vercel logs
vercel logs

# 3. Test all critical flows:
#    - Student signup
#    - Student login
#    - Admin login
#    - Career discovery
#    - AI chat
#    - Interview simulator

# 4. Monitor for 24 hours
#    - Check Vercel analytics
#    - Monitor Supabase dashboard
#    - Watch for error reports
```

---

## 🔧 Environment Variables

### Required (Frontend)

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_OPENROUTER_API_KEY=your_openrouter_key_here
VITE_JUDGE0_API_KEY=your_judge0_key_here
VITE_APP_ENV=production
```

### Optional (Monitoring)

```bash
VITE_SENTRY_DSN=your_sentry_dsn_here
VITE_POSTHOG_API_KEY=your_posthog_key_here
```

### Backend Only (DO NOT add to frontend)

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here  # ← Backend/scripts only!
```

---

## 📊 Performance Targets

After deployment, verify these metrics:

| Metric | Target | How to Check |
|--------|--------|--------------|
| Bundle Size | < 1 MB total | `npm run build` output |
| Load Time | < 3 seconds | Chrome DevTools → Network |
| API Response | < 200ms | Supabase Dashboard → Logs |
| Error Rate | < 1% | Vercel Analytics |

---

## 🚨 Common Issues & Fixes

### Issue 1: "Environment validation failed"

**Fix:**
```bash
# Check .env file exists
ls -la .env

# Verify all required variables
cat .env | grep VITE_

# Make sure URLs don't have trailing slashes
VITE_SUPABASE_URL=https://xyz.supabase.co  # ← No trailing /
```

### Issue 2: "ENOTFOUND supabase.co"

**Fix:**
- Check internet connection
- Verify Supabase URL is correct
- Check Supabase project status at https://status.supabase.com

### Issue 3: "Rate limit exceeded"

**Fix:**
- Wait 60 seconds and try again
- Check if you need to increase limits in `rateLimiter.ts`
- Verify OpenRouter API key is valid

### Issue 4: "Permission denied" (Database)

**Fix:**
- Run RLS policies script in Supabase
- Verify user is authenticated
- Check Supabase logs for detailed error

---

## 📈 Monitoring Setup

### 1. Sentry (Error Tracking)

```bash
# Install Sentry
npm install @sentry/react @sentry/browser

# Initialize in main.tsx (after environment validation)
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: 'production',
    tracesSampleRate: 1.0,
  });
}
```

### 2. PostHog (Product Analytics)

```bash
# Install PostHog
npm install posthog-js

# Initialize in main.tsx
import posthog from 'posthog-js';

if (import.meta.env.PROD && import.meta.env.VITE_POSTHOG_API_KEY) {
  posthog.init(import.meta.env.VITE_POSTHOG_API_KEY, {
    api_host: 'https://app.posthog.com',
  });
}
```

### 3. Uptime Monitoring (Free)

Sign up at https://uptimerobot.com/:
- Add your production URL
- Check every 5 minutes
- Get email/SMS alerts on downtime

---

## 🔄 Rollback Procedure

If something goes wrong after deployment:

```bash
# 1. Check recent deployments
vercel deployments ls

# 2. Rollback to previous deployment
vercel deployments rollback

# 3. Verify rollback
curl -I https://your-app.vercel.app

# 4. Check logs for errors
vercel logs
```

---

## 💰 Production Costs (Monthly)

| Service | Cost | Notes |
|---------|------|-------|
| Vercel | $0 → $20 | Hobby (free) or Pro ($20) |
| Supabase | $0 → $25 | Free tier or Pro ($25) |
| OpenRouter | ~$10 | Pay-per-use, ~30K requests |
| Sentry | $0 → $26 | Free tier or Team ($26) |
| **Total** | **$0 - $81** | Start free, scale as needed |

---

## ✅ Pre-Launch Final Checklist

### Security
- [ ] All API keys rotated (NOT the exposed ones)
- [ ] Service role key removed from frontend
- [ ] RLS policies applied
- [ ] Database indexes created
- [ ] `.env` not committed to Git

### Performance
- [ ] Bundle size < 1 MB
- [ ] All images optimized
- [ ] Database queries indexed
- [ ] Rate limiting enabled
- [ ] CDN caching configured

### Testing
- [ ] All critical user flows tested
- [ ] Mobile responsiveness checked
- [ ] Cross-browser testing done
- [ ] Load testing completed
- [ ] Error handling verified

### Monitoring
- [ ] Error tracking set up (Sentry)
- [ ] Analytics configured (PostHog)
- [ ] Uptime monitoring active
- [ ] Alert thresholds set
- [ ] Log aggregation enabled

### Documentation
- [ ] User guide created
- [ ] Admin manual written
- [ ] API documentation ready
- [ ] Troubleshooting guide available
- [ ] System design documented

---

## 🎉 You're Ready to Launch!

Once all checkboxes are complete:

```bash
# Deploy to production
vercel --prod

# Share with the world!
echo "Campus2Career is LIVE at: https://your-app.vercel.app"
```

---

## 📞 Support

If you encounter issues:

1. Check the logs: `vercel logs`
2. Review Supabase dashboard for database errors
3. Check Sentry for error reports
4. Consult SYSTEM_DESIGN_AND_DEPLOYMENT.md for detailed architecture
5. Review PROJECT_ANALYSIS_REPORT.md for known issues

---

**Good luck with your launch! 🚀**
