/**
 * Bug Condition Exploration Test: Hardcoded Passwords
 * 
 * **Validates: Requirements 1.2, 2.2**
 * 
 * This test checks for hardcoded password "nmims2026" in seed script files.
 * 
 * **EXPECTED OUTCOME ON UNFIXED CODE**: Test FAILS (confirms hardcoded password in 5 files)
 * **EXPECTED OUTCOME ON FIXED CODE**: Test PASSES (confirms password read from environment)
 * 
 * Bug Condition: Seed scripts use hardcoded default password "nmims2026" in 5 different files
 * Expected Behavior: Seed scripts read password from environment variable (VITE_DEFAULT_SEED_PASSWORD)
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Bug Condition: Hardcoded Passwords', () => {
  const seedScriptFiles = [
    'src/utils/seedBatchAccounts.ts',
    'src/utils/seedRemaining20Students.ts',
    'src/utils/updateAllStudentProfiles.ts',
    'src/utils/fixAllStudentIssues.ts',
    'src/utils/completeStudentSetup.ts'
  ];

  const hardcodedPassword = 'nmims2026';

  it('should NOT contain hardcoded password "nmims2026" in seed script files', () => {
    const filesWithHardcodedPassword: string[] = [];

    for (const filePath of seedScriptFiles) {
      try {
        const fullPath = join(process.cwd(), filePath);
        const fileContent = readFileSync(fullPath, 'utf-8');
        
        // Check if the file contains the hardcoded password string literal
        // We're looking for the password as a string literal, not in comments
        const hasHardcodedPassword = fileContent.includes(`'${hardcodedPassword}'`) || 
                                     fileContent.includes(`"${hardcodedPassword}"`);
        
        if (hasHardcodedPassword) {
          filesWithHardcodedPassword.push(filePath);
        }
      } catch (error) {
        // If file doesn't exist, that's fine (might have been deleted in the fix)
        console.log(`File not found: ${filePath}`);
      }
    }

    // Test FAILS on unfixed code (files contain hardcoded password)
    // Test PASSES on fixed code (no hardcoded passwords found)
    expect(filesWithHardcodedPassword).toHaveLength(0);
    
    if (filesWithHardcodedPassword.length > 0) {
      console.log(`Found hardcoded password '${hardcodedPassword}' in ${filesWithHardcodedPassword.length} seed script files:`);
      filesWithHardcodedPassword.forEach(file => console.log(`  - ${file}`));
    }
  });

  it('should use environment variable for default password', () => {
    const filesUsingEnvVar: string[] = [];
    const filesNotUsingEnvVar: string[] = [];

    for (const filePath of seedScriptFiles) {
      try {
        const fullPath = join(process.cwd(), filePath);
        const fileContent = readFileSync(fullPath, 'utf-8');
        
        // Check if the file uses the environment variable
        const usesEnvVar = fileContent.includes('import.meta.env.VITE_DEFAULT_SEED_PASSWORD') ||
                          fileContent.includes('process.env.VITE_DEFAULT_SEED_PASSWORD');
        
        if (usesEnvVar) {
          filesUsingEnvVar.push(filePath);
        } else {
          filesNotUsingEnvVar.push(filePath);
        }
      } catch (error) {
        // If file doesn't exist, skip
        console.log(`File not found: ${filePath}`);
      }
    }

    // Test FAILS on unfixed code (files don't use environment variable)
    // Test PASSES on fixed code (all files use environment variable)
    expect(filesNotUsingEnvVar).toHaveLength(0);
    
    if (filesNotUsingEnvVar.length > 0) {
      console.log(`Files NOT using environment variable for password:`);
      filesNotUsingEnvVar.forEach(file => console.log(`  - ${file}`));
    }
  });
});
