-- ==========================================
-- Campus2Career - FIXED RLS Policies
-- ==========================================
-- This fixes the "infinite recursion detected in policy for relation admins" error
-- 
-- THE PROBLEM:
-- Policies on the 'admins' table were querying the 'admins' table itself,
-- causing infinite recursion.
--
-- THE SOLUTION:
-- Use simpler policies that don't self-reference, or use a function
-- that bypasses RLS for admin checks.
-- ==========================================

-- First, drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "students_read_own" ON students;
DROP POLICY IF EXISTS "students_update_own" ON students;
DROP POLICY IF EXISTS "students_insert_own" ON students;
DROP POLICY IF EXISTS "admins_read_own" ON admins;
DROP POLICY IF EXISTS "system_admin_read_all" ON admins;
DROP POLICY IF EXISTS "system_admin_insert_admins" ON admins;
DROP POLICY IF EXISTS "system_admin_update_admins" ON admins;
DROP POLICY IF EXISTS "admins_read_all_students" ON students;
DROP POLICY IF EXISTS "admins_update_students" ON students;
DROP POLICY IF EXISTS "authenticated_read_companies" ON companies;
DROP POLICY IF EXISTS "admins_manage_companies" ON companies;
DROP POLICY IF EXISTS "students_read_active_drives" ON drives;
DROP POLICY IF EXISTS "authenticated_read_active_drives" ON drives;
DROP POLICY IF EXISTS "admins_read_all_drives" ON drives;
DROP POLICY IF EXISTS "placement_officer_manage_drives" ON drives;
DROP POLICY IF EXISTS "students_read_own_interviews" ON interviews;
DROP POLICY IF EXISTS "admins_read_interviews" ON interviews;
DROP POLICY IF EXISTS "faculty_manage_interviews" ON interviews;
DROP POLICY IF EXISTS "students_read_own_offers" ON offers;
DROP POLICY IF EXISTS "admins_read_offers" ON offers;
DROP POLICY IF EXISTS "placement_officer_manage_offers" ON offers;
DROP POLICY IF EXISTS "admins_manage_audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "system_admin_read_audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "authenticated_read_drive_stages" ON drive_stages;
DROP POLICY IF EXISTS "placement_officer_manage_drive_stages" ON drive_stages;

-- ==========================================
-- Create a helper function to check admin status
-- This function runs with SECURITY DEFINER to bypass RLS
-- ==========================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins 
    WHERE id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION is_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins 
    WHERE id = auth.uid()
    AND role = required_role
  );
$$;

