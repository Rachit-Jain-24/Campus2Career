-- Curriculum Knowledge Base Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS curriculum_subjects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch        TEXT NOT NULL,
  batch         TEXT NOT NULL,
  semester      INT  NOT NULL CHECK (semester BETWEEN 1 AND 8),
  subject_code  TEXT DEFAULT '',
  subject_name  TEXT NOT NULL,
  description   TEXT DEFAULT '',
  topics        JSONB DEFAULT '[]',
  industry_skills JSONB DEFAULT '[]',
  industry_relevance TEXT DEFAULT 'medium' CHECK (industry_relevance IN ('high', 'medium', 'low')),
  is_active     BOOLEAN DEFAULT TRUE,
  pdf_url       TEXT,
  uploaded_by   TEXT DEFAULT 'Program Chair',
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast roadmap queries
CREATE INDEX IF NOT EXISTS idx_curriculum_subjects_lookup
  ON curriculum_subjects (branch, batch, is_active, semester);

-- RLS: only admins can write; all authenticated users can read
ALTER TABLE curriculum_subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "curriculum_subjects_read" ON curriculum_subjects
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "curriculum_subjects_write" ON curriculum_subjects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.email = auth.email())
  );
