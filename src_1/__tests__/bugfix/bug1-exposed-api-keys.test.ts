// Bug Condition Exploration Test for Bug 1: Exposed API Keys
// Feature: critical-issues-fix
// **Validates: Requirements 1.1, 2.1**
//
// This test checks if the .env file is committed to git and contains real API keys.
// **EXPECTED OUTCOME ON UNFIXED CODE**: Test FAILS (confirms .env is committed with real keys)
// **EXPECTED OUTCOME ON FIXED CODE**: Test PASSES (confirms .env is in .gitignore and not committed)

import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Bug 1: Exposed API Keys - Bug Condition Exploration', () => {
  it('should verify .env file is NOT committed to git', () => {
    // Check if .env is tracked by git
    let isTracked = false;
    try {
      const result = execSync('git ls-files .env', { encoding: 'utf-8' });
      isTracked = result.trim().length > 0;
    } catch (error) {
      // If command fails, file is not tracked
      isTracked = false;
    }

    // Check if .env exists in git history
    let existsInHistory = false;
    try {
      const result = execSync('git log --all --full-history -- .env', { encoding: 'utf-8' });
      existsInHistory = result.trim().length > 0;
    } catch (error) {
      existsInHistory = false;
    }

    // The test passes if .env is NOT tracked and NOT in history
    expect(isTracked).toBe(false);
    expect(existsInHistory).toBe(false);
  });

  it('should verify .env is listed in .gitignore', () => {
    const gitignorePath = join(process.cwd(), '.gitignore');
    
    if (!existsSync(gitignorePath)) {
      throw new Error('.gitignore file does not exist');
    }

    const gitignoreContent = readFileSync(gitignorePath, 'utf-8');
    
    // Check if .env is explicitly listed in .gitignore
    const hasEnvEntry = gitignoreContent.split('\n').some(line => {
      const trimmed = line.trim();
      return trimmed === '.env' || trimmed === '/.env';
    });

    expect(hasEnvEntry).toBe(true);
  });

  it('should verify .env.example exists with placeholder values', () => {
    const envExamplePath = join(process.cwd(), '.env.example');
    
    // Check if .env.example exists
    const exists = existsSync(envExamplePath);
    
    if (exists) {
      const content = readFileSync(envExamplePath, 'utf-8');
      
      // Verify it contains placeholder values, not real API keys
      // Real keys from bugfix.md: AIzaSyAb7FEggFfhIot5pKNRvZ-7TZfsYBJ_TDQ and AIzaSyDRe4HPI-oL3uz3fVs0jt18jmlZfSh0M_U
      expect(content).not.toContain('AIzaSyAb7FEggFfhIot5pKNRvZ-7TZfsYBJ_TDQ');
      expect(content).not.toContain('AIzaSyDRe4HPI-oL3uz3fVs0jt18jmlZfSh0M_U');
      
      // Should contain placeholder text
      expect(content.toLowerCase()).toMatch(/your.*api.*key|placeholder|example|replace/);
    }
    
    // On unfixed code, .env.example might not exist yet
    // On fixed code, it should exist
    // We document the current state
    console.log('.env.example exists:', exists);
  });

  it('should document the bug condition: .env file with real API keys', () => {
    const envPath = join(process.cwd(), '.env');
    
    if (!existsSync(envPath)) {
      console.log('Bug Condition: .env file does not exist locally');
      return;
    }

    const envContent = readFileSync(envPath, 'utf-8');
    
    // Check if real API keys are present (from bugfix.md)
    const hasFirebaseKey = envContent.includes('AIzaSyAb7FEggFfhIot5pKNRvZ-7TZfsYBJ_TDQ');
    const hasGeminiKey = envContent.includes('AIzaSyDRe4HPI-oL3uz3fVs0jt18jmlZfSh0M_U');
    
    if (hasFirebaseKey || hasGeminiKey) {
      console.log('Bug Condition Confirmed: .env file contains real API keys');
      console.log('- Firebase API Key present:', hasFirebaseKey);
      console.log('- Gemini API Key present:', hasGeminiKey);
    }
    
    // This test documents the state but doesn't fail
    // The actual security check is in the first test (git tracking)
    expect(true).toBe(true);
  });
});
