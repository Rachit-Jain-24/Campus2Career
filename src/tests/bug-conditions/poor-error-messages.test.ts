/**
 * Bug Condition Exploration Test: Poor Error Messages
 * 
 * **Validates: Requirements 1.7, 2.7**
 * 
 * This test triggers Firestore errors in students.service.ts and verifies
 * that technical error messages are shown without user-friendly translation.
 * 
 * **EXPECTED OUTCOME ON UNFIXED CODE**: Test FAILS (confirms technical error messages shown to users)
 * **EXPECTED OUTCOME ON FIXED CODE**: Test PASSES (confirms user-friendly error messages with recovery options)
 * 
 * Bug Condition: Services throw errors with technical messages without user-friendly explanations or recovery options
 * Expected Behavior: Services catch errors, log technical details, and display user-friendly messages with actionable recovery steps
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchAllStudents } from '../../services/admin/students.service';
import { studentsDb } from '../../services/db/database.service';

vi.mock('../../services/db/database.service', () => ({
  studentsDb: {
    fetchAllStudents: vi.fn(),
  },
}));

describe('Bug Condition: Poor Error Messages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should NOT display technical error message "Failed to fetch student directory data" without user-friendly translation', async () => {
    // Simulate a Firestore error (e.g., permission denied, network error)
    const firestoreError = new Error('PERMISSION_DENIED: Missing or insufficient permissions');
    vi.mocked(studentsDb.fetchAllStudents).mockRejectedValue(firestoreError);

    let caughtError: Error | null = null;

    try {
      await fetchAllStudents();
    } catch (error) {
      caughtError = error as Error;
    }

    // Verify an error was thrown
    expect(caughtError).not.toBeNull();
    expect(caughtError).toBeInstanceOf(Error);

    if (caughtError) {
      const errorMessage = caughtError.message;

      // Check if the error message is technical (bug condition)
      const isTechnicalMessage = 
        errorMessage.includes('Failed to fetch student directory data') ||
        errorMessage.includes('PERMISSION_DENIED') ||
        errorMessage.includes('Missing or insufficient permissions') ||
        !errorMessage.includes('Please') ||
        !errorMessage.includes('try again');

      // Check if the error message is user-friendly (expected behavior)
      const isUserFriendlyMessage = 
        errorMessage.includes('Unable to load students') ||
        errorMessage.includes('Please check your connection') ||
        errorMessage.includes('try again') ||
        errorMessage.includes('recovery') ||
        errorMessage.includes('contact support');

      // Test FAILS on unfixed code (technical message shown)
      // Test PASSES on fixed code (user-friendly message shown)
      expect(isUserFriendlyMessage).toBe(true);
      expect(isTechnicalMessage).toBe(false);

      if (isTechnicalMessage && !isUserFriendlyMessage) {
        console.log(`\nBUG CONFIRMED: Technical error message displayed to user:`);
        console.log(`  Error: "${errorMessage}"`);
        console.log(`\nExpected user-friendly message like:`);
        console.log(`  "Unable to load students. Please check your connection and try again."`);
      }
    }
  });

  it('should provide actionable recovery options in error messages', async () => {
    // Simulate a network error
    const networkError = new Error('Failed to fetch');
    vi.mocked(studentsDb.fetchAllStudents).mockRejectedValue(networkError);

    let caughtError: Error | null = null;

    try {
      await fetchAllStudents();
    } catch (error) {
      caughtError = error as Error;
    }

    expect(caughtError).not.toBeNull();

    if (caughtError) {
      const errorMessage = caughtError.message;

      // Check for actionable recovery options
      const hasRecoveryOptions = 
        errorMessage.toLowerCase().includes('try again') ||
        errorMessage.toLowerCase().includes('refresh') ||
        errorMessage.toLowerCase().includes('check your connection') ||
        errorMessage.toLowerCase().includes('contact support') ||
        errorMessage.toLowerCase().includes('reload');

      // Test FAILS on unfixed code (no recovery options)
      // Test PASSES on fixed code (recovery options provided)
      expect(hasRecoveryOptions).toBe(true);

      if (!hasRecoveryOptions) {
        console.log(`\nBUG CONFIRMED: Error message lacks recovery options:`);
        console.log(`  Error: "${errorMessage}"`);
        console.log(`\nExpected recovery guidance like:`);
        console.log(`  - "Please check your connection and try again"`);
        console.log(`  - "Try refreshing the page"`);
        console.log(`  - "Contact support if the problem persists"`);
      }
    }
  });

  it('should log technical details to console while showing user-friendly message', async () => {
    // Spy on console.error to verify technical details are logged
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Simulate a Firestore error
    const technicalError = new Error('Firestore internal error: index out of bounds');
    vi.mocked(studentsDb.fetchAllStudents).mockRejectedValue(technicalError);

    let caughtError: Error | null = null;

    try {
      await fetchAllStudents();
    } catch (error) {
      caughtError = error as Error;
    }

    // Verify technical error was logged to console
    expect(consoleErrorSpy).toHaveBeenCalled();

    // Verify the error message shown to user is NOT the technical message
    if (caughtError) {
      const userMessage = caughtError.message;
      const technicalMessage = technicalError.message;

      // User message should be different from technical message
      expect(userMessage).not.toBe(technicalMessage);

      const isUserFriendly = 
        !userMessage.includes('internal error') &&
        !userMessage.includes('index out of bounds') &&
        (userMessage.includes('Unable to load') || 
         userMessage.includes('Please') ||
         userMessage.includes('try again'));

      // Test FAILS on unfixed code (technical message shown to user)
      // Test PASSES on fixed code (user-friendly message shown, technical logged)
      expect(isUserFriendly).toBe(true);

      if (!isUserFriendly) {
        console.log(`\nBUG CONFIRMED: Technical error exposed to user:`);
        console.log(`  User sees: "${userMessage}"`);
        console.log(`  Should see: "Unable to load students. Please check your connection and try again."`);
        console.log(`  Technical details should only be in console logs`);
      }
    }

    consoleErrorSpy.mockRestore();
  });
});
