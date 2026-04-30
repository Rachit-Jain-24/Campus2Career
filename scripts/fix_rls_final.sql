-- ============================================================
-- Campus2Career — DEFINITIVE RLS FIX v3
-- ============================================================
-- Run this ENTIRE script in Supabase SQL Editor:
--   Dashboard → SQL Editor → New Query → paste → Run
--
-- WHAT THIS FIXES:
--   1. "infinite recursion detected in policy for relation admins"
--      → admins policies were querying admins table directly
--      → fixed with SECURITY DEFINER helper functions
--
--   2. "operator does not exist: text = uuid" / "uuid = text"
--      → students.uid is TEXT, admins.id is UUID
--      → students policies use ::text cast on auth.uid()
--      → admins policies use auth.uid() directly (UUID = UUID)
-- ============================================================


-- ============================================================
-- STEP 1: DROP ALL EXISTING POLICIES (clean slate)
-- ============================================================

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      pol.policyname,
      pol.tablename
    );
  END LOOP;
END $$;


-- ============================================================
-- STEP 2: DROP OLD HELPER FUNCTIONS
-- ============================================================

DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS is_role(TEXT) CASCADE;
DROP FUNCTION IF EXISTS is_any_role(TEXT[]) CASCADE;
DROP FUNCTION IF EXISTS get_my_admin_role() CASCADE;


-- ============================================================
-- STEP 3: CREATE SECURITY DEFINER HELPER FUNCTIONS
--
-- admins.id is UUID  → compare with auth.uid() directly (no cast)
-- SECURITY DEFINER   → runs as function owner, bypasses RLS
--                      this is what prevents infinite recursion
-- ============================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION is_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = auth.uid()
      AND role = required_role
  );
$$;

CREATE OR REPLACE FUNCTION is_any_role(required_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = auth.uid()
      AND role = ANY(required_roles)
  );
$$;

CREATE OR REPLACE FUNCTION get_my_admin_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.admins
  WHERE id = auth.uid()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION is_admin()           TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_role(TEXT)        TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_any_role(TEXT[])  TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_my_admin_role()  TO authenticated, anon;


-- ============================================================
-- STEP 4: ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE public.students          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drives            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drive_stages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility_rules ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='platform_config')           THEN EXECUTE 'ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY';           END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='student_skills')            THEN EXECUTE 'ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY';            END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='student_projects')          THEN EXECUTE 'ALTER TABLE public.student_projects ENABLE ROW LEVEL SECURITY';          END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='student_certifications')    THEN EXECUTE 'ALTER TABLE public.student_certifications ENABLE ROW LEVEL SECURITY';    END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='student_internships')       THEN EXECUTE 'ALTER TABLE public.student_internships ENABLE ROW LEVEL SECURITY';       END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='student_achievements')      THEN EXECUTE 'ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY';      END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='student_swoc')              THEN EXECUTE 'ALTER TABLE public.student_swoc ENABLE ROW LEVEL SECURITY';              END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='eligibility_rule_years')    THEN EXECUTE 'ALTER TABLE public.eligibility_rule_years ENABLE ROW LEVEL SECURITY';    END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='eligibility_rule_departments') THEN EXECUTE 'ALTER TABLE public.eligibility_rule_departments ENABLE ROW LEVEL SECURITY'; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='eligibility_rule_drives')   THEN EXECUTE 'ALTER TABLE public.eligibility_rule_drives ENABLE ROW LEVEL SECURITY';   END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='company_departments')       THEN EXECUTE 'ALTER TABLE public.company_departments ENABLE ROW LEVEL SECURITY';       END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='company_job_roles')         THEN EXECUTE 'ALTER TABLE public.company_job_roles ENABLE ROW LEVEL SECURITY';         END IF;
END $$;


-- ============================================================
-- STEP 5: STUDENTS TABLE POLICIES
--
-- students.uid  = TEXT  (stores Supabase Auth UUID as a text string)
-- students.id   = UUID  (internal primary key — NOT the auth uid)
--
-- Match on 'uid' column → needs auth.uid()::text cast (uuid → text)
-- ============================================================

CREATE POLICY "students_select_own"
ON public.students FOR SELECT TO authenticated
USING (uid = auth.uid()::text);

CREATE POLICY "students_insert_own"
ON public.students FOR INSERT TO authenticated
WITH CHECK (uid = auth.uid()::text);

