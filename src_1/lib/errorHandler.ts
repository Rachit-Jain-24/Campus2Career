/**
 * Production-Ready Error Handling Utilities
 * 
 * Provides centralized error handling, user-friendly messages,
 * and proper error logging for the Campus2Career application.
 */
import { captureException } from './sentry';

// ── Error Types ──────────────────────────────────────────────────────────────

export const ErrorCategory = {
  DATABASE: 'database',
  NETWORK: 'network',
  AUTHENTICATION: 'authentication',
  VALIDATION: 'validation',
  AI_SERVICE: 'ai_service',
  FILE_UPLOAD: 'file_upload',
  PERMISSION: 'permission',
  UNKNOWN: 'unknown',
} as const;

export type ErrorCategory = typeof ErrorCategory[keyof typeof ErrorCategory];

export interface AppError {
  category: ErrorCategory;
  userMessage: string;
  technicalMessage: string;
  recoveryAction?: string;
  statusCode?: number;
  timestamp: string;
}

// ── User-Friendly Error Messages ─────────────────────────────────────────────

const ERROR_MESSAGES: Record<string, { user: string; recovery: string }> = {
  // Database Errors
  'QUERY_TIMEOUT': {
    user: 'The database is taking longer than expected to respond.',
    recovery: 'Please try again in a few moments. If the issue persists, contact support.',
  },
  'CONNECTION_FAILED': {
    user: 'Unable to connect to our servers.',
    recovery: 'Check your internet connection and try again.',
  },
  'ROW_NOT_FOUND': {
    user: 'The requested data could not be found.',
    recovery: 'Please refresh the page or navigate back to try again.',
  },
  'DUPLICATE_ENTRY': {
    user: 'This record already exists.',
    recovery: 'Please check your data and try again with different values.',
  },

  // Network Errors
  'NETWORK_ERROR': {
    user: 'A network error occurred.',
    recovery: 'Please check your internet connection and try again.',
  },
  'FETCH_FAILED': {
    user: 'Failed to load data from server.',
    recovery: 'Please check your connection and refresh the page.',
  },
  'DNS_RESOLUTION_FAILED': {
    user: 'Unable to reach our servers.',
    recovery: 'This might be a temporary network issue. Please try again in a few moments.',
  },

  // Authentication Errors
  'INVALID_CREDENTIALS': {
    user: 'Incorrect email/SAP ID or password.',
    recovery: 'Please check your credentials and try again.',
  },
  'UNAUTHORIZED': {
    user: 'You do not have permission to access this resource.',
    recovery: 'Please contact your administrator if you believe this is an error.',
  },
  'SESSION_EXPIRED': {
    user: 'Your session has expired due to inactivity.',
    recovery: 'Please log in again to continue.',
  },
  'EMAIL_NOT_CONFIRMED': {
    user: 'Your email address has not been verified yet.',
    recovery: 'Please check your inbox for a verification email or contact admin.',
  },

  // AI Service Errors
  'AI_SERVICE_UNAVAILABLE': {
    user: 'AI service is temporarily unavailable.',
    recovery: 'Please try again later or use the offline features.',
  },
  'AI_RATE_LIMIT': {
    user: 'You have made too many AI requests.',
    recovery: 'Please wait a few minutes before trying again.',
  },
  'AI_TIMEOUT': {
    user: 'AI processing is taking longer than expected.',
    recovery: 'Please try again with a simpler request.',
  },

  // File Upload Errors
  'FILE_TOO_LARGE': {
    user: 'The file size exceeds the maximum allowed limit.',
    recovery: 'Please upload a smaller file (max 5MB).',
  },
  'INVALID_FILE_TYPE': {
    user: 'This file type is not supported.',
    recovery: 'Please upload a PDF or DOCX file.',
  },
  'UPLOAD_FAILED': {
    user: 'File upload failed.',
    recovery: 'Please try again or contact support if the issue persists.',
  },

  // Validation Errors
  'INVALID_INPUT': {
    user: 'Please check your input and try again.',
    recovery: 'Make sure all required fields are filled correctly.',
  },
  'MISSING_REQUIRED_FIELD': {
    user: 'Some required information is missing.',
    recovery: 'Please fill in all required fields.',
  },
};

// ── Error Creation Functions ─────────────────────────────────────────────────

/**
 * Creates a user-friendly AppError from a technical error
 */
