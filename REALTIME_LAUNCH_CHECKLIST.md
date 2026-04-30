# Campus2Career Real-Time Launch Checklist

Use this before opening the system to real students or administrators.

## 1. Supabase

- Create a production Supabase project.
- Run schema fixes/migrations from `scripts/` in this order:
  1. `scripts/migration-preflight.sql`
  2. `scripts/fix-schema.sql`
  3. `scripts/add-missing-columns.sql`
  4. `scripts/production_database_indexes.sql`
  5. `scripts/production_rls_policies.sql`
  6. `scripts/fix_rls_recursion.sql` if recursive policy errors appear
- Confirm RLS is enabled for student, admin, placement, audit, and knowledge tables.
- Create at least one real `system_admin` account in Supabase Auth and the `admins` table.
- Seed only required production data. Do not use demo passwords for real users.

## 2. AI Backend

- Deploy `ai-engine/` to Railway, Cloud Run, or another HTTPS host.
- Set backend-only environment variables:
  - `OPENROUTER_API_KEY`
  - `ALLOWED_ORIGIN=https://your-frontend-domain`
- Verify:
  - `GET /health` returns `{ "status": "ok" }`
  - `POST /api/ai` works from the frontend domain
  - CORS rejects unknown origins

## 3. Frontend Environment

Set these for the production frontend build:

```env
VITE_APP_ENV=production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_AI_BACKEND_URL=https://your-ai-backend.example.com
VITE_ENABLE_DEMO_LOGIN=false
```

Never set these in the frontend:

```env
OPENROUTER_API_KEY
SUPABASE_SERVICE_ROLE_KEY
VITE_OPENROUTER_API_KEY
```

## 4. Verification

Run before deploy:

```bash
npm run lint
npm run test
npm run build
```

Expected state:

- Lint exits successfully.
- Tests pass.
- Build passes.
- Only known bundle-size warnings remain.

## 5. Production Smoke Test

- Student signup/login works with a real Supabase Auth user.
- Admin login redirects to the correct role dashboard.
- Demo/mock login is disabled.
- Student profile updates persist after refresh.
- Resume analyzer works with the deployed AI backend or gracefully falls back.
- AI advisor returns a response through the backend proxy.
- Admin can view students, companies, drives, offers, and audit logs.
- RLS prevents a student from reading another student's row.

## 6. Operational Notes

- Keep `.env`, `.env.server`, and service-role keys off Git.
- Rotate keys immediately if any secret was pasted into frontend env variables.
- Monitor AI backend rate-limit errors and raise limits only after confirming abuse protections.
- Keep Supabase backups enabled before importing real student data.