CREATE POLICY "students_update_own"
ON public.students FOR UPDATE TO authenticated
USING  (uid = auth.uid()::text)
WITH CHECK (uid = auth.uid()::text);

CREATE POLICY "students_delete_own"
ON public.students FOR DELETE TO authenticated
USING (uid = auth.uid()::text);

-- Admins can read/write all students (uses SECURITY DEFINER fn)
CREATE POLICY "admins_select_all_students"
ON public.students FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "admins_update_any_student"
ON public.students FOR UPDATE TO authenticated
USING (is_admin());

CREATE POLICY "admins_insert_students"
ON public.students FOR INSERT TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "admins_delete_students"
ON public.students FOR DELETE TO authenticated
USING (is_admin());

-- Service role bypass (backend scripts with service key)
CREATE POLICY "service_role_students"
ON public.students FOR ALL TO service_role
USING (true) WITH CHECK (true);


-- ============================================================
-- STEP 6: ADMINS TABLE POLICIES
--
-- admins.id = UUID  → compare with auth.uid() directly (no cast)
-- MUST use SECURITY DEFINER functions — never query admins inline
-- ============================================================

-- Each admin reads their own row (UUID = UUID, no cast)
CREATE POLICY "admins_select_own"
ON public.admins FOR SELECT TO authenticated
USING (id = auth.uid());

-- System admin reads ALL rows (via SECURITY DEFINER — no recursion)
CREATE POLICY "admins_select_all"
ON public.admins FOR SELECT TO authenticated
USING (is_role('system_admin'));

CREATE POLICY "admins_insert"
ON public.admins FOR INSERT TO authenticated
WITH CHECK (is_role('system_admin'));

CREATE POLICY "admins_update"
ON public.admins FOR UPDATE TO authenticated
USING  (is_role('system_admin'))
WITH CHECK (is_role('system_admin'));

CREATE POLICY "admins_delete"
ON public.admins FOR DELETE TO authenticated
USING (is_role('system_admin'));

CREATE POLICY "service_role_admins"
ON public.admins FOR ALL TO service_role
USING (true) WITH CHECK (true);


-- ============================================================
-- STEP 7: COMPANIES TABLE
-- ============================================================

CREATE POLICY "companies_select"
ON public.companies FOR SELECT TO authenticated
USING (true);

CREATE POLICY "companies_manage"
ON public.companies FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "service_role_companies"
ON public.companies FOR ALL TO service_role
USING (true) WITH CHECK (true);

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='company_departments') THEN
    EXECUTE 'CREATE POLICY "co_depts_select" ON public.company_departments FOR SELECT TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY "co_depts_manage" ON public.company_departments FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin())';
    EXECUTE 'CREATE POLICY "co_depts_service" ON public.company_departments FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='company_job_roles') THEN
    EXECUTE 'CREATE POLICY "co_roles_select" ON public.company_job_roles FOR SELECT TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY "co_roles_manage" ON public.company_job_roles FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin())';
    EXECUTE 'CREATE POLICY "co_roles_service" ON public.company_job_roles FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
END $$;


-- ============================================================
-- STEP 8: DRIVES TABLE
-- ============================================================

CREATE POLICY "drives_select_active"
ON public.drives FOR SELECT TO authenticated
USING (status IN ('upcoming', 'ongoing', 'active'));

CREATE POLICY "drives_select_admins"
ON public.drives FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "drives_manage"
ON public.drives FOR ALL TO authenticated
USING  (is_any_role(ARRAY['placement_officer', 'system_admin']))
WITH CHECK (is_any_role(ARRAY['placement_officer', 'system_admin']));

CREATE POLICY "service_role_drives"
ON public.drives FOR ALL TO service_role
USING (true) WITH CHECK (true);


-- ============================================================
-- STEP 9: DRIVE STAGES TABLE
-- ============================================================

CREATE POLICY "drive_stages_select"
ON public.drive_stages FOR SELECT TO authenticated
USING (true);

CREATE POLICY "drive_stages_manage"
ON public.drive_stages FOR ALL TO authenticated
USING  (is_any_role(ARRAY['placement_officer', 'system_admin']))
WITH CHECK (is_any_role(ARRAY['placement_officer', 'system_admin']));

CREATE POLICY "service_role_drive_stages"
ON public.drive_stages FOR ALL TO service_role
USING (true) WITH CHECK (true);


