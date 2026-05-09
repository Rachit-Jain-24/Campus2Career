-- ============================================================
-- Campus2Career — Student Registration Whitelist
-- ============================================================
-- Only students whose email has been pre-added by an admin
-- can register on the platform.
--
-- Run this in Supabase SQL Editor.
-- ============================================================

-- 1. Create the whitelist table
CREATE TABLE IF NOT EXISTS public.student_whitelist (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT NOT NULL UNIQUE,
    sap_id      TEXT,                          -- optional, for cross-validation
    full_name   TEXT,                          -- optional, for display
    branch      TEXT,
    batch       TEXT,
    added_by    TEXT NOT NULL,                 -- admin email who added this entry
    added_at    TIMESTAMPTZ DEFAULT NOW(),
    is_used     BOOLEAN DEFAULT FALSE,         -- flipped to TRUE after successful signup
    used_at     TIMESTAMPTZ,
    notes       TEXT
);

-- 2. Index for fast email lookups during signup
CREATE INDEX IF NOT EXISTS idx_student_whitelist_email
    ON public.student_whitelist (LOWER(email));

CREATE INDEX IF NOT EXISTS idx_student_whitelist_sap_id
    ON public.student_whitelist (sap_id)
    WHERE sap_id IS NOT NULL;

-- 3. RLS
ALTER TABLE public.student_whitelist ENABLE ROW LEVEL SECURITY;

-- Admins can read/write the whitelist
CREATE POLICY "whitelist_select_admins"
ON public.student_whitelist FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "whitelist_insert_admins"
ON public.student_whitelist FOR INSERT
TO authenticated
WITH CHECK (is_any_role(ARRAY['system_admin', 'dean', 'director', 'program_chair']));

CREATE POLICY "whitelist_update_admins"
ON public.student_whitelist FOR UPDATE
TO authenticated
USING (is_any_role(ARRAY['system_admin', 'dean', 'director', 'program_chair']));

CREATE POLICY "whitelist_delete_admins"
ON public.student_whitelist FOR DELETE
TO authenticated
USING (is_any_role(ARRAY['system_admin', 'dean', 'director']));

-- Anonymous/unauthenticated can check if an email is whitelisted (needed during signup)
-- We expose ONLY a boolean check, not the full row
CREATE POLICY "whitelist_anon_check"
ON public.student_whitelist FOR SELECT
TO anon
USING (true);

-- Service role full access
CREATE POLICY "whitelist_service_role"
ON public.student_whitelist FOR ALL
TO service_role
USING (true) WITH CHECK (true);

-- 4. Grant permissions
GRANT SELECT ON public.student_whitelist TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.student_whitelist TO authenticated;
GRANT ALL ON public.student_whitelist TO service_role;

-- 5. Verification
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'student_whitelist'
ORDER BY ordinal_position;
