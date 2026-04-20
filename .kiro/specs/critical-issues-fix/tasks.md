# Implementation Plan

## Phase 1: Bug Condition Exploration Tests

- [ ] 1. Write bug condition exploration tests for all 7 critical issues
  - **Property 1: Bug Condition** - Security, Data Integrity, Performance, and Error Handling Issues
  - **CRITICAL**: These tests MUST FAIL on unfixed code - failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior - they will validate the fixes when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate each bug exists
  - **Scoped PBT Approach**: Test concrete failing cases for each of the 7 bugs

  - [x] 1.1 Test Bug 1: Exposed API Keys
    - Check if `.env` file exists in git history
    - Verify `.env` contains real API keys (VITE_FIREBASE_API_KEY, VITE_GEMINI_API_KEY)
    - Run on UNFIXED code
    - **EXPECTED OUTCOME**: Test FAILS (confirms .env is committed with real keys)
    - Document: ".env file found in git with exposed Firebase and Gemini API keys"
    - _Requirements: 1.1, 2.1_

  - [x] 1.2 Test Bug 2: Hardcoded Passwords
    - Search all seed script files for hardcoded password string "nmims2026"
    - Check files: seedBatchAccounts.ts, seedRemaining20Students.ts, updateAllStudentProfiles.ts, fixAllStudentIssues.ts, completeStudentSetup.ts
    - Run on UNFIXED code
    - **EXPECTED OUTCOME**: Test FAILS (confirms hardcoded password in 5 files)
    - Document: "Found hardcoded password 'nmims2026' in 5 seed script files"
    - _Requirements: 1.2, 2.2_

  - [x] 1.3 Test Bug 3: Duplicate Data Files
    - Count student data files in `src/data/` directory
    - List all files: batchStudentsData.ts, batchStudents.ts, completeBatchStudentsData.ts, updatedBatchStudentsData.ts, all30StudentsData.json, remaining20StudentsData.json, students17to25.json, students22to32.json, students30to32.json
    - Run on UNFIXED code
    - **EXPECTED OUTCOME**: Test FAILS (confirms 8 duplicate files exist, should be only 1)
    - Document: "Found 8 student data files when only 1 should exist (batchStudentsData.ts)"
    - _Requirements: 1.3, 2.3_

  - [ ] 1.4 Test Bug 4: Missing Pagination
    - Call `fetchAllStudents()` from students.service.ts
    - Measure: Check if function loads entire collection without limit
    - Verify query does not use Firestore `limit()` or `startAfter()` cursors
    - Run on UNFIXED code
    - **EXPECTED OUTCOME**: Test FAILS (confirms no pagination, loads all students)
    - Document: "fetchAllStudents() loads entire collection into memory without pagination"
    - _Requirements: 1.4, 2.4_

  - [ ] 1.5 Test Bug 5: Client-Side Filtering
    - Monitor Firestore network requests when filtering students
    - Apply filter (e.g., department = "CSE") and check if new Firestore query is made
    - Verify filtering happens in memory after initial fetch
    - Run on UNFIXED code
    - **EXPECTED OUTCOME**: Test FAILS (confirms client-side filtering, no server-side where clauses)
    - Document: "Filtering students makes no additional Firestore requests, all filtering done client-side"
    - _Requirements: 1.5, 2.5_

  - [ ] 1.6 Test Bug 6: Single Error Boundary
    - Trigger error in admin student page component
    - Observe if entire application crashes or only student section fails
    - Check if only one ErrorBoundary exists at root level
    - Run on UNFIXED code
    - **EXPECTED OUTCOME**: Test FAILS (confirms entire app crashes, no granular error boundaries)
    - Document: "Error in student table crashes entire admin dashboard, no component-level isolation"
    - _Requirements: 1.6, 2.6_

  - [x] 1.7 Test Bug 7: Poor Error Messages
    - Trigger Firestore error in students.service.ts
    - Capture error message displayed to user
    - Verify if technical error message shown without user-friendly translation
    - Run on UNFIXED code
    - **EXPECTED OUTCOME**: Test FAILS (confirms technical error messages shown to users)
    - Document: "Service errors display technical message 'Failed to fetch student directory data' without recovery options"
    - _Requirements: 1.7, 2.7_

