// Request ID generation utility

/**
 * Generates a unique request ID for tracking requests across the application
 * @returns A unique request ID string
 */
export function generateRequestId(): string {
  // Generate a random string with timestamp and random component
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  
  return `req_${timestamp}_${randomPart}`;
}

/**
 * Extracts request ID from headers or generates a new one
 * @param headers Request headers object
 * @returns Request ID string
 */
export function getOrCreateRequestId(headers?: Record<string, string>): string {
  const existingId = headers?.['x-request-id'] || headers?.['X-Request-ID'];
  return existingId || generateRequestId();
}

/**
 * Creates a correlation ID for tracking related operations
 * @param prefix Optional prefix for the correlation ID
 * @returns Correlation ID string
 */
export function generateCorrelationId(prefix = 'corr'): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  
  return `${prefix}_${timestamp}_${randomPart}`;
}