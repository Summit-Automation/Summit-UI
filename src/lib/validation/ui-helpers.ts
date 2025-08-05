import { ValidationError } from './validator';
import { Result } from '@/types/result';

/**
 * UI-specific validation error handling utilities
 */

export interface UIValidationState {
  errors: Record<string, string>;
  hasErrors: boolean;
  isValidating: boolean;
}

/**
 * Converts validation errors to a format suitable for form display
 * @param errors - Array of validation errors
 * @returns Object with field names as keys and error messages as values
 */
export function formatErrorsForUI(errors: ValidationError[]): Record<string, string> {
  const formattedErrors: Record<string, string> = {};
  
  errors.forEach(error => {
    // Handle nested field paths (e.g., "address.street" -> "address.street")
    const fieldKey = error.field || 'general';
    formattedErrors[fieldKey] = error.message;
  });
  
  return formattedErrors;
}

/**
 * Gets the first error message for a specific field
 * @param errors - Validation errors object
 * @param fieldName - Name of the field to get error for
 * @returns Error message or undefined
 */
export function getFieldError(
  errors: Record<string, string>,
  fieldName: string
): string | undefined {
  return errors[fieldName];
}

/**
 * Checks if a specific field has an error
 * @param errors - Validation errors object
 * @param fieldName - Name of the field to check
 * @returns True if field has an error
 */
export function hasFieldError(
  errors: Record<string, string>,
  fieldName: string
): boolean {
  return Boolean(errors[fieldName]);
}

/**
 * Gets error class names for form inputs based on validation state
 * @param errors - Validation errors object
 * @param fieldName - Name of the field
 * @param errorClass - CSS class to apply when there's an error
 * @param normalClass - CSS class to apply when there's no error
 * @returns Appropriate CSS class
 */
export function getFieldClassName(
  errors: Record<string, string>,
  fieldName: string,
  errorClass = 'border-red-500 focus:border-red-500',
  normalClass = 'border-gray-300 focus:border-blue-500'
): string {
  return hasFieldError(errors, fieldName) ? errorClass : normalClass;
}

/**
 * Hook-like utility for managing validation state in components
 */
export class ValidationStateManager {
  private errors: Record<string, string> = {};
  private isValidating = false;

  constructor() {
    this.clearErrors = this.clearErrors.bind(this);
    this.setErrors = this.setErrors.bind(this);
    this.setFieldError = this.setFieldError.bind(this);
    this.clearFieldError = this.clearFieldError.bind(this);
  }

  /**
   * Set validation errors from a Result type
   */
  setErrorsFromResult(result: Result<any, ValidationError[]>): void {
    if (!result.success) {
      this.errors = formatErrorsForUI(result.error);
    } else {
      this.errors = {};
    }
  }

  /**
   * Set validation errors from an array
   */
  setErrors(errors: ValidationError[]): void {
    this.errors = formatErrorsForUI(errors);
  }

  /**
   * Set a single field error
   */
  setFieldError(fieldName: string, message: string): void {
    this.errors[fieldName] = message;
  }

  /**
   * Clear error for a specific field
   */
  clearFieldError(fieldName: string): void {
    delete this.errors[fieldName];
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors = {};
  }

  /**
   * Get current validation state
   */
  getState(): UIValidationState {
    return {
      errors: { ...this.errors },
      hasErrors: Object.keys(this.errors).length > 0,
      isValidating: this.isValidating,
    };
  }

  /**
   * Set validation loading state
   */
  setValidating(isValidating: boolean): void {
    this.isValidating = isValidating;
  }

  /**
   * Get error for specific field
   */
  getFieldError(fieldName: string): string | undefined {
    return getFieldError(this.errors, fieldName);
  }

  /**
   * Check if field has error
   */
  hasFieldError(fieldName: string): boolean {
    return hasFieldError(this.errors, fieldName);
  }

  /**
   * Get field class name based on validation state
   */
  getFieldClassName(
    fieldName: string,
    errorClass?: string,
    normalClass?: string
  ): string {
    return getFieldClassName(this.errors, fieldName, errorClass, normalClass);
  }
}

