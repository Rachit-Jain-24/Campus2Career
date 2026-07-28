/**
 * Unit tests for Error Handler utilities
 * Tests error creation, categorisation, and user-friendly message mapping.
 */
import { describe, it, expect, vi } from 'vitest';
import {
  createAppError,
  handleApiError,
  ErrorCategory,
  type AppError,
} from '../../lib/errorHandler';

// Mock sentry to avoid side effects
vi.mock('../../lib/sentry', () => ({
  captureException: vi.fn(),
}));

describe('createAppError', () => {
  it('should create an AppError with correct category and timestamp', () => {
    const error = new Error('Something went wrong');
    const appError = createAppError(error, ErrorCategory.UNKNOWN);

    expect(appError.category).toBe('unknown');
    expect(appError.technicalMessage).toBe('Something went wrong');
    expect(appError.timestamp).toBeDefined();
    expect(new Date(appError.timestamp).toString()).not.toBe('Invalid Date');
  });

  it('should map timeout errors to QUERY_TIMEOUT user message', () => {
    const error = new Error('The query timed out after 30s');
    const appError = createAppError(error, ErrorCategory.DATABASE);

    expect(appError.userMessage).toContain('taking longer than expected');
    expect(appError.recoveryAction).toBeDefined();
  });

  it('should map network errors to FETCH_FAILED user message', () => {
    const error = new Error('Failed to fetch resource from server');
    const appError = createAppError(error, ErrorCategory.NETWORK);

    expect(appError.userMessage).toContain('Failed to load data');
  });

  it('should map invalid credentials errors', () => {
    const error = new Error('Invalid credential provided');
    const appError = createAppError(error, ErrorCategory.AUTHENTICATION);

    expect(appError.userMessage).toContain('Incorrect email');
  });

  it('should use fallback message for unknown errors', () => {
    const error = new Error('Completely random error text');
    const appError = createAppError(error, ErrorCategory.UNKNOWN, 'Custom fallback');

    expect(appError.userMessage).toBe('Custom fallback');
  });

  it('should handle non-Error thrown values', () => {
    const appError = createAppError('string error', ErrorCategory.UNKNOWN);
    expect(appError.technicalMessage).toBe('string error');
  });

  it('should handle null/undefined thrown values', () => {
    const appError = createAppError(null, ErrorCategory.UNKNOWN);
    expect(appError.technicalMessage).toBe('null');
  });

  it('should detect 404 in error message', () => {
    const error = new Error('Resource returned 404 from API');
    const appError = createAppError(error, ErrorCategory.DATABASE);

    expect(appError.userMessage).toContain('not be found');
  });
});

describe('handleApiError', () => {
  it('should return result on successful API call', async () => {
    const result = await handleApiError(
      async () => ({ data: 'test' }),
      ErrorCategory.DATABASE
    );
    expect(result).toEqual({ data: 'test' });
  });

  it('should return null and log on failed API call', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await handleApiError(
      async () => { throw new Error('DB connection failed'); },
      ErrorCategory.DATABASE,
      'Operation failed'
    );

    expect(result).toBeNull();
    consoleSpy.mockRestore();
  });
});
