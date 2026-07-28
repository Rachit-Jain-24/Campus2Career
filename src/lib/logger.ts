/**
 * Structured Logger
 *
 * Centralised logging for Campus2Career.
 * - In development: forwards to console with level prefixes.
 * - In production: suppresses debug/info, routes errors to Sentry.
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.info('User signed in', { userId });
 *   logger.error('Failed to save profile', { error, userId });
 */
import { captureException } from './sentry';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const IS_PROD = import.meta.env.PROD;

function formatContext(context?: Record<string, unknown>): string {
  if (!context || Object.keys(context).length === 0) return '';
  try {
    return ' ' + JSON.stringify(context, null, IS_PROD ? 0 : 2);
  } catch {
    return ' [unserializable context]';
  }
}

function shouldLog(level: LogLevel): boolean {
  if (IS_PROD) {
    // Only warn and error in production
    return level === 'warn' || level === 'error';
  }
  return true;
}

const LEVEL_LABELS: Record<LogLevel, string> = {
  debug: '[DEBUG]',
  info: '[INFO]',
  warn: '[WARN]',
  error: '[ERROR]',
};

function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;

  const label = LEVEL_LABELS[level];
  const ctx = formatContext(context);

  switch (level) {
    case 'debug':
      console.debug(`${label} ${message}${ctx}`);
      break;
    case 'info':
      console.info(`${label} ${message}${ctx}`);
      break;
    case 'warn':
      console.warn(`${label} ${message}${ctx}`);
      break;
    case 'error':
      console.error(`${label} ${message}${ctx}`);
      // Route errors to Sentry in production
      if (IS_PROD && context?.error) {
        captureException(context.error, { message, ...context });
      }
      break;
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => log('debug', message, context),
  info: (message: string, context?: Record<string, unknown>) => log('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) => log('warn', message, context),
  error: (message: string, context?: Record<string, unknown>) => log('error', message, context),
};
