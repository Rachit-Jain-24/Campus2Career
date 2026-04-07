/**
 * Bug Condition Exploration Test: Duplicate Data Files
 * 
 * **Validates: Requirements 1.3, 2.3**
 * 
 * This test checks for duplicate student data files in src/data/ directory.
 * 
 * **EXPECTED OUTCOME ON UNFIXED CODE**: Test FAILS (confirms 8 duplicate files exist)
 * **EXPECTED OUTCOME ON FIXED CODE**: Test PASSES (confirms only 1 file exists)
 * 
 * Bug Condition: 8 duplicate student data files exist with no clear source of truth
 * Expected Behavior: Single authoritative file batchStudentsData.ts
 */

import { describe, it, expect } from 'vitest';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

describe('Bug Condition: Duplicate Data Files', () => {
  const dataDirectory = 'src/data';
  
  // List of all student data files that should be checked
  const expectedDuplicateFiles = [
    'batchStudents.ts',
    'completeBatchStudentsData.ts',
    'updatedBatchStudentsData.ts',
    'all30StudentsData.json',
    'remaining20StudentsData.json',
    'students17to25.json',
    'students22to32.json',
    'students30to32.json'
  ];

  const authoritative = 'batchStudentsData.ts';

  it('should have only ONE student data file (batchStudentsData.ts)', () => {
    const dataPath = join(process.cwd(), dataDirectory);
    
    // Get all files in the data directory (excluding subdirectories)
    const allFiles = readdirSync(dataPath).filter(file => {
      const fullPath = join(dataPath, file);
      return statSync(fullPath).isFile();
    });

    // Filter for student data files (files that match the pattern of student data)
    const studentDataFiles = allFiles.filter(file => {
      // Check if it's one of the known student data files
      return file === authoritative || expectedDuplicateFiles.includes(file);
    });

    // Count duplicate files found
    const duplicatesFound = studentDataFiles.filter(file => file !== authoritative);

    // Test FAILS on unfixed code (8 duplicate files exist)
    // Test PASSES on fixed code (only batchStudentsData.ts exists)
    expect(studentDataFiles).toHaveLength(1);
    expect(studentDataFiles).toContain(authoritative);
    expect(duplicatesFound).toHaveLength(0);

    if (duplicatesFound.length > 0) {
      console.log(`Found ${duplicatesFound.length} duplicate student data files (should be 0):`);
      duplicatesFound.forEach(file => console.log(`  - ${file}`));
      console.log(`\nOnly ${authoritative} should exist as the single source of truth.`);
    }
  });

  it('should NOT have any of the known duplicate files', () => {
    const dataPath = join(process.cwd(), dataDirectory);
    
    const allFiles = readdirSync(dataPath).filter(file => {
      const fullPath = join(dataPath, file);
      return statSync(fullPath).isFile();
    });

    // Check which duplicate files exist
    const existingDuplicates = expectedDuplicateFiles.filter(file => 
      allFiles.includes(file)
    );

    // Test FAILS on unfixed code (duplicate files exist)
    // Test PASSES on fixed code (no duplicate files)
    expect(existingDuplicates).toHaveLength(0);

    if (existingDuplicates.length > 0) {
      console.log(`Found ${existingDuplicates.length} duplicate files that should be deleted:`);
      existingDuplicates.forEach(file => console.log(`  - ${dataDirectory}/${file}`));
    }
  });

  it('should have batchStudentsData.ts as the authoritative source', () => {
    const dataPath = join(process.cwd(), dataDirectory);
    const allFiles = readdirSync(dataPath);

    // Verify the authoritative file exists
    expect(allFiles).toContain(authoritative);
  });
});
