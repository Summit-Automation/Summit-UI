/**
 * Standard result type for consistent error handling across service functions
 */
export type Result<T, E = string> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

/**
 * Type guard to check if a result is successful
 */
export function isSuccess<T, E>(result: Result<T, E>): result is { success: true; data: T } {
  return result.success;
}

/**
 * Type guard to check if a result is a failure
 */
export function isError<T, E>(result: Result<T, E>): result is { success: false; error: E } {
  return !result.success;
}

/**
 * Helper function to create a successful result
 */
export function success<T>(data: T): Result<T, never> {
  return { success: true, data };
}

/**
 * Helper function to create an error result
 */
export function error<E>(error: E): Result<never, E> {
  return { success: false, error };
}