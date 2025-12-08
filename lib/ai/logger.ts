/**
 * AI System Logger
 * Provides structured logging for AI operations, useful for debugging and monitoring.
 */

interface LogEntry {
  timestamp: string;
  event: string;
  data: Record<string, unknown>;
}

interface ErrorEntry {
  timestamp: string;
  error: {
    message: string;
    stack?: string;
  };
  context: Record<string, unknown>;
}

/**
 * Logs an AI-related event with structured data.
 * In development, logs to console. In production, can be extended to send to monitoring services.
 */
export function logAIEvent(event: string, data: Record<string, unknown>): void {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    event,
    data,
  };

  // Development: console logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[AI]', JSON.stringify(logEntry, null, 2));
  } else {
    // Production: structured logging (can be picked up by Vercel logs, etc.)
    console.log('[AI]', JSON.stringify(logEntry));
  }

  // TODO: Add integration with monitoring service (e.g., Sentry, LogRocket, Datadog)
  // Example:
  // if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
  //   sendToMonitoringService(logEntry);
  // }
}

/**
 * Logs an AI-related error with context.
 * Always logs to console.error and can be extended for error tracking services.
 */
export function logAIError(error: Error, context: Record<string, unknown>): void {
  const errorEntry: ErrorEntry = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      stack: error.stack,
    },
    context,
  };

  console.error('[AI ERROR]', JSON.stringify(errorEntry, null, 2));

  // TODO: Add integration with error tracking service
  // Example:
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { extra: context });
  // }
}

/**
 * Logs metrics for AI operations (latency, token usage, etc.)
 */
export function logAIMetrics(operation: string, metrics: {
  latencyMs: number;
  promptTokens?: number;
  completionTokens?: number;
  success: boolean;
  userId?: string;
}): void {
  logAIEvent('ai_metrics', {
    operation,
    ...metrics,
  });
}

/**
 * Logs when an AI feature is used
 */
export function logAIFeatureUsage(feature: string, userId: string, metadata?: Record<string, unknown>): void {
  logAIEvent('ai_feature_usage', {
    feature,
    userId,
    ...metadata,
  });
}

