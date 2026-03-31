-- Campus2Career — Production Security Policies (RLS)
-- Enables RLS on all tables and configures access for the application role.

-- 1. ENABLE RLS FOR ALL TABLES (Total: 21)
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_job_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_swoc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drive_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility_rule_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility_rule_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility_rule_drives ENABLE ROW LEVEL SECURITY;

-- 2. CREATE POLICIES
-- Since the application uses the 'anon' key from the frontend (via Firebase sessions),
-- we will allow 'anon' CRUD operations for now.
-- In the future, switching to Supabase Auth would allow using 'TO authenticated'.

DO $$ 
DECLARE 
    t text;
BEGIN
    -- Drop existing "Allow app access" policies if they exist to prevent errors on rerun
    FOR t IN 
        SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "Allow app access" ON public.' || t;
        EXECUTE 'CREATE POLICY "Allow app access" ON public.' || t || ' FOR ALL TO anon USING (true) WITH CHECK (true)';
    END LOOP;
END $$;

-- 3. PERMISSION HOUSEKEEPING
-- Ensure the anon role has full access to the schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- Explicitly revoke permissions from the 'public' (no-key) role
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM public;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM public;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM public;

-- Verification Query:
-- SELECT table_name, rowsecurity FROM subtitle_tables WHERE table_schema = 'public';
