-- ─────────────────────────────────────────────────────────────────────────────
-- Campus2Career — Student Migration Pre-flight SQL
-- Run this in Supabase SQL Editor BEFORE running migrate-students.mjs
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add missing onboarding flag columns (safe, idempotent)
ALTER TABLE public.students
    ADD COLUMN IF NOT EXISTS assessment_completed   BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS portfolio_url          TEXT,
    ADD COLUMN IF NOT EXISTS clubs                  TEXT[],
    ADD COLUMN IF NOT EXISTS hobbies                TEXT[],
    ADD COLUMN IF NOT EXISTS interests              TEXT[],
    ADD COLUMN IF NOT EXISTS goals                  TEXT[],
    ADD COLUMN IF NOT EXISTS current_semester       TEXT,
    ADD COLUMN IF NOT EXISTS division               TEXT,
    ADD COLUMN IF NOT EXISTS languages              TEXT[];

-- 2. Update the Readiness View to include these new columns
--    (The adapter uses this view, so it MUST have these flags)
DROP VIEW IF EXISTS public.student_readiness_v CASCADE;

CREATE OR REPLACE VIEW public.student_readiness_v AS
WITH student_stats AS (
    SELECT 
        s.id, s.name, s.sap_id, s.email, s.cgpa, s.branch, s.current_year, 
        s.placement_status, s.bio, s.phone, s.github_url, s.linkedin_url, s.resume_url, 
        s.leetcode_total_solved, s.leetcode_easy_solved, s.leetcode_medium_solved, s.leetcode_hard_solved,
        s.career_track, s.career_track_emoji, 
        s.career_discovery_completed, s.profile_completed, s.assessment_completed,
        s.updated_at,
        (SELECT COALESCE(json_agg(sk.skill), '[]'::json) FROM public.student_skills sk WHERE sk.student_id = s.id) as skills,
        (SELECT COALESCE(json_agg(sp.*), '[]'::json) FROM public.student_projects sp WHERE sp.student_id = s.id) as projects,
        (SELECT COALESCE(json_agg(si.*), '[]'::json) FROM public.student_internships si WHERE si.student_id = s.id) as internships,
        (SELECT count(*) FROM public.student_skills sk WHERE sk.student_id = s.id) as skills_count,
        (SELECT count(*) FROM public.student_projects sp WHERE sp.student_id = s.id) as projects_count,
        CASE WHEN s.bio IS NOT NULL AND s.bio != '' THEN 1 ELSE 0 END +
        CASE WHEN s.phone IS NOT NULL AND s.phone != '' THEN 1 ELSE 0 END +
        CASE WHEN s.github_url IS NOT NULL AND s.github_url != '' THEN 1 ELSE 0 END +
        CASE WHEN s.linkedin_url IS NOT NULL AND s.linkedin_url != '' THEN 1 ELSE 0 END +
        CASE WHEN s.resume_url IS NOT NULL AND s.resume_url != '' THEN 2 ELSE 0 END as profile_score
    FROM public.students s
)
SELECT 
    *,
    GREATEST(0, LEAST(100,
        (profile_score * 5) + 
        CASE WHEN cgpa >= 9 THEN 20 WHEN cgpa >= 8 THEN 15 WHEN cgpa >= 7 THEN 10 ELSE 0 END +
        CASE WHEN skills_count >= 10 THEN 20 WHEN skills_count >= 5 THEN 15 WHEN skills_count >= 2 THEN 10 ELSE 0 END +
        CASE WHEN projects_count >= 4 THEN 25 WHEN projects_count >= 2 THEN 20 WHEN projects_count >= 1 THEN 10 ELSE 0 END +
        CASE WHEN leetcode_total_solved >= 200 THEN 20 WHEN leetcode_total_solved >= 100 THEN 15 WHEN leetcode_total_solved >= 50 THEN 10 ELSE 0 END
    )) as readiness_score
FROM student_stats;


-- 3. Allow migration bypass and confirm ready
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_internships DISABLE ROW LEVEL SECURITY;

SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'students';
