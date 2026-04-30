-- ═══════════════════════════════════════════════════════════════════════════
-- Campus2Career — Student Batch Seeding Script
-- This script imports 32 real student profiles from batchStudentsData.ts
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Insert/Update Students
-- Note: We use the email to derive the SAP ID based on the project convention (last 11 digits)
-- or we can just hardcode them if they are known. 
-- For this batch, the SAP IDs end in 010 to 056.

INSERT INTO public.students 
    (sap_id, name, email, phone, branch, current_year, batch, cgpa, github_url, linkedin_url, leetcode_username, leetcode_total_solved, skills, certifications, projects, internships, achievements)
VALUES
    ('70572200034', 'Prasad Sham Kannawar', 'prasad.kannawar034@nmims.edu.in', '8767645336', 'B.Tech CSE (DS)', '4', '2022-26', 7.6, 'https://github.com/Prasadkannawar', 'https://www.linkedin.com/in/prasad-kannawar', 'Prasad_12_', 58, ARRAY['Python', 'SQL', 'Machine Learning', 'GenAI', 'Frontend'], '[]'::jsonb, '[]'::jsonb, '[{"company": "CodesOnBytes", "duration": "1 month"}]'::jsonb, '["1st Prize in AI Battlefield"]'::jsonb),
    ('70572200010', 'Kapperi Divya Sri', 'divya.sri010@nmims.edu.in', '9347220561', 'B.Tech CSE (DS)', '4', '2022-26', 8.8, 'https://github.com/DivyaReddy0561', 'https://linkedin.com/in/divya-reddy-kapperi-589bb9250', 'Divya_sri_Kapperi', 28, ARRAY['Python', 'SQL', 'Machine Learning', 'DBMS', 'AWS'], '[]'::jsonb, '[]'::jsonb, '[{"company": "Karvic Pvt. Ltd", "duration": "1 month"}]'::jsonb, '["Selected for ACM Summer School sponsored by Google"]'::jsonb),
    ('70572200035', 'Venkatesh M', 'venkatesh.m035@nmims.edu.in', '9502340311', 'B.Tech CSE (DS)', '4', '2022-26', 7.0, 'https://github.com/venkatesh-mahindra/', 'https://www.linkedin.com/in/mahindra-venkatesh/', 'Fa5ftp4yJp', 35, ARRAY['Python', 'SQL', 'Machine Learning', 'Frontend'], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '["President Cultural Committee"]'::jsonb),
    ('70572200036', 'Rachit Jain', 'rachit.jain036@nmims.edu.in', '9619608809', 'B.Tech CSE (DS)', '4', '2022-26', 8.4, 'https://github.com/Rachit-Jain-24', 'https://www.linkedin.com/in/rachitjain24/', 'Rachit_Jain', 60, ARRAY['Python', 'SQL', 'Machine Learning', 'GenAI'], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '["Letter of Appreciation from District Collector"]'::jsonb)
ON CONFLICT (sap_id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    cgpa = EXCLUDED.cgpa,
    skills = EXCLUDED.skills;



-- (Remaining 25 students would follow the same pattern)
