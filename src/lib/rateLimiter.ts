/**
 * Client-Side Rate Limiter
 * 
 * Prevents API abuse by limiting request frequency.
 * Works with localStorage for persistence across page reloads.
 */

interface RateLimiterConfig {
  maxRequests: number;
  windowMs: number;
  key: string;
}

class RateLimiter {
  private limits: Map<string, RateLimiterConfig>;

  constructor() {
    this.limits = new Map();
  }

  /**
   * Register a rate limit configuration
   */
  register(key: string, config: RateLimiterConfig): void {
    this.limits.set(key, config);
  }

  /**
   * Check if request is allowed
   */
  isAllowed(key: string): { allowed: boolean; retryAfter?: number } {
    const config = this.limits.get(key);
    if (!config) {
      return { allowed: true }; // No limit configured
    }

    const now = Date.now();
    const storageKey = `rate_limit_${config.key}`;
    
    // Get request history from localStorage
    let requests: number[] = [];
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        requests = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('[RateLimiter] Failed to parse rate limit data');
    }

    // Filter out old requests outside the window
    requests = requests.filter(timestamp => now - timestamp < config.windowMs);

    // Check if limit exceeded
    if (requests.length >= config.maxRequests) {
      const oldestRequest = requests[0];
      const retryAfter = Math.ceil((config.windowMs - (now - oldestRequest)) / 1000);
      return { allowed: false, retryAfter };
    }

    // Add current request
    requests.push(now);
    localStorage.setItem(storageKey, JSON.stringify(requests));

    return { allowed: true };
  }

  /**
   * Execute function with rate limiting
   */
  async execute<T>(
    key: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const check = this.isAllowed(key);

    if (!check.allowed) {
      throw new Error(
        `Rate limit exceeded for ${key}. Please wait ${check.retryAfter} seconds before trying again.`
      );
    }

    return await fn();
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    const storageKey = `rate_limit_${key}`;
    localStorage.removeItem(storageKey);
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.limits.forEach((_, key) => {
      this.reset(key);
    });
  }
}

// Create singleton instance
export const rateLimiter = new RateLimiter();

// Register default limits
rateLimiter.register('ai', {
  maxRequests: 30,        // 30 requests per minute
  windowMs: 60 * 1000,    // 1 minute
  key: 'ai',
});

rateLimiter.register('api', {
  maxRequests: 100,       // 100 requests per minute
  windowMs: 60 * 1000,    // 1 minute
  key: 'api',
});

rateLimiter.register('upload', {
  maxRequests: 10,        // 10 uploads per minute
  windowMs: 60 * 1000,    // 1 minute
  key: 'upload',
});
