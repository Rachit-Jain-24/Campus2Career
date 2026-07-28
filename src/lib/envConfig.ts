/**
 * Environment Configuration Validator
 * 
 * Validates all required environment variables at application startup.
 * Prevents runtime errors from missing or misconfigured environment variables.
 * 
 * Usage: Called in main.tsx before app initialization
 */

interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates that a URL is properly formatted
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    // Check for trailing slash (common Supabase mistake)
    return !url.endsWith('/');
  } catch {
    return false;
  }
}

/**
 * Validates Supabase configuration
 */
function validateSupabaseConfig(errors: string[], warnings: string[]): void {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    errors.push('VITE_SUPABASE_URL is required but not defined');
  } else {
    if (!isValidUrl(supabaseUrl)) {
      errors.push('VITE_SUPABASE_URL is not a valid URL');
    }
    if (supabaseUrl.endsWith('/')) {
      errors.push('VITE_SUPABASE_URL must not have a trailing slash');
    }
    if (!supabaseUrl.includes('.supabase.co')) {
      warnings.push('VITE_SUPABASE_URL does not appear to be a valid Supabase URL');
    }
  }

  if (!supabaseKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is required but not defined');
  } else if (supabaseKey === 'your_supabase_anon_key_here') {
    errors.push('VITE_SUPABASE_ANON_KEY still has placeholder value');
  }
}

/**
 * Validates AI backend configuration.
 * OpenRouter keys must stay server-side in the FastAPI backend.
 */
function validateAIConfig(errors: string[], warnings: string[]): void {
  const aiBackendUrl = import.meta.env.VITE_AI_BACKEND_URL;
  if (!aiBackendUrl) {
    const message = 'VITE_AI_BACKEND_URL not set - AI features and resume analysis will use local fallback';
    if (import.meta.env.PROD) {
      errors.push('VITE_AI_BACKEND_URL is required in production');
    } else {
      warnings.push(message);
    }
  } else if (!isValidUrl(aiBackendUrl)) {
    errors.push('VITE_AI_BACKEND_URL is not a valid URL');
  }
}

/**
 * Validates optional service configurations
 */
function validateOptionalServices(warnings: string[]): void {
  const aiBackendUrl = import.meta.env.VITE_AI_BACKEND_URL;
  if (!aiBackendUrl) {
    warnings.push('VITE_AI_BACKEND_URL not set - Resume analysis will use local fallback');
  }
  
  // Judge0 is no longer required - we use Piston API (free, no key needed)
  // Keep this for backward compatibility but don't warn
}

/**
 * Validates security settings
 */
function validateSecurity(errors: string[]): void {
  const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (serviceRoleKey && serviceRoleKey !== 'your_supabase_service_role_key_here') {
    errors.push(
      'SECURITY WARNING: SUPABASE_SERVICE_ROLE_KEY detected in frontend environment. ' +
      'This key should ONLY be used in server-side scripts, never in frontend code.'
    );
  }

  if (import.meta.env.VITE_OPENROUTER_API_KEY) {
    errors.push(
      'SECURITY WARNING: VITE_OPENROUTER_API_KEY would be exposed in the browser. ' +
      'Use OPENROUTER_API_KEY only in the FastAPI backend environment.'
    );
  }
}

/**
 * Main validation function
 */
export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate all configurations
  validateSupabaseConfig(errors, warnings);
  validateAIConfig(errors, warnings);
  validateOptionalServices(warnings);
  validateSecurity(errors);

  // Log results
  if (errors.length > 0) {
    console.error('❌ Environment Validation Errors:', errors);
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Environment Warnings:', warnings);
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ Environment configuration validated successfully');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get current environment name
 */
export function getEnvironment(): 'development' | 'staging' | 'production' {
  return (import.meta.env.VITE_APP_ENV as any) || 'development';
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getEnvironment() === 'production' || import.meta.env.PROD;
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getEnvironment() === 'development' || import.meta.env.DEV;
}

/**
 * Get rate limit configuration
 */
export function getRateLimits(): { ai: number; api: number } {
  return {
    ai: parseInt(import.meta.env.VITE_AI_RATE_LIMIT || '30', 10),
    api: parseInt(import.meta.env.VITE_API_RATE_LIMIT || '100', 10),
  };
}