-- ============================================================
-- STEP 10: INTERVIEWS TABLE
-- interviews.student_id = UUID → auth.uid() directly (no cast)
-- ============================================================

CREATE POLICY "interviews_select_own"
ON public.interviews FOR SELECT TO authenticated
USING (student_id = auth.uid());

CREATE POLICY "interviews_select_admins"
ON public.interviews FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "interviews_manage"
ON public.interviews FOR ALL TO authenticated
USING  (is_any_role(ARRAY['faculty', 'placement_officer', 'system_admin']))
WITH CHECK (is_any_role(ARRAY['faculty', 'placement_officer', 'system_admin']));

CREATE POLICY "service_role_interviews"
ON public.interviews FOR ALL TO service_role
USING (true) WITH CHECK (true);


-- ============================================================
-- STEP 11: OFFERS TABLE
-- offers.student_id = UUID → auth.uid() directly (no cast)
-- ============================================================

CREATE POLICY "offers_select_own"
ON public.offers FOR SELECT TO authenticated
USING (student_id = auth.uid());

CREATE POLICY "offers_select_admins"
ON public.offers FOR SELECT TO authenticated
USING (is_admin());

CREATE POLICY "offers_manage"
ON public.offers FOR ALL TO authenticated
USING  (is_any_role(ARRAY['placement_officer', 'system_admin']))
WITH CHECK (is_any_role(ARRAY['placement_officer', 'system_admin']));

CREATE POLICY "service_role_offers"
ON public.offers FOR ALL TO service_role
USING (true) WITH CHECK (true);


-- ============================================================
-- STEP 12: AUDIT LOGS TABLE
-- ============================================================

CREATE POLICY "audit_logs_select"
ON public.audit_logs FOR SELECT TO authenticated
USING (is_any_role(ARRAY['system_admin', 'dean']));

CREATE POLICY "audit_logs_insert"
ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "service_role_audit_logs"
ON public.audit_logs FOR ALL TO service_role
USING (true) WITH CHECK (true);


-- ============================================================
-- STEP 13: ELIGIBILITY RULES TABLE
-- ============================================================

CREATE POLICY "eligibility_select"
ON public.eligibility_rules FOR SELECT TO authenticated
USING (true);

CREATE POLICY "eligibility_manage"
ON public.eligibility_rules FOR ALL TO authenticated
USING  (is_any_role(ARRAY['program_chair', 'system_admin']))
WITH CHECK (is_any_role(ARRAY['program_chair', 'system_admin']));

CREATE POLICY "service_role_eligibility"
ON public.eligibility_rules FOR ALL TO service_role
USING (true) WITH CHECK (true);

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='eligibility_rule_years') THEN
    EXECUTE 'CREATE POLICY "elig_years_select" ON public.eligibility_rule_years FOR SELECT TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY "elig_years_manage" ON public.eligibility_rule_years FOR ALL TO authenticated USING (is_any_role(ARRAY[''program_chair'', ''system_admin''])) WITH CHECK (is_any_role(ARRAY[''program_chair'', ''system_admin'']))';
    EXECUTE 'CREATE POLICY "elig_years_service" ON public.eligibility_rule_years FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='eligibility_rule_departments') THEN
    EXECUTE 'CREATE POLICY "elig_depts_select" ON public.eligibility_rule_departments FOR SELECT TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY "elig_depts_manage" ON public.eligibility_rule_departments FOR ALL TO authenticated USING (is_any_role(ARRAY[''program_chair'', ''system_admin''])) WITH CHECK (is_any_role(ARRAY[''program_chair'', ''system_admin'']))';
    EXECUTE 'CREATE POLICY "elig_depts_service" ON public.eligibility_rule_departments FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='eligibility_rule_drives') THEN
    EXECUTE 'CREATE POLICY "elig_drives_select" ON public.eligibility_rule_drives FOR SELECT TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY "elig_drives_manage" ON public.eligibility_rule_drives FOR ALL TO authenticated USING (is_any_role(ARRAY[''program_chair'', ''system_admin''])) WITH CHECK (is_any_role(ARRAY[''program_chair'', ''system_admin'']))';
    EXECUTE 'CREATE POLICY "elig_drives_service" ON public.eligibility_rule_drives FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
END $$;