## Phase 2: Preservation Property Tests

- [ ] 2. Write preservation property tests (BEFORE implementing fixes)
  - **Property 2: Preservation** - Existing Functionality Must Remain Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (confirms baseline behavior to preserve)

  - [x] 2.1 Test Preservation: Firebase Configuration
    - Observe: Firebase initializes with VITE_ prefixed environment variables on unfixed code
    - Write property test: Firebase config structure remains unchanged after .env changes
    - Verify test passes on UNFIXED code
    - _Requirements: 3.1_

  - [ ] 2.2 Test Preservation: Student Profile Structure
    - Observe: Seed scripts generate SAP IDs, roll numbers, user profiles with specific data structure on unfixed code
    - Write property test: Student profiles maintain same fields (sapId, rollNo, name, email, cgpa, skills, projects, etc.) after password changes
    - Verify test passes on UNFIXED code
    - _Requirements: 3.2_

  - [ ] 2.3 Test Preservation: Batch Student Data Format
    - Observe: batchStudentsData.ts provides BatchStudentData interface with 32 students on unfixed code
    - Write property test: Data format and interface remain identical after file consolidation
    - Verify test passes on UNFIXED code
    - _Requirements: 3.3_

  - [ ] 2.4 Test Preservation: Admin Student Detail Views
    - Observe: Admin views display all student information fields on unfixed code
    - Write property test: All fields (SAP ID, name, email, CGPA, skills, projects) continue to display after pagination changes
    - Verify test passes on UNFIXED code
    - _Requirements: 3.4_

  - [ ] 2.5 Test Preservation: Firestore Query Compatibility
    - Observe: Queries use 'students' collection with existing document structure on unfixed code
    - Write property test: Non-paginated queries (single document fetches) work identically after pagination implementation
    - Verify test passes on UNFIXED code
    - _Requirements: 3.5_

  - [ ] 2.6 Test Preservation: Error Logging
    - Observe: ErrorBoundary logs errors to console on unfixed code
    - Write property test: Console logging continues after granular error boundaries added
    - Verify test passes on UNFIXED code
    - _Requirements: 3.6_

  - [ ] 2.7 Test Preservation: Development Mode
    - Observe: Application runs with local .env file in development on unfixed code
    - Write property test: Dev mode continues working after .gitignore changes
    - Verify test passes on UNFIXED code
    - _Requirements: 3.7_

## Phase 3: Implementation

- [ ] 3. Fix Issue 1: Exposed API Keys

  - [ ] 3.1 Update .gitignore to prevent .env commits
    - Verify `.env` is listed in `.gitignore` (add if missing)
    - Ensure `.env.example` is NOT in `.gitignore`
    - _Bug_Condition: .env file committed to git with real API keys_
    - _Expected_Behavior: .env in .gitignore, only .env.example committed_
    - _Preservation: Firebase configuration structure unchanged (3.1)_
    - _Requirements: 1.1, 2.1, 3.1_

  - [ ] 3.2 Create .env.example template file
    - Copy `.env` structure with placeholder values
    - Replace `VITE_FIREBASE_API_KEY` with `your_firebase_api_key_here`
    - Replace `VITE_GEMINI_API_KEY` with `your_gemini_api_key_here`
    - Add comments explaining where to get each key
    - _Bug_Condition: No template file for developers to reference_
    - _Expected_Behavior: .env.example provides template with placeholders_
    - _Preservation: Firebase configuration structure unchanged (3.1)_
    - _Requirements: 2.1, 3.1_

  - [ ] 3.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - API Keys Secured
    - **IMPORTANT**: Re-run the SAME test from task 1.1 - do NOT write a new test
    - Run test: Check .env is in .gitignore and .env.example has placeholders
    - **EXPECTED OUTCOME**: Test PASSES (confirms API keys are secured)
    - _Requirements: 2.1_

