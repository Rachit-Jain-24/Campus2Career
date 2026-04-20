-- ==========================================
-- Campus2Career - Production-Ready RLS Policies
-- ==========================================
-- This script implements proper Row Level Security for all tables
-- Students can only access their own data
-- Admins have role-based access to student data
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 1. STUDENTS TABLE POLICIES
-- ==========================================

-- Students can read their own profile
CREATE POLICY "students_read_own"
ON students FOR SELECT
USING (auth.uid()::text = id);

-- Students can update their own profile
CREATE POLICY "students_update_own"
ON students FOR UPDATE
USING (auth.uid()::text = id)
WITH CHECK (auth.uid()::text = id);

-- Students can insert their own profile (during signup)
CREATE POLICY "students_insert_own"
ON students FOR INSERT
WITH CHECK (auth.uid()::text = id);

-- Admins can read all students (for management)
CREATE POLICY "admins_read_all_students"
ON students FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.id = auth.uid()::text
  )
);

-- Admins can update students (for management)
CREATE POLICY "admins_update_students"
ON students FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.id = auth.uid()::text
  )
);

-- ==========================================
-- 2. ADMINS TABLE POLICIES
-- ==========================================

-- Admins can read their own profile
CREATE POLICY "admins_read_own"
ON admins FOR SELECT
USING (auth.uid()::text = id);

-- Only system_admin can read all admins
CREATE POLICY "system_admin_read_all"
ON admins FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.id = auth.uid()::text 
    AND admins.role = 'system_admin'
  )
);

-- ==========================================
-- 3. COMPANIES TABLE POLICIES
-- ==========================================

-- All authenticated users can read companies
CREATE POLICY "authenticated_read_companies"
ON companies FOR SELECT
USING (auth.role() = 'authenticated');

-- Only admins can modify companies
CREATE POLICY "admins_manage_companies"
ON companies FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.id = auth.uid()::text
  )
);

-- ==========================================
-- 4. DRIVES TABLE POLICIES
-- ==========================================

-- Students can read active drives
CREATE POLICY "students_read_active_drives"
ON drives FOR SELECT
USING (
  auth.role() = 'authenticated' 
  AND status IN ('active', 'upcoming')
);

-- Admins can read all drives
CREATE POLICY "admins_read_all_drives"
ON drives FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.id = auth.uid()::text
  )
);

-- Only placement_officer and system_admin can manage drives
CREATE POLICY "placement_officer_manage_drives"
ON drives FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.id = auth.uid()::text 
    AND admins.role IN ('placement_officer', 'system_admin')
  )
);

-- ==========================================
-- 5. INTERVIEWS TABLE POLICIES
-- ==========================================

-- Students can read their own interviews
CREATE POLICY "students_read_own_interviews"
ON interviews FOR SELECT
USING (student_id = auth.uid()::text);

-- Admins can read interviews for their role scope
CREATE POLICY "admins_read_interviews"
ON interviews FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.id = auth.uid()::text
  )
);

-- Faculty and placement_officer can manage interviews
CREATE POLICY "faculty_manage_interviews"
ON interviews FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.id = auth.uid()::text 
    AND admins.role IN ('faculty', 'placement_officer', 'system_admin')
  )
);

-- ==========================================
-- 6. OFFERS TABLE POLICIES
-- ==========================================

-- Students can read their own offers
CREATE POLICY "students_read_own_offers"
ON offers FOR SELECT
USING (student_id = auth.uid()::text);

-- Admins can read all offers
CREATE POLICY "admins_read_all_offers"
ON offers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.id = auth.uid()::text
  )
);

-- Only placement_officer and system_admin can manage offers
CREATE POLICY "placement_officer_manage_offers"
ON offers FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.id = auth.uid()::text 
    AND admins.role IN ('placement_officer', 'system_admin')
  )
);

-- ==========================================
-- 7. AUDIT_LOGS TABLE POLICIES
-- ==========================================

-- Only system_admin and dean can read audit logs
CREATE POLICY "admin_read_audit_logs"
ON audit_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.id = auth.uid()::text 
    AND admins.role IN ('system_admin', 'dean')
  )
);

-- System can insert audit logs (via service role)
CREATE POLICY "system_insert_audit_logs"
ON audit_logs FOR INSERT
WITH CHECK (true);

-- ==========================================
-- 8. GRANT NECESSARY PERMISSIONS
-- ==========================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant table permissions
GRANT SELECT ON students TO anon, authenticated;
GRANT SELECT ON admins TO anon, authenticated;
GRANT SELECT ON companies TO anon, authenticated;
GRANT SELECT ON drives TO anon, authenticated;
GRANT SELECT ON interviews TO anon, authenticated;
GRANT SELECT ON offers TO anon, authenticated;
GRANT SELECT ON audit_logs TO authenticated;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Check RLS is enabled on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