-- ============================================================
-- STEP 14: STUDENT RELATIONAL TABLES
-- student_id in these tables is UUID → auth.uid() directly
-- ============================================================

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='student_skills') THEN
    EXECUTE 'CREATE POLICY "ss_own"     ON public.student_skills FOR ALL TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid())';
    EXECUTE 'CREATE POLICY "ss_admins"  ON public.student_skills FOR SELECT TO authenticated USING (is_admin())';
    EXECUTE 'CREATE POLICY "ss_service" ON public.student_skills FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='student_projects') THEN
    EXECUTE 'CREATE POLICY "sp_own"     ON public.student_projects FOR ALL TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid())';
    EXECUTE 'CREATE POLICY "sp_admins"  ON public.student_projects FOR SELECT TO authenticated USING (is_admin())';
    EXECUTE 'CREATE POLICY "sp_service" ON public.student_projects FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='student_internships') THEN
    EXECUTE 'CREATE POLICY "si_own"     ON public.student_internships FOR ALL TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid())';
    EXECUTE 'CREATE POLICY "si_admins"  ON public.student_internships FOR SELECT TO authenticated USING (is_admin())';
    EXECUTE 'CREATE POLICY "si_service" ON public.student_internships FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='student_certifications') THEN
    EXECUTE 'CREATE POLICY "sc_own"     ON public.student_certifications FOR ALL TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid())';
    EXECUTE 'CREATE POLICY "sc_admins"  ON public.student_certifications FOR SELECT TO authenticated USING (is_admin())';
    EXECUTE 'CREATE POLICY "sc_service" ON public.student_certifications FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='student_achievements') THEN
    EXECUTE 'CREATE POLICY "sa_own"     ON public.student_achievements FOR ALL TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid())';
    EXECUTE 'CREATE POLICY "sa_admins"  ON public.student_achievements FOR SELECT TO authenticated USING (is_admin())';
    EXECUTE 'CREATE POLICY "sa_service" ON public.student_achievements FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='student_swoc') THEN
    EXECUTE 'CREATE POLICY "sw_own"     ON public.student_swoc FOR ALL TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid())';
    EXECUTE 'CREATE POLICY "sw_admins"  ON public.student_swoc FOR SELECT TO authenticated USING (is_admin())';
    EXECUTE 'CREATE POLICY "sw_service" ON public.student_swoc FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
END $$;


-- ============================================================
-- STEP 15: PLATFORM CONFIG TABLE
-- ============================================================

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='platform_config') THEN
    EXECUTE 'CREATE POLICY "pc_select"  ON public.platform_config FOR SELECT TO authenticated USING (is_admin())';
    EXECUTE 'CREATE POLICY "pc_manage"  ON public.platform_config FOR ALL TO authenticated USING (is_role(''system_admin'')) WITH CHECK (is_role(''system_admin''))';
    EXECUTE 'CREATE POLICY "pc_service" ON public.platform_config FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
END $$;


-- ============================================================
-- STEP 16: GRANT PERMISSIONS
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON ALL TABLES    IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.students      TO authenticated;
GRANT SELECT                          ON public.admins        TO authenticated;
GRANT SELECT                          ON public.companies     TO authenticated;
GRANT SELECT                          ON public.drives        TO authenticated;
GRANT SELECT                          ON public.drive_stages  TO authenticated;
GRANT SELECT                          ON public.interviews    TO authenticated;
GRANT SELECT                          ON public.offers        TO authenticated;
GRANT SELECT, INSERT                  ON public.audit_logs    TO authenticated;
GRANT SELECT                          ON public.eligibility_rules TO authenticated;


-- ============================================================
-- STEP 17: VERIFICATION
-- ============================================================

-- 1. All 4 functions must exist and be SECURITY DEFINER (true)
SELECT proname, prosecdef AS security_definer
FROM pg_proc
WHERE proname IN ('is_admin','is_role','is_any_role','get_my_admin_role')
  AND pronamespace = 'public'::regnamespace;

-- 2. Must return 0 rows — no policy on admins queries admins directly
SELECT policyname, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'admins'
  AND (qual LIKE '%FROM admins%' OR qual LIKE '%FROM public.admins%');

-- 3. RLS must be enabled on all key tables (rowsecurity = true)
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('students','admins','companies','drives','interviews','offers','audit_logs')
ORDER BY tablename;

-- 4. Full policy list for review
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