- [ ] 4. Fix Issue 2: Hardcoded Passwords

  - [ ] 4.1 Add seed password to .env
    - Add `VITE_DEFAULT_SEED_PASSWORD=nmims2026` to local `.env` file
    - Add `VITE_DEFAULT_SEED_PASSWORD=your_default_password_here` to `.env.example`
    - _Bug_Condition: Password hardcoded in 5 seed script files_
    - _Expected_Behavior: Password read from environment variable_
    - _Preservation: Seed scripts generate same data structure (3.2)_
    - _Requirements: 1.2, 2.2, 3.2_

  - [ ] 4.2 Update seedBatchAccounts.ts
    - Replace `const DEFAULT_PASSWORD = 'nmims2026'` with `const DEFAULT_PASSWORD = import.meta.env.VITE_DEFAULT_SEED_PASSWORD || 'fallback_password'`
    - Add validation to ensure password is set
    - _Bug_Condition: Hardcoded password in seedBatchAccounts.ts_
    - _Expected_Behavior: Read from environment variable_
    - _Preservation: Student profile structure unchanged (3.2)_
    - _Requirements: 1.2, 2.2, 3.2_

  - [ ] 4.3 Update seedRemaining20Students.ts
    - Replace hardcoded password with `import.meta.env.VITE_DEFAULT_SEED_PASSWORD`
    - _Bug_Condition: Hardcoded password in seedRemaining20Students.ts_
    - _Expected_Behavior: Read from environment variable_
    - _Preservation: Student profile structure unchanged (3.2)_
    - _Requirements: 1.2, 2.2, 3.2_

  - [ ] 4.4 Update updateAllStudentProfiles.ts
    - Replace hardcoded password with `import.meta.env.VITE_DEFAULT_SEED_PASSWORD`
    - _Bug_Condition: Hardcoded password in updateAllStudentProfiles.ts_
    - _Expected_Behavior: Read from environment variable_
    - _Preservation: Student profile structure unchanged (3.2)_
    - _Requirements: 1.2, 2.2, 3.2_

  - [ ] 4.5 Update fixAllStudentIssues.ts
    - Replace hardcoded password with `import.meta.env.VITE_DEFAULT_SEED_PASSWORD`
    - _Bug_Condition: Hardcoded password in fixAllStudentIssues.ts_
    - _Expected_Behavior: Read from environment variable_
    - _Preservation: Student profile structure unchanged (3.2)_
    - _Requirements: 1.2, 2.2, 3.2_

  - [ ] 4.6 Update completeStudentSetup.ts
    - Replace hardcoded password with `import.meta.env.VITE_DEFAULT_SEED_PASSWORD`
    - _Bug_Condition: Hardcoded password in completeStudentSetup.ts_
    - _Expected_Behavior: Read from environment variable_
    - _Preservation: Student profile structure unchanged (3.2)_
    - _Requirements: 1.2, 2.2, 3.2_

  - [ ] 4.7 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Passwords from Environment
    - **IMPORTANT**: Re-run the SAME test from task 1.2 - do NOT write a new test
    - Run test: Search all seed scripts for hardcoded password string
    - **EXPECTED OUTCOME**: Test PASSES (confirms no hardcoded passwords)
    - _Requirements: 2.2_

- [ ] 5. Fix Issue 3: Duplicate Data Files

  - [ ] 5.1 Delete duplicate student data files
    - Delete `src/data/batchStudents.ts`
    - Delete `src/data/completeBatchStudentsData.ts`
    - Delete `src/data/updatedBatchStudentsData.ts`
    - Delete `src/data/all30StudentsData.json`
    - Delete `src/data/remaining20StudentsData.json`
    - Delete `src/data/students17to25.json`
    - Delete `src/data/students22to32.json`
    - Delete `src/data/students30to32.json`
    - Keep only `src/data/batchStudentsData.ts` as single source of truth
    - _Bug_Condition: 8 duplicate student data files exist_
    - _Expected_Behavior: Single authoritative file batchStudentsData.ts_
    - _Preservation: Batch student data format unchanged (3.3)_
    - _Requirements: 1.3, 2.3, 3.3_

  - [ ] 5.2 Update imports to reference batchStudentsData.ts
    - Search codebase for imports of deleted files
    - Update all imports to use `import { batchStudentsData } from '../data/batchStudentsData'`
    - Verify no broken imports remain
    - _Bug_Condition: Multiple files importing different data sources_
    - _Expected_Behavior: All imports reference single source file_
    - _Preservation: Data format and interface unchanged (3.3)_
    - _Requirements: 2.3, 3.3_

  - [ ] 5.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Single Data Source
    - **IMPORTANT**: Re-run the SAME test from task 1.3 - do NOT write a new test
    - Run test: Count student data files in src/data/ directory
    - **EXPECTED OUTCOME**: Test PASSES (confirms only 1 file exists)
    - _Requirements: 2.3_

