/**
 * Unit tests for Environment Configuration Validator
 * Tests that env validation correctly detects missing/invalid configs.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('envConfig', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should report errors when Supabase config is missing', async () => {
    // Stub empty env values
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    vi.stubEnv('VITE_AI_BACKEND_URL', '');

    const { validateEnvironment } = await import('../../lib/envConfig');
    const result = validateEnvironment();

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some(e => e.includes('VITE_SUPABASE_URL'))).toBe(true);
  });

  it('should detect placeholder Supabase key', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'your_supabase_anon_key_here');
    vi.stubEnv('VITE_AI_BACKEND_URL', 'https://ai.example.com');

    const { validateEnvironment } = await import('../../lib/envConfig');
    const result = validateEnvironment();

    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('placeholder'))).toBe(true);
  });

  it('should detect invalid Supabase URL (trailing slash)', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co/');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'valid_key_not_placeholder');
    vi.stubEnv('VITE_AI_BACKEND_URL', 'https://ai.example.com');

    const { validateEnvironment } = await import('../../lib/envConfig');
    const result = validateEnvironment();

    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('trailing slash'))).toBe(true);
  });

  it('should pass with valid configuration', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://abc123.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid_key');
    vi.stubEnv('VITE_AI_BACKEND_URL', 'https://ai-backend.example.com');

    const { validateEnvironment } = await import('../../lib/envConfig');
    const result = validateEnvironment();

    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should return correct environment name', async () => {
    vi.stubEnv('VITE_APP_ENV', 'production');

    const { getEnvironment, isProduction } = await import('../../lib/envConfig');
    expect(getEnvironment()).toBe('production');
    // isProduction() also checks import.meta.env.PROD which vitest doesn't set
    // so we just test getEnvironment() here
  });

  it('should return rate limit defaults', async () => {
    vi.stubEnv('VITE_AI_RATE_LIMIT', '50');
    vi.stubEnv('VITE_API_RATE_LIMIT', '200');

    const { getRateLimits } = await import('../../lib/envConfig');
    const limits = getRateLimits();

    expect(limits.ai).toBe(50);
    expect(limits.api).toBe(200);
  });

  it('should fall back to default rate limits when env is empty', async () => {
    vi.stubEnv('VITE_AI_RATE_LIMIT', '');
    vi.stubEnv('VITE_API_RATE_LIMIT', '');

    const { getRateLimits } = await import('../../lib/envConfig');
    const limits = getRateLimits();

    expect(limits.ai).toBe(30);
    expect(limits.api).toBe(100);
  });
});
