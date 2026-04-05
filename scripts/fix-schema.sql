-- ═══════════════════════════════════════════════════════════════════════════
-- Campus2Career — Schema Fix Script
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. audit_logs — add missing columns
ALTER TABLE public.audit_logs
    ADD COLUMN IF NOT EXISTS metadata        JSONB,
    ADD COLUMN IF NOT EXISTS before_snapshot JSONB,
    ADD COLUMN IF NOT EXISTS after_snapshot  JSONB,
    ADD COLUMN IF NOT EXISTS ip_address      TEXT,
    ADD COLUMN IF NOT EXISTS user_agent      TEXT;

-- 2. admins — add missing columns
ALTER TABLE public.admins
    ADD COLUMN IF NOT EXISTS full_name  TEXT,
    ADD COLUMN IF NOT EXISTS phone      TEXT,
    ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS notes      TEXT;

UPDATE public.admins SET full_name = name WHERE full_name IS NULL AND name IS NOT NULL;

-- 3. companies — add missing columns
ALTER TABLE public.companies
    ADD COLUMN IF NOT EXISTS hr_name       TEXT,
    ADD COLUMN IF NOT EXISTS hr_email      TEXT,
    ADD COLUMN IF NOT EXISTS hr_phone      TEXT,
    ADD COLUMN IF NOT EXISTS package_range TEXT,
    ADD COLUMN IF NOT EXISTS job_roles     TEXT[];

-- 4. company_departments
CREATE TABLE IF NOT EXISTS public.company_departments (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    department TEXT NOT NULL
);

-- 5. company_job_roles
CREATE TABLE IF NOT EXISTS public.company_job_roles (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    role       TEXT NOT NULL
);

