// Error handling utilities

import { logger } from '../logging/logger';
import { AppError } from '../types/base';

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 400, true, context);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, context?: Record<string, any>) {
    super(`${resource} not found`, 404, true, context);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', context?: Record<string, any>) {
    super(message, 401, true, context);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', context?: Record<string, any>) {
    super(message, 403, true, context);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 409, true, context);
  }
}

export interface ErrorHandlerOptions {
  logError?: boolean;
  includeStack?: boolean;
  context?: Record<string, any>;
}

/**
 * Central error handler for the application
 */
export const errorHandler = {
  /**
   * Handle and log errors consistently
   */
  handle(error: Error | AppError, options: ErrorHandlerOptions = {}): AppError {
    const {
      logError = true,
      includeStack = import.meta.env.MODE === 'development',
      context = {}
    } = options;

    let appError: AppError;

    // Convert regular errors to AppError
    if (error instanceof AppError) {
      appError = error;
    } else {
      appError = new AppError(
        error.message || 'An unexpected error occurred',
        500,
        false,
        { ...context, originalError: error.name }
      );
    }

    // Log the error
    if (logError) {
      const logContext = {
        statusCode: appError.statusCode,
        isOperational: appError.isOperational,
        ...appError.context,
        ...context
      };

      if (appError.statusCode >= 500) {
        logger.error(appError.message, appError, logContext);
      } else if (appError.statusCode >= 400) {
        logger.warn(appError.message, logContext);
      } else {
        logger.info(appError.message, logContext);
      }
    }

    return appError;
  },

  /**
   * Handle async errors in promises
   */
  async handleAsync<T>(
    promise: Promise<T>,
    options: ErrorHandlerOptions = {}
  ): Promise<[AppError | null, T | null]> {
    try {
      const result = await promise;
      return [null, result];
    } catch (error) {
      const handledError = this.handle(error as Error, options);
      return [handledError, null];
    }
  },

  /**
   * Create error response object for APIs
   */
  createErrorResponse(error: AppError) {
    const response: any = {
      error: {
        message: error.message,
        statusCode: error.statusCode,
        timestamp: new Date().toISOString()
      }
    };

    // Include additional context in development
    if (import.meta.env.MODE === 'development') {
      response.error.stack = error.stack;
      response.error.context = error.context;
    }

    return response;
  },

  /**
   * Check if error is operational (expected) or programming error
   */
  isOperationalError(error: Error): boolean {
    if (error instanceof AppError) {
      return error.isOperational;
    }
    return false;
  }
};

/**
 * Utility function to wrap async functions with error handling
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: ErrorHandlerOptions = {}
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      throw errorHandler.handle(error as Error, options);
    }
  };
}

/**
 * Utility function for safe async operations
 */
export async function safeAsync<T>(
  promise: Promise<T>,
  options: ErrorHandlerOptions = {}
): Promise<[AppError | null, T | null]> {
  return errorHandler.handleAsync(promise, options);
}