/**
 * React hook-like function to create validation state manager
 */
export function createValidationState(): ValidationStateManager {
  return new ValidationStateManager();
}

/**
 * Utility to show user-friendly error messages for common validation scenarios
 */
export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_URL: 'Please enter a valid URL',
  INVALID_UUID: 'Invalid identifier format',
  INVALID_DATE: 'Please enter a valid date',
  INVALID_NUMBER: 'Please enter a valid number',
  POSITIVE_NUMBER: 'Must be a positive number',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Must not exceed ${max} characters`,
  NETWORK_ERROR: 'Network error. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  SERVER_ERROR: 'Server error. Please try again later.',
} as const;

/**
 * Maps common validation error codes to user-friendly messages
 */
export function getUserFriendlyErrorMessage(error: ValidationError): string {
  switch (error.code) {
    case 'invalid_type':
      if (error.message.includes('email')) return ERROR_MESSAGES.INVALID_EMAIL;
      if (error.message.includes('number')) return ERROR_MESSAGES.INVALID_NUMBER;
      return error.message;
    
    case 'too_small':
      if (error.message.includes('String must contain')) {
        const match = error.message.match(/at least (\d+)/);
        const min = match ? parseInt(match[1]) : 1;
        return ERROR_MESSAGES.MIN_LENGTH(min);
      }
      if (error.message.includes('positive')) return ERROR_MESSAGES.POSITIVE_NUMBER;
      return error.message;
    
    case 'too_big':
      if (error.message.includes('String must contain')) {
        const match = error.message.match(/at most (\d+)/);
        const max = match ? parseInt(match[1]) : 100;
        return ERROR_MESSAGES.MAX_LENGTH(max);
      }
      return error.message;
    
    case 'invalid_string':
      if (error.message.includes('email')) return ERROR_MESSAGES.INVALID_EMAIL;
      if (error.message.includes('url')) return ERROR_MESSAGES.INVALID_URL;
      if (error.message.includes('uuid')) return ERROR_MESSAGES.INVALID_UUID;
      if (error.message.includes('datetime')) return ERROR_MESSAGES.INVALID_DATE;
      return error.message;
    
    default:
      return error.message;
  }
}

/**
 * Converts validation errors to user-friendly format
 */
export function formatErrorsForDisplay(errors: ValidationError[]): Record<string, string> {
  const formattedErrors: Record<string, string> = {};
  
  errors.forEach(error => {
    const fieldKey = error.field || 'general';
    formattedErrors[fieldKey] = getUserFriendlyErrorMessage(error);
  });
  
  return formattedErrors;
}

/**
 * Utility for handling async validation with loading states
 */
export async function handleAsyncValidation<T>(
  validationFn: () => Promise<Result<T, ValidationError[]>>,
  onSuccess: (data: T) => void,
  onError: (errors: Record<string, string>) => void,
  onLoading?: (loading: boolean) => void
): Promise<void> {
  try {
    onLoading?.(true);
    const result = await validationFn();
    
    if (result.success) {
      onSuccess(result.data);
    } else {
      onError(formatErrorsForDisplay(result.error));
    }
  } catch (error) {
    console.error('Async validation error:', error);
    onError({
      general: error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR
    });
  } finally {
    onLoading?.(false);
  }
}

/**
 * Debounced validation utility for real-time form validation
 */
export function createDebouncedValidator<T>(
  validationFn: (data: T) => Promise<Result<T, ValidationError[]>>,
  onResult: (result: Result<T, ValidationError[]>) => void,
  delay = 300
) {
  let timeoutId: NodeJS.Timeout;
  
  return (data: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      try {
        const result = await validationFn(data);
        onResult(result);
      } catch (error) {
        console.error('Debounced validation error:', error);
        onResult({
          success: false,
          error: [{
            field: 'general',
            message: ERROR_MESSAGES.SERVER_ERROR,
            code: 'validation_error'
          }]
        });
      }
    }, delay);
  };
}