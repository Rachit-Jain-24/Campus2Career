-- Campus2Career — Fix RLS and Permissions
-- Run this in your Supabase SQL Editor to allow the migration script to work.

-- 1. Disable Row Level Security (RLS) for ALL tables
-- This is necessary to allow the 'anon' key to insert data during the initial migration.
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.drives DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_job_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.drive_stages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_internships DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_certifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_swoc DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility_rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility_rule_years DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility_rule_departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility_rule_drives DISABLE ROW LEVEL SECURITY;

-- 2. Explicitly Grant ALL permissions to the 'anon' role temporarily
-- This ensures the key from your .env can perform CRUD operations.
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- Note: You can re-enable RLS later for production security with proper policies.
