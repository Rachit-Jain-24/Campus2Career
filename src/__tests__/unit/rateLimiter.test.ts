/**
 * Unit tests for RateLimiter
 * Tests client-side rate limiting logic: registration, window sliding, reset.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage before importing the module
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// Import after mocking
import { rateLimiter } from '../../lib/rateLimiter';

describe('RateLimiter', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    rateLimiter.resetAll();
  });

  it('should allow requests under the limit', () => {
    // ai limit is 30/minute — first request should always pass
    const result = rateLimiter.isAllowed('ai');
    expect(result.allowed).toBe(true);
    expect(result.retryAfter).toBeUndefined();
  });

  it('should store request timestamps in localStorage', () => {
    rateLimiter.isAllowed('ai');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'rate_limit_ai',
      expect.any(String)
    );
  });

  it('should return allowed: true for unregistered keys', () => {
    const result = rateLimiter.isAllowed('nonexistent_key');
    expect(result.allowed).toBe(true);
  });

  it('should block requests exceeding the limit', () => {
    // upload limit is 10/minute — exhaust it
    for (let i = 0; i < 10; i++) {
      rateLimiter.isAllowed('upload');
    }
    const result = rateLimiter.isAllowed('upload');
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
    expect(result.retryAfter).toBeLessThanOrEqual(60);
  });

  it('should reset a specific rate limit', () => {
    // Exhaust ai limit partially
    for (let i = 0; i < 5; i++) {
      rateLimiter.isAllowed('ai');
    }
    rateLimiter.reset('ai');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('rate_limit_ai');
  });

  it('should execute function when under limit', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await rateLimiter.execute('api', fn);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledOnce();
  });

  it('should throw when over limit via execute()', async () => {
    // Exhaust upload limit (10 requests)
    for (let i = 0; i < 10; i++) {
      await rateLimiter.execute('upload', async () => 'ok');
    }
    await expect(
      rateLimiter.execute('upload', async () => 'should not run')
    ).rejects.toThrow('Rate limit exceeded');
  });
});
