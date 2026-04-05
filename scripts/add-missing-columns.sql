-- Campus2Career — Add Missing Columns to students table
-- Run this in Supabase SQL Editor to support full profile updates from the app

ALTER TABLE public.students
    ADD COLUMN IF NOT EXISTS tech_skills        TEXT[],
    ADD COLUMN IF NOT EXISTS skills             TEXT[],
    ADD COLUMN IF NOT EXISTS resume_name        TEXT,
    ADD COLUMN IF NOT EXISTS portfolio_url      TEXT,
    ADD COLUMN IF NOT EXISTS assessment_results JSONB,
    ADD COLUMN IF NOT EXISTS academic_data      JSONB,
    ADD COLUMN IF NOT EXISTS projects           JSONB,
    ADD COLUMN IF NOT EXISTS internships        JSONB,
    ADD COLUMN IF NOT EXISTS certifications     JSONB,
    ADD COLUMN IF NOT EXISTS achievements       JSONB;

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'students' 
ORDER BY ordinal_position;

-- Create placement_analytics_v view for dashboard stats
CREATE OR REPLACE VIEW public.placement_analytics_v AS
SELECT
    (SELECT COUNT(*) FROM public.students) AS total_students,
    (SELECT COUNT(*) FROM public.drives WHERE status = 'active') AS active_drives,
    (SELECT COUNT(*) FROM public.companies) AS partner_companies,
    (SELECT COUNT(*) FROM public.offers) AS total_offers,
    (SELECT COUNT(*) FROM public.interviews WHERE status = 'scheduled') AS pending_interviews,
    (SELECT COALESCE(AVG(
        GREATEST(0, LEAST(100,
            CASE WHEN bio IS NOT NULL AND bio != '' THEN 5 ELSE 0 END +
            CASE WHEN phone IS NOT NULL AND phone != '' THEN 5 ELSE 0 END +
            CASE WHEN github_url IS NOT NULL AND github_url != '' THEN 5 ELSE 0 END +
            CASE WHEN linkedin_url IS NOT NULL AND linkedin_url != '' THEN 5 ELSE 0 END +
            CASE WHEN resume_url IS NOT NULL AND resume_url != '' THEN 10 ELSE 0 END +
            CASE WHEN cgpa >= 9 THEN 20 WHEN cgpa >= 8 THEN 15 WHEN cgpa >= 7 THEN 10 ELSE 0 END +
            CASE WHEN leetcode_total_solved >= 200 THEN 20 WHEN leetcode_total_solved >= 100 THEN 15 WHEN leetcode_total_solved >= 50 THEN 10 ELSE 0 END
        ))
    ), 0) FROM public.students) AS avg_readiness;