- [ ] 6. Fix Issue 4: Missing Pagination

  - [ ] 6.1 Implement fetchStudentsPaginated function
    - Rename `fetchAllStudents` to `fetchStudentsPaginated`
    - Add parameters: `pageSize: number = 20, lastDoc?: DocumentSnapshot`
    - Implement Firestore pagination with `limit(pageSize)` and `startAfter(lastDoc)`
    - Query: `query(studentsRef, orderBy('createdAt', 'desc'), limit(pageSize), ...(lastDoc ? [startAfter(lastDoc)] : []))`
    - Return object: `{ students: AdminStudentProfile[], lastDoc: DocumentSnapshot | null, hasMore: boolean }`
    - _Bug_Condition: fetchAllStudents loads entire collection without limit_
    - _Expected_Behavior: Paginated function loads students in batches of 20-50_
    - _Preservation: Student detail views unchanged (3.4), Firestore compatibility maintained (3.5)_
    - _Requirements: 1.4, 2.4, 3.4, 3.5_

  - [ ] 6.2 Update StudentsPage to use pagination
    - Import `fetchStudentsPaginated` instead of `fetchAllStudents`
    - Add state for current page and last document cursor
    - Implement pagination UI controls (Previous, Next, Page X of Y)
    - Call `fetchStudentsPaginated` with cursor for next/previous page
    - _Bug_Condition: Student page loads all students at once_
    - _Expected_Behavior: Page loads students in batches with navigation controls_
    - _Preservation: Student detail views unchanged (3.4)_
    - _Requirements: 2.4, 3.4_

  - [ ] 6.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Pagination Implemented
    - **IMPORTANT**: Re-run the SAME test from task 1.4 - do NOT write a new test
    - Run test: Call fetchStudentsPaginated and verify it uses limit() and returns max 20 students
    - **EXPECTED OUTCOME**: Test PASSES (confirms pagination is implemented)
    - _Requirements: 2.4_

- [ ] 7. Fix Issue 5: Client-Side Filtering

  - [ ] 7.1 Implement fetchStudentsFiltered function
    - Create new function: `fetchStudentsFiltered(filters: StudentFilters, pageSize: number, lastDoc?: DocumentSnapshot)`
    - Accept filter object: `{ department?: string, year?: number, placementStatus?: string, minCGPA?: number }`
    - Build Firestore query with `where()` clauses for each filter
    - Combine with pagination: `query(studentsRef, ...whereConditions, orderBy('createdAt', 'desc'), limit(pageSize), ...(lastDoc ? [startAfter(lastDoc)] : []))`
    - Return same structure as fetchStudentsPaginated
    - _Bug_Condition: Filtering loads all data and filters client-side_
    - _Expected_Behavior: Server-side filtering with Firestore where clauses_
    - _Preservation: Student detail views unchanged (3.4), Firestore compatibility maintained (3.5)_
    - _Requirements: 1.5, 2.5, 3.4, 3.5_

  - [ ] 7.2 Update StudentsPage to use server-side filtering
    - Replace client-side filter logic with calls to `fetchStudentsFiltered`
    - When filters change, call `fetchStudentsFiltered` with filter object
    - Reset to page 1 when filters change
    - Remove client-side array filtering code
    - _Bug_Condition: Filters applied in memory after fetching all data_
    - _Expected_Behavior: Filters trigger new Firestore query_
    - _Preservation: Student detail views unchanged (3.4)_
    - _Requirements: 2.5, 3.4_

  - [ ] 7.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Server-Side Filtering
    - **IMPORTANT**: Re-run the SAME test from task 1.5 - do NOT write a new test
    - Run test: Apply filter and verify new Firestore request with where() clause is made
    - **EXPECTED OUTCOME**: Test PASSES (confirms server-side filtering)
    - _Requirements: 2.5_

