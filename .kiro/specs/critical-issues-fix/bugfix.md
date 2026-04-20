# Bugfix Requirements Document

## Introduction

The Campus2Career placement management system has four critical issues that pose security risks, data integrity problems, and performance degradation. These issues affect the production deployment, data consistency, admin user experience, and error recovery capabilities of the system.

**Impact:**
- Security: Exposed API keys allow unauthorized access to Firebase and Gemini AI services
- Data Integrity: Multiple duplicate student data files create confusion about the source of truth
- Performance: Admin student list becomes unusable with large datasets due to lack of pagination
- User Experience: Poor error handling leads to application crashes without user-friendly recovery

**Affected Components:**
- Environment configuration (.env file)
- Student data files (src/data/*.ts, src/data/*.json)
- Admin student service (src/services/admin/students.service.ts)
- Seed scripts (src/utils/*.ts)
- Error boundaries (root level only)

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the .env file is committed to the git repository THEN the system exposes Firebase API keys (VITE_FIREBASE_API_KEY: AIzaSyAb7FEggFfhIot5pKNRvZ-7TZfsYBJ_TDQ) and Gemini API key (VITE_GEMINI_API_KEY: AIzaSyDRe4HPI-oL3uz3fVs0jt18jmlZfSh0M_U) publicly

1.2 WHEN seed scripts execute THEN the system uses hardcoded default password "nmims2026" in 5 different files (seedBatchAccounts.ts, seedRemaining20Students.ts, updateAllStudentProfiles.ts, fixAllStudentIssues.ts, completeStudentSetup.ts)

1.3 WHEN student data is needed THEN the system has 8 duplicate data files (batchStudentsData.ts, batchStudents.ts, completeBatchStudentsData.ts, updatedBatchStudentsData.ts, all30StudentsData.json, remaining20StudentsData.json, students17to25.json, students22to32.json, students30to32.json) with no clear source of truth

1.4 WHEN admin loads the student directory THEN the system calls fetchAllStudents() which loads the entire students collection into memory without pagination or limit

1.5 WHEN admin student list renders with 100+ students THEN the system performs client-side filtering and sorting causing UI lag and poor performance

1.6 WHEN an error occurs in admin pages THEN the system only has one ErrorBoundary at root level, causing entire application to crash instead of isolated component failure

1.7 WHEN services throw errors THEN the system displays technical error messages without user-friendly explanations or recovery options

### Expected Behavior (Correct)

2.1 WHEN the application needs API credentials THEN the system SHALL use environment variables that are NOT committed to git, with .env listed in .gitignore and .env.example provided as a template

2.2 WHEN seed scripts need a default password THEN the system SHALL read the password from an environment variable (VITE_DEFAULT_SEED_PASSWORD) instead of hardcoding it in source files

2.3 WHEN student data is needed THEN the system SHALL use a single authoritative data file (batchStudentsData.ts) and remove all duplicate/outdated data files

2.4 WHEN admin loads the student directory THEN the system SHALL implement server-side pagination using Firestore query limits and startAfter cursors to load students in batches of 20-50

2.5 WHEN admin applies filters or sorting THEN the system SHALL perform server-side filtering using Firestore where clauses instead of loading all data and filtering client-side

2.6 WHEN an error occurs in admin components THEN the system SHALL have granular ErrorBoundary components wrapping each major admin section (students, drives, companies, etc.) to prevent full application crashes

2.7 WHEN services throw errors THEN the system SHALL catch errors, log technical details, and display user-friendly messages with actionable recovery steps

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the application initializes Firebase THEN the system SHALL CONTINUE TO use the same Firebase configuration structure with VITE_ prefixed environment variables

3.2 WHEN seed scripts create student accounts THEN the system SHALL CONTINUE TO generate SAP IDs, roll numbers, and user profiles with the same data structure

3.3 WHEN batchStudentsData.ts is used THEN the system SHALL CONTINUE TO provide the same BatchStudentData interface and data format for the 32 NMIMS students

3.4 WHEN admin views student details THEN the system SHALL CONTINUE TO display all student information fields (SAP ID, name, email, CGPA, skills, projects, etc.)

3.5 WHEN Firestore queries execute THEN the system SHALL CONTINUE TO use the 'students' collection and maintain backward compatibility with existing documents

3.6 WHEN errors are caught by ErrorBoundary THEN the system SHALL CONTINUE TO log errors to console for debugging purposes

3.7 WHEN the application runs in development mode THEN the system SHALL CONTINUE TO work with local environment variables from .env file
