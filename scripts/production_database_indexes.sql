-- ==========================================
-- Campus2Career - Database Indexes for Production
-- ==========================================
-- Run this script to optimize query performance
-- Execute via Supabase Dashboard → SQL Editor
-- ==========================================

-- ── STUDENTS TABLE INDEXES ───────────────────────────────────────────────────

-- Composite index for cohort queries (Peer Compass, batch analytics)
CREATE INDEX IF NOT EXISTS idx_students_year_branch 
ON students(current_year, branch);

-- Index for career track filtering
CREATE INDEX IF NOT EXISTS idx_students_career_track 
ON students(career_track);

-- Index for placement status queries
CREATE INDEX IF NOT EXISTS idx_students_placement_status 
ON students(placement_status);

-- GIN index for JSONB skill searches (skill gap analysis)
CREATE INDEX IF NOT EXISTS idx_students_tech_skills 
ON students USING GIN (tech_skills);

-- Index for CGPA-based queries (analytics, reports)
CREATE INDEX IF NOT EXISTS idx_students_cgpa 
ON students(cgpa DESC);

-- Index for batch queries
CREATE INDEX IF NOT EXISTS idx_students_batch 
ON students(batch);

-- ── DRIVES TABLE INDEXES ─────────────────────────────────────────────────────

-- Index for active drives (most common query)
CREATE INDEX IF NOT EXISTS idx_drives_status 
ON drives(status);

-- Index for company-based queries
CREATE INDEX IF NOT EXISTS idx_drives_company_id 
ON drives(company_id);

-- Composite index for active drives by company
CREATE INDEX IF NOT EXISTS idx_drives_status_company 
ON drives(status, company_id);

-- ── INTERVIEWS TABLE INDEXES ─────────────────────────────────────────────────

-- Index for student's interviews
CREATE INDEX IF NOT EXISTS idx_interviews_student_id 
ON interviews(student_id);

-- Index for drive-based queries
CREATE INDEX IF NOT EXISTS idx_interviews_drive_id 
ON interviews(drive_id);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_interviews_status 
ON interviews(status);

-- Index for scheduling queries
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_date 
ON interviews(scheduled_date);

-- ── OFFERS TABLE INDEXES ─────────────────────────────────────────────────────

-- Index for student's offers
CREATE INDEX IF NOT EXISTS idx_offers_student_id 
ON offers(student_id);

-- Index for company-based queries
CREATE INDEX IF NOT EXISTS idx_offers_company_id 
ON offers(company_id);

-- Index for drive-based queries
CREATE INDEX IF NOT EXISTS idx_offers_drive_id 
ON offers(drive_id);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_offers_status 
ON offers(status);

-- ── COMPANIES TABLE INDEXES ──────────────────────────────────────────────────

-- Index for industry filtering
CREATE INDEX IF NOT EXISTS idx_companies_industry 
ON companies(industry);

-- ── AUDIT LOGS TABLE INDEXES ─────────────────────────────────────────────────

-- Index for user-based queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id 
ON audit_logs(user_id);

-- Index for timestamp-based queries (most common)
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp 
ON audit_logs(timestamp DESC);

-- Index for action filtering
CREATE INDEX IF NOT EXISTS idx_audit_logs_action 
ON audit_logs(action);

-- Index for resource filtering
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource 
ON audit_logs(resource);

-- ── ADMINS TABLE INDEXES ─────────────────────────────────────────────────────

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_admins_role 
ON admins(role);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_admins_email 
ON admins(email);

-- ── VERIFICATION QUERIES ─────────────────────────────────────────────────────

-- List all indexes
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check index usage (after running for a few days)
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Find unused indexes (scan count = 0)
SELECT
    schemaname,
    tablename,
    indexname
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
  AND pg_relation_size(indexrelid) > 1024 * 1024; -- > 1MB