export function createAppError(
  error: unknown,
  category: ErrorCategory,
  fallbackMessage: string = 'An unexpected error occurred.'
): AppError {
  const technicalMessage = error instanceof Error ? error.message : String(error);
  const errorCode = extractErrorCode(technicalMessage);

  const errorConfig = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES[category.toUpperCase()];

  return {
    category,
    userMessage: errorConfig?.user || fallbackMessage,
    technicalMessage,
    recoveryAction: errorConfig?.recovery,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Extracts error code from technical message
 */
function extractErrorCode(message: string): string {
  const upperMessage = message.toUpperCase();

  if (upperMessage.includes('TIMEOUT') || upperMessage.includes('timed out')) {
    return 'QUERY_TIMEOUT';
  }
  if (upperMessage.includes('ENOTFOUND') || upperMessage.includes('DNS')) {
    return 'DNS_RESOLUTION_FAILED';
  }
  if (upperMessage.includes('FETCH') || upperMessage.includes('NETWORK')) {
    return 'FETCH_FAILED';
  }
  if (upperMessage.includes('INVALID') && upperMessage.includes('CREDENTIAL')) {
    return 'INVALID_CREDENTIALS';
  }
  if (upperMessage.includes('UNAUTHORIZED') || upperMessage.includes('PERMISSION')) {
    return 'UNAUTHORIZED';
  }
  if (upperMessage.includes('NOT FOUND') || upperMessage.includes('404')) {
    return 'ROW_NOT_FOUND';
  }
  if (upperMessage.includes('DUPLICATE') || upperMessage.includes('CONFLICT')) {
    return 'DUPLICATE_ENTRY';
  }

  return '';
}

// ── Error Logging ────────────────────────────────────────────────────────────

/**
 * Logs error with appropriate level based on severity
 */
export function logError(appError: AppError, context?: Record<string, any>): void {
  // Always log technical details to console for debugging
  console.error(`[${appError.category.toUpperCase()}] ${appError.technicalMessage}`, {
    timestamp: appError.timestamp,
    context,
  });

  // In production, send to error tracking service (e.g., Sentry)
  if (import.meta.env.PROD) {
    captureException(appError.technicalMessage, { context, category: appError.category });
  }
}

/**
 * Logs warning for non-critical issues
 */
export function logWarning(message: string, context?: Record<string, any>): void {
  console.warn(`[WARNING] ${message}`, context);
}

// ── Error Display Helpers ────────────────────────────────────────────────────

/**
 * Shows user-friendly error toast notification
 */
export function showErrorToast(
  appError: AppError,
  showToast: (message: string, type: 'error' | 'warning' | 'info') => void
): void {
  showToast(appError.userMessage, 'error');

  // Log the technical details
  logError(appError);
}

/**
 * Shows recovery action suggestion
 */
export function showRecoverySuggestion(
  appError: AppError,
  onRetry?: () => void
): void {
  if (appError.recoveryAction) {
    console.info(`💡 Recovery: ${appError.recoveryAction}`);
  }

  if (onRetry) {
    console.info('🔄 Retry available');
  }
}

// ── API Error Handler ────────────────────────────────────────────────────────

/**
 * Centralized error handler for API calls
 */
export async function handleApiError<T>(
  apiCall: () => Promise<T>,
  category: ErrorCategory,
  fallbackMessage: string = 'Failed to complete operation'
): Promise<T | null> {
  try {
    return await apiCall();
  } catch (error: unknown) {
    const appError = createAppError(error, category, fallbackMessage);

    // Show user-friendly message
    logError(appError, { apiCall: apiCall.name });

    // In development, also log the full error stack
    if (import.meta.env.DEV) {
      console.error('Full error details:', error);
    }

    // Return null or throw based on your error handling strategy
    return null;
  }
}

// ── Database Error Handler ───────────────────────────────────────────────────

/**
 * Handles database-specific errors with retry logic
 */
export async function handleDatabaseError<T>(
  dbOperation: () => Promise<T>,
  maxRetries: number = 2,
  retryDelay: number = 1500
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await dbOperation();
    } catch (error: unknown) {
      lastError = error;

      const isTimeout = String(error).includes('TIMEOUT');
      const isNetworkError = String(error).includes('ENOTFOUND') || String(error).includes('fetch');

      // Only retry on timeout or network errors
      if ((isTimeout || isNetworkError) && attempt < maxRetries) {
        console.warn(`[DB] Attempt ${attempt} failed, retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        continue;
      }

      // For other errors or max retries reached, throw
      break;
    }
  }

  // If we get here, all retries failed
  const appError = createAppError(lastError, ErrorCategory.DATABASE);
  throw appError;
}

// ── Validation Error Handler ─────────────────────────────────────────────────

/**
 * Validates required fields and returns user-friendly errors
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): AppError | null {
  const missingFields = requiredFields.filter(field => !data[field]);

  if (missingFields.length > 0) {
    return {
      category: ErrorCategory.VALIDATION,
      userMessage: `Missing required fields: ${missingFields.join(', ')}`,
      technicalMessage: `Validation failed for fields: ${missingFields.join(', ')}`,
      recoveryAction: 'Please fill in all required fields and try again.',
      timestamp: new Date().toISOString(),
    };
  }

  return null;
}

// ── Graceful Degradation ─────────────────────────────────────────────────────

/**
 * Provides fallback value when primary operation fails
 */
export async function withFallback<T>(
  primaryOperation: () => Promise<T>,
  fallbackOperation: () => Promise<T>,
  category: ErrorCategory = ErrorCategory.UNKNOWN
): Promise<T> {
  try {
    return await primaryOperation();
  } catch (error: unknown) {
    const appError = createAppError(error, category);
    logWarning(`Primary operation failed, using fallback: ${appError.technicalMessage}`);

    try {
      return await fallbackOperation();
    } catch (fallbackError: unknown) {
      const fallbackAppError = createAppError(fallbackError, category);
      logError(fallbackAppError);
      throw fallbackAppError;
    }
  }
}