- [ ] 8. Fix Issue 6: Single Error Boundary

  - [ ] 8.1 Create AdminErrorBoundary component
    - Create new file: `src/components/admin/AdminErrorBoundary.tsx`
    - Copy from `src/components/ErrorBoundary.tsx` and customize for admin sections
    - Accept `section` prop (e.g., "students", "drives", "companies")
    - Display section-specific error message: "Unable to load {section}. Please try again."
    - Add "Go Back" button instead of full page reload
    - Use smaller, inline error UI instead of full-screen
    - _Bug_Condition: Only one ErrorBoundary at root level_
    - _Expected_Behavior: Granular ErrorBoundary for each admin section_
    - _Preservation: Error logging to console maintained (3.6)_
    - _Requirements: 1.6, 2.6, 3.6_

  - [ ] 8.2 Wrap StudentsPage with AdminErrorBoundary
    - Import AdminErrorBoundary in StudentsPage
    - Wrap student table component: `<AdminErrorBoundary section="students"><StudentTable /></AdminErrorBoundary>`
    - _Bug_Condition: Error in student page crashes entire app_
    - _Expected_Behavior: Error isolated to student section_
    - _Preservation: Student detail views unchanged (3.4)_
    - _Requirements: 2.6, 3.4_

  - [ ] 8.3 Wrap DrivesPage with AdminErrorBoundary
    - Wrap drives component: `<AdminErrorBoundary section="drives"><DrivesContent /></AdminErrorBoundary>`
    - _Bug_Condition: Error in drives page crashes entire app_
    - _Expected_Behavior: Error isolated to drives section_
    - _Requirements: 2.6_

  - [ ] 8.4 Wrap CompaniesPage with AdminErrorBoundary
    - Wrap companies component: `<AdminErrorBoundary section="companies"><CompaniesContent /></AdminErrorBoundary>`
    - _Bug_Condition: Error in companies page crashes entire app_
    - _Expected_Behavior: Error isolated to companies section_
    - _Requirements: 2.6_

  - [ ] 8.5 Wrap InterviewsPage with AdminErrorBoundary
    - Wrap interviews component: `<AdminErrorBoundary section="interviews"><InterviewsContent /></AdminErrorBoundary>`
    - _Bug_Condition: Error in interviews page crashes entire app_
    - _Expected_Behavior: Error isolated to interviews section_
    - _Requirements: 2.6_

  - [ ] 8.6 Wrap OffersPage with AdminErrorBoundary
    - Wrap offers component: `<AdminErrorBoundary section="offers"><OffersContent /></AdminErrorBoundary>`
    - _Bug_Condition: Error in offers page crashes entire app_
    - _Expected_Behavior: Error isolated to offers section_
    - _Requirements: 2.6_

  - [ ] 8.7 Wrap SettingsPage with AdminErrorBoundary
    - Wrap settings component: `<AdminErrorBoundary section="settings"><SettingsContent /></AdminErrorBoundary>`
    - _Bug_Condition: Error in settings page crashes entire app_
    - _Expected_Behavior: Error isolated to settings section_
    - _Requirements: 2.6_

  - [ ] 8.8 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Granular Error Boundaries
    - **IMPORTANT**: Re-run the SAME test from task 1.6 - do NOT write a new test
    - Run test: Trigger error in student page and verify only student section fails
    - **EXPECTED OUTCOME**: Test PASSES (confirms error isolation)
    - _Requirements: 2.6_