-- 6. drive_stages
CREATE TABLE IF NOT EXISTS public.drive_stages (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drive_id       UUID REFERENCES public.drives(id) ON DELETE CASCADE,
    stage_name     TEXT NOT NULL,
    stage_date     TIMESTAMPTZ,
    stage_location TEXT,
    notes          TEXT,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 7. drives — add missing columns
ALTER TABLE public.drives
    ADD COLUMN IF NOT EXISTS registration_start  TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS registration_end    TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS package_range       TEXT,
    ADD COLUMN IF NOT EXISTS description         TEXT,
    ADD COLUMN IF NOT EXISTS mode                TEXT DEFAULT 'on-campus',
    ADD COLUMN IF NOT EXISTS job_role            TEXT,
    ADD COLUMN IF NOT EXISTS allowed_departments TEXT[],
    ADD COLUMN IF NOT EXISTS allowed_years       TEXT[];

-- 8. platform_config
CREATE TABLE IF NOT EXISTS public.platform_config (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key              TEXT UNIQUE NOT NULL,
    platform_name           TEXT DEFAULT 'Campus2Career',
    institute_name          TEXT DEFAULT 'NMIMS Hyderabad',
    support_email           TEXT,
    current_academic_year   TEXT DEFAULT '2025-26',
    active_placement_season BOOLEAN DEFAULT TRUE,
    min_readiness_threshold INTEGER DEFAULT 60,
    session_timeout_minutes INTEGER DEFAULT 480,
    audit_logging_enabled   BOOLEAN DEFAULT TRUE,
    updated_by              TEXT,
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.platform_config
    (config_key, platform_name, institute_name, current_academic_year, active_placement_season)
VALUES
    ('platformSettings', 'Campus2Career', 'NMIMS Hyderabad', '2025-26', TRUE)
ON CONFLICT (config_key) DO NOTHING;

-- 9. eligibility_rules
CREATE TABLE IF NOT EXISTS public.eligibility_rules (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name            TEXT NOT NULL,
    description          TEXT,
    min_cgpa             NUMERIC DEFAULT 6.0,
    active               BOOLEAN DEFAULT TRUE,
    max_active_backlogs  INTEGER DEFAULT 0,
    max_history_backlogs INTEGER DEFAULT 0,
    created_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.eligibility_rule_years (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID REFERENCES public.eligibility_rules(id) ON DELETE CASCADE,
    year    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.eligibility_rule_departments (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id    UUID REFERENCES public.eligibility_rules(id) ON DELETE CASCADE,
    department TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.eligibility_rule_drives (
    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id  UUID REFERENCES public.eligibility_rules(id) ON DELETE CASCADE,
    drive_id UUID REFERENCES public.drives(id) ON DELETE CASCADE
);

-- 10. student_certifications
CREATE TABLE IF NOT EXISTS public.student_certifications (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    issuer     TEXT,
    year       TEXT,
    link       TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. student_swoc
CREATE TABLE IF NOT EXISTS public.student_swoc (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id    UUID REFERENCES public.students(id) ON DELETE CASCADE,
    strengths     TEXT[],
    weaknesses    TEXT[],
    opportunities TEXT[],
    challenges    TEXT[],
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 12. student_syllabi
CREATE TABLE IF NOT EXISTS public.student_syllabi (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_sap_id TEXT NOT NULL REFERENCES public.students(sap_id) ON DELETE CASCADE,
    semester       INTEGER NOT NULL,
    file_name      TEXT NOT NULL,
    download_url   TEXT,
    uploaded_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_sap_id, semester)
);

-- 13. curriculum
CREATE TABLE IF NOT EXISTS public.curriculum (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch       TEXT NOT NULL,
    batch        TEXT NOT NULL,
    download_url TEXT,
    semesters    JSONB,
    uploaded_by  TEXT,
    updated_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(branch, batch)
);

-- 14. student_readiness_v
DROP VIEW IF EXISTS public.student_readiness_v CASCADE;

CREATE VIEW public.student_readiness_v AS
WITH student_stats AS (
    SELECT
        s.id, s.name, s.sap_id, s.email, s.cgpa, s.branch, s.current_year,
        s.placement_status, s.bio, s.phone, s.github_url, s.linkedin_url,
        s.resume_url, s.resume_name, s.portfolio_url,
        s.leetcode_username, s.leetcode_total_solved, s.leetcode_easy_solved,
        s.leetcode_medium_solved, s.leetcode_hard_solved, s.leetcode_streak,
        s.career_track, s.career_track_emoji,
        s.career_discovery_completed, s.profile_completed, s.assessment_completed,
        s.onboarding_step, s.batch, s.roll_no, s.location,
        s.tech_skills, s.skills, s.interests, s.goals, s.clubs, s.hobbies, s.languages,
        s.projects, s.internships, s.certifications, s.achievements,
        s.assessment_results, s.academic_data,
        s.updated_at, s.created_at,
        (SELECT COALESCE(json_agg(sk.skill), '[]'::json)
            FROM public.student_skills sk WHERE sk.student_id = s.id) AS skill_list,
        (SELECT COALESCE(json_agg(sp.*), '[]'::json)
            FROM public.student_projects sp WHERE sp.student_id = s.id) AS project_list,
        (SELECT COALESCE(json_agg(si.*), '[]'::json)
            FROM public.student_internships si WHERE si.student_id = s.id) AS internship_list,
        (SELECT COUNT(*) FROM public.student_skills sk WHERE sk.student_id = s.id) AS skills_count,
        (SELECT COUNT(*) FROM public.student_projects sp WHERE sp.student_id = s.id) AS projects_count,
        (CASE WHEN s.bio IS NOT NULL AND s.bio != '' THEN 1 ELSE 0 END +
         CASE WHEN s.phone IS NOT NULL AND s.phone != '' THEN 1 ELSE 0 END +
         CASE WHEN s.github_url IS NOT NULL AND s.github_url != '' THEN 1 ELSE 0 END +
         CASE WHEN s.linkedin_url IS NOT NULL AND s.linkedin_url != '' THEN 1 ELSE 0 END +
         CASE WHEN s.resume_url IS NOT NULL AND s.resume_url != '' THEN 2 ELSE 0 END) AS profile_score
    FROM public.students s
)
SELECT
    ss.*,
    GREATEST(0, LEAST(100,
        (ss.profile_score * 5) +
        CASE WHEN ss.cgpa >= 9 THEN 20 WHEN ss.cgpa >= 8 THEN 15 WHEN ss.cgpa >= 7 THEN 10 ELSE 0 END +
        CASE WHEN ss.skills_count >= 10 THEN 20 WHEN ss.skills_count >= 5 THEN 15 WHEN ss.skills_count >= 2 THEN 10 ELSE 0 END +
        CASE WHEN ss.projects_count >= 4 THEN 25 WHEN ss.projects_count >= 2 THEN 20 WHEN ss.projects_count >= 1 THEN 10 ELSE 0 END +
        CASE WHEN ss.leetcode_total_solved >= 200 THEN 20 WHEN ss.leetcode_total_solved >= 100 THEN 15 WHEN ss.leetcode_total_solved >= 50 THEN 10 ELSE 0 END
    )) AS readiness_score
FROM student_stats ss;

-- 15. placement_analytics_v
DROP VIEW IF EXISTS public.placement_analytics_v;

CREATE VIEW public.placement_analytics_v AS
WITH counts AS (
    SELECT
        (SELECT COUNT(*)::INTEGER FROM public.students)                              AS total_students,
        (SELECT COUNT(*)::INTEGER FROM public.drives WHERE status = 'active')        AS active_drives,
        (SELECT COUNT(*)::INTEGER FROM public.companies)                             AS partner_companies,
        (SELECT COUNT(*)::INTEGER FROM public.offers)                                AS total_offers,
        (SELECT COUNT(*)::INTEGER FROM public.interviews WHERE status = 'scheduled') AS pending_interviews
),

readiness AS (
    SELECT COALESCE(ROUND(AVG(
        GREATEST(0, LEAST(100,
            CASE WHEN bio IS NOT NULL AND bio != '' THEN 5 ELSE 0 END +
            CASE WHEN phone IS NOT NULL AND phone != '' THEN 5 ELSE 0 END +
            CASE WHEN github_url IS NOT NULL AND github_url != '' THEN 5 ELSE 0 END +
            CASE WHEN linkedin_url IS NOT NULL AND linkedin_url != '' THEN 5 ELSE 0 END +
            CASE WHEN resume_url IS NOT NULL AND resume_url != '' THEN 10 ELSE 0 END +
            CASE WHEN cgpa >= 9 THEN 20 WHEN cgpa >= 8 THEN 15 WHEN cgpa >= 7 THEN 10 ELSE 0 END +
            CASE WHEN leetcode_total_solved >= 200 THEN 20
                 WHEN leetcode_total_solved >= 100 THEN 15
                 WHEN leetcode_total_solved >= 50  THEN 10
                 ELSE 0 END
        ))
    , 1), 0)::NUMERIC(5,1) AS avg_readiness
    FROM public.students
)


SELECT
    c.total_students,
    c.active_drives,
    c.partner_companies,
    c.total_offers,
    c.pending_interviews,
    r.avg_readiness
FROM counts c, readiness r;



-- 16. Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;



-- 17. Disable RLS on all tables
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(t) || ' DISABLE ROW LEVEL SECURITY';
    END LOOP;
END $$;


-- Verification
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'audit_logs'
  AND table_schema = 'public'
ORDER BY ordinal_position;