CREATE OR REPLACE FUNCTION is_any_role(required_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins 
    WHERE id = auth.uid()
    AND role = ANY(required_roles)
  );
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_role(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION is_any_role(TEXT[]) TO authenticated;

-- ==========================================
-- 1. STUDENTS TABLE POLICIES
-- ==========================================

-- Students can read their own profile
CREATE POLICY "students_read_own"
ON students FOR SELECT
USING (id = auth.uid());

-- Students can update their own profile
CREATE POLICY "students_update_own"
ON students FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Students can insert their own profile (during signup)
CREATE POLICY "students_insert_own"
ON students FOR INSERT
WITH CHECK (id = auth.uid());

-- Admins can read all students
CREATE POLICY "admins_read_all_students"
ON students FOR SELECT
USING (is_admin());

-- Admins can update students
CREATE POLICY "admins_update_students"
ON students FOR UPDATE
USING (is_admin());

-- ==========================================
-- 2. ADMINS TABLE POLICIES (FIXED - No recursion!)
-- ==========================================

-- Admins can read their own profile
CREATE POLICY "admins_read_own"
ON admins FOR SELECT
USING (id = auth.uid());

-- System admin can read all admins (using function to avoid recursion)
CREATE POLICY "system_admin_read_all"
ON admins FOR SELECT
USING (is_role('system_admin'));

-- System admin can insert new admins
CREATE POLICY "system_admin_insert_admins"
ON admins FOR INSERT
WITH CHECK (is_role('system_admin'));

-- System admin can update admins
CREATE POLICY "system_admin_update_admins"
ON admins FOR UPDATE
USING (is_role('system_admin'));

-- ==========================================
-- 3. COMPANIES TABLE POLICIES
-- ==========================================

-- All authenticated users can read companies
CREATE POLICY "authenticated_read_companies"
ON companies FOR SELECT
USING (auth.role() = 'authenticated');

-- Admins can modify companies
CREATE POLICY "admins_manage_companies"
ON companies FOR ALL
USING (is_admin());

-- ==========================================
-- 4. DRIVES TABLE POLICIES (This was failing!)
-- ==========================================

-- All authenticated users can read active drives
CREATE POLICY "authenticated_read_active_drives"
ON drives FOR SELECT
USING (status IN ('active', 'upcoming'));

-- Admins can read all drives
CREATE POLICY "admins_read_all_drives"
ON drives FOR SELECT
USING (is_admin());

-- Placement officer and system admin can manage drives
CREATE POLICY "placement_officer_manage_drives"
ON drives FOR ALL
USING (is_any_role(ARRAY['placement_officer', 'system_admin']));

-- ==========================================
-- 5. INTERVIEWS TABLE POLICIES
-- ==========================================

-- Students can read their own interviews
CREATE POLICY "students_read_own_interviews"
ON interviews FOR SELECT
USING (student_id = auth.uid());

-- Admins can read all interviews
CREATE POLICY "admins_read_interviews"
ON interviews FOR SELECT
USING (is_admin());

-- Faculty and placement officer can manage interviews
CREATE POLICY "faculty_manage_interviews"
ON interviews FOR ALL
USING (is_any_role(ARRAY['faculty', 'placement_officer', 'system_admin']));

-- ==========================================
-- 6. OFFERS TABLE POLICIES
-- ==========================================

-- Students can read their own offers
CREATE POLICY "students_read_own_offers"
ON offers FOR SELECT
USING (student_id = auth.uid());

-- Admins can read all offers
CREATE POLICY "admins_read_offers"
ON offers FOR SELECT
USING (is_admin());

-- Placement officer can manage offers
CREATE POLICY "placement_officer_manage_offers"
ON offers FOR ALL
USING (is_any_role(ARRAY['placement_officer', 'system_admin']));

-- ==========================================
-- 7. AUDIT LOGS TABLE POLICIES
-- ==========================================

-- Only system admins can read audit logs
CREATE POLICY "system_admin_read_audit_logs"
ON audit_logs FOR SELECT
USING (is_role('system_admin'));

-- System inserts audit logs (bypass RLS with service role)
-- This is handled by backend, not frontend

-- ==========================================
-- 8. DRIVE STAGES TABLE POLICIES
-- ==========================================

-- All authenticated users can read drive stages
CREATE POLICY "authenticated_read_drive_stages"
ON drive_stages FOR SELECT
USING (auth.role() = 'authenticated');

-- Placement officer can manage drive stages
CREATE POLICY "placement_officer_manage_drive_stages"
ON drive_stages FOR ALL
USING (is_any_role(ARRAY['placement_officer', 'system_admin']));

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Run these to verify policies are working:

-- Check if functions exist
SELECT proname, prorettype 
FROM pg_proc 
WHERE proname IN ('is_admin', 'is_role', 'is_any_role');

-- Check policies on admins table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'admins';

-- Check policies on drives table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'drives';

-- ==========================================
-- IMPORTANT NOTES:
-- ==========================================
-- 1. The SECURITY DEFINER functions bypass RLS to check admin status
-- 2. This prevents infinite recursion
-- 3. Functions are safe because they only READ from admins table
-- 4. No write operations bypass RLS
-- 5. Run this script in Supabase SQL Editor
-- ==========================================