- [ ] 9. Fix Issue 7: Poor Error Messages

  - [ ] 9.1 Create error handling utility
    - Create new file: `src/utils/errorHandler.ts`
    - Implement function: `handleServiceError(error: unknown, userMessage: string)`
    - Log technical error to console with full details
    - Extract Firebase error codes and translate to friendly messages
    - Return formatted user-friendly error object
    - _Bug_Condition: Services throw technical errors directly_
    - _Expected_Behavior: Utility translates errors to user-friendly messages_
    - _Preservation: Error logging maintained (3.6)_
    - _Requirements: 1.7, 2.7, 3.6_

  - [ ] 9.2 Update students.service.ts error handling
    - Import `handleServiceError` utility
    - Wrap service calls in try-catch blocks
    - Catch technical errors and log to console
    - Throw user-friendly error: `throw handleServiceError(error, 'Unable to load students. Please check your connection and try again.')`
    - _Bug_Condition: students.service throws 'Failed to fetch student directory data'_
    - _Expected_Behavior: User-friendly message with recovery options_
    - _Preservation: Firestore query compatibility maintained (3.5)_
    - _Requirements: 1.7, 2.7, 3.5_

  - [ ] 9.3 Update drives.service.ts error handling
    - Apply same error handling pattern as students.service
    - Use message: 'Unable to load placement drives. Please check your connection and try again.'
    - _Bug_Condition: drives.service throws technical errors_
    - _Expected_Behavior: User-friendly message with recovery options_
    - _Requirements: 2.7_

  - [ ] 9.4 Update companies.service.ts error handling
    - Apply same error handling pattern
    - Use message: 'Unable to load companies. Please check your connection and try again.'
    - _Bug_Condition: companies.service throws technical errors_
    - _Expected_Behavior: User-friendly message with recovery options_
    - _Requirements: 2.7_

  - [ ] 9.5 Update interviews.service.ts error handling
    - Apply same error handling pattern
    - Use message: 'Unable to load interviews. Please check your connection and try again.'
    - _Bug_Condition: interviews.service throws technical errors_
    - _Expected_Behavior: User-friendly message with recovery options_
    - _Requirements: 2.7_

  - [ ] 9.6 Update offers.service.ts error handling
    - Apply same error handling pattern
    - Use message: 'Unable to load offers. Please check your connection and try again.'
    - _Bug_Condition: offers.service throws technical errors_
    - _Expected_Behavior: User-friendly message with recovery options_
    - _Requirements: 2.7_

  - [ ] 9.7 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - User-Friendly Error Messages
    - **IMPORTANT**: Re-run the SAME test from task 1.7 - do NOT write a new test
    - Run test: Trigger service error and verify user-friendly message is displayed
    - **EXPECTED OUTCOME**: Test PASSES (confirms friendly error messages)
    - _Requirements: 2.7_

- [ ] 10. Verify preservation tests still pass
  - **Property 2: Preservation** - Existing Functionality Unchanged
  - **IMPORTANT**: Re-run the SAME tests from Phase 2 - do NOT write new tests
  - Run all preservation tests from task 2
  - **EXPECTED OUTCOME**: All tests PASS (confirms no regressions)
  - Verify Firebase configuration unchanged (test 2.1)
  - Verify student profile structure unchanged (test 2.2)
  - Verify batch student data format unchanged (test 2.3)
  - Verify admin student detail views unchanged (test 2.4)
  - Verify Firestore query compatibility unchanged (test 2.5)
  - Verify error logging unchanged (test 2.6)
  - Verify development mode unchanged (test 2.7)

## Phase 4: Final Validation

- [ ] 11. Checkpoint - Ensure all tests pass
  - Run all bug condition exploration tests (tasks 1.1-1.7) - all should PASS
  - Run all preservation tests (tasks 2.1-2.7) - all should PASS
  - Verify no TypeScript errors with `npm run type-check`
  - Verify no linting errors with `npm run lint`
  - Test end-to-end: Clone repo, setup .env from .env.example, run seed scripts, load admin pages
  - Verify pagination works with 100+ students
  - Verify filtering makes server-side requests
  - Verify error boundaries isolate failures
  - Verify user-friendly error messages display
  - Ask user if any questions or issues arise
