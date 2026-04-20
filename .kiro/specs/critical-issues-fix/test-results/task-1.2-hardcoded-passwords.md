# Task 1.2: Bug Condition Exploration Test - Hardcoded Passwords

## Test Execution Date
Executed on unfixed code

## Test File
`src/tests/bug-conditions/hardcoded-passwords.test.ts`

## Test Objective
Search all seed script files for hardcoded password string "nmims2026" and verify they use environment variables instead.

## Files Checked
1. `src/utils/seedBatchAccounts.ts`
2. `src/utils/seedRemaining20Students.ts`
3. `src/utils/updateAllStudentProfiles.ts`
4. `src/utils/fixAllStudentIssues.ts`
5. `src/utils/completeStudentSetup.ts`

## Test Results

### Status: ✅ FAILED (AS EXPECTED)

The test FAILED on unfixed code, which **confirms the bug exists**.

### Findings

**Test 1: Hardcoded Password Detection**
- **Result**: FAILED
- **Found**: Hardcoded password 'nmims2026' in **5 seed script files**
- **Expected**: 0 files with hardcoded passwords
- **Actual**: 5 files with hardcoded passwords

**Test 2: Environment Variable Usage**
- **Result**: FAILED  
- **Found**: **5 files NOT using environment variable** for password
- **Expected**: All files should use `import.meta.env.VITE_DEFAULT_SEED_PASSWORD`
- **Actual**: 0 files using environment variable

### Counterexample Documentation

**Bug Confirmed**: Found hardcoded password 'nmims2026' in 5 seed script files:
1. `src/utils/seedBatchAccounts.ts` - Line 7: `const DEFAULT_PASSWORD = 'nmims2026';`
2. `src/utils/seedRemaining20Students.ts` - Line 6: `const DEFAULT_PASSWORD = 'nmims2026';`
3. `src/utils/updateAllStudentProfiles.ts` - Line 6: `const DEFAULT_PASSWORD = 'nmims2026';`
4. `src/utils/fixAllStudentIssues.ts` - Line 6: `const DEFAULT_PASSWORD = 'nmims2026';`
5. `src/utils/completeStudentSetup.ts` - Line 5: `const DEFAULT_PASSWORD = 'nmims2026';`

## Requirements Validated
- **Requirement 1.2**: WHEN seed scripts execute THEN the system uses hardcoded default password "nmims2026" in 5 different files ✅ CONFIRMED
- **Requirement 2.2**: WHEN seed scripts need a default password THEN the system SHALL read the password from an environment variable (VITE_DEFAULT_SEED_PASSWORD) ❌ NOT IMPLEMENTED (as expected on unfixed code)

## Next Steps
This test will be re-run after implementing the fix (Phase 3, Task 4) to verify the bug is resolved. The test should PASS after:
1. Adding `VITE_DEFAULT_SEED_PASSWORD` to `.env` and `.env.example`
2. Updating all 5 seed script files to use `import.meta.env.VITE_DEFAULT_SEED_PASSWORD`
3. Removing all hardcoded password string literals

## Test Methodology
This is a **bug condition exploration test** following the bugfix workflow:
- Run on UNFIXED code
- EXPECTED to FAIL (failure confirms bug exists)
- Documents counterexamples that demonstrate the bug
- Will be re-run after fix to verify resolution (should PASS)
