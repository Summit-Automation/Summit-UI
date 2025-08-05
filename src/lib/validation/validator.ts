import { z } from 'zod';
import { Result, success, error } from '@/types/result';

// Enhanced validation error type
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  success: boolean;
  errors: ValidationError[];
  data?: unknown;
}

/**
 * Validates input data against a Zod schema and returns a Result type
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns Result with validated data or validation errors
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Result<T, ValidationError[]> {
  try {
    const validatedData = schema.parse(data);
    return success(validatedData);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const validationErrors: ValidationError[] = err.issues.map((zodError) => ({
        field: zodError.path.join('.'),
        message: zodError.message,
        code: zodError.code,
      }));
      return error(validationErrors);
    }
    
    // Handle unexpected errors
    return error([{
      field: 'unknown',
      message: 'Validation failed with unexpected error',
      code: 'internal_error'
    }]);
  }
}

/**
 * Validates input data and throws an error if validation fails
 * Use this when you want to fail fast on invalid input
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns The validated data
 * @throws ValidationError if validation fails
 */
export function validateInputStrict<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  try {
    return schema.parse(data);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const validationErrors: ValidationError[] = err.issues.map((zodError) => ({
        field: zodError.path.join('.'),
        message: zodError.message,
        code: zodError.code,
      }));
      
      const errorMessage = validationErrors
        .map(error => `${error.field}: ${error.message}`)
        .join(', ');
      
      throw new Error(`Validation failed: ${errorMessage}`);
    }
    throw err;
  }
}

/**
 * Safely validates partial updates by filtering out undefined values
 * @param schema - The Zod schema to validate against
 * @param data - The partial data to validate
 * @returns Result with validated data or validation errors
 */
export function validatePartialInput<T>(
  schema: z.ZodObject<z.ZodRawShape>,
  data: unknown
): Result<Partial<T>, ValidationError[]> {
  try {
    // Remove undefined values before validation
    const cleanedData = removeUndefinedValues(data);
    const validatedData = schema.partial().parse(cleanedData) as Partial<T>;
    return success(validatedData);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const validationErrors: ValidationError[] = err.issues.map((zodError) => ({
        field: zodError.path.join('.'),
        message: zodError.message,
        code: zodError.code,
      }));
      return error(validationErrors);
    }
    
    return error([{
      field: 'unknown',
      message: 'Partial validation failed with unexpected error',
      code: 'internal_error'
    }]);
  }
}

/**
 * Validates an array of items against a schema
 * @param schema - The Zod schema for individual items
 * @param data - Array of data to validate
 * @returns Result with validated array or validation errors
 */
export function validateArray<T>(
  schema: z.ZodSchema<T>,
  data: unknown[]
): Result<T[], ValidationError[]> {
  try {
    const arraySchema = z.array(schema);
    const validatedData = arraySchema.parse(data);
    return success(validatedData);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const validationErrors: ValidationError[] = err.issues.map((zodError) => ({
        field: zodError.path.join('.'),
        message: zodError.message,
        code: zodError.code,
      }));
      return error(validationErrors);
    }
    
    return error([{
      field: 'unknown',
      message: 'Array validation failed with unexpected error',
      code: 'internal_error'
    }]);
  }
}

/**
 * Validates query parameters for API endpoints
 * @param schema - The Zod schema for query parameters
 * @param queryParams - The query parameters object
 * @returns Result with validated query parameters
 */
export function validateQueryParams<T>(
  schema: z.ZodSchema<T>,
  queryParams: Record<string, string | string[] | undefined>
): Result<T, ValidationError[]> {
  try {
    // Convert query parameters to appropriate types
    const processedParams = processQueryParams(queryParams);
    const validatedData = schema.parse(processedParams);
    return success(validatedData);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const validationErrors: ValidationError[] = err.issues.map((zodError) => ({
        field: zodError.path.join('.'),
        message: zodError.message,
        code: zodError.code,
      }));
      return error(validationErrors);
    }
    
    return error([{
      field: 'unknown',
      message: 'Query parameter validation failed',
      code: 'internal_error'
    }]);
  }
}

/**
 * Helper function to remove undefined values from an object
 */
function removeUndefinedValues(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedValues);
  }
  
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = removeUndefinedValues(value);
    }
  }
  return cleaned;
}

/**
 * Helper function to process query parameters for validation
 */
function processQueryParams(
  params: Record<string, string | string[] | undefined>
): Record<string, unknown> {
  const processed: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }
    
    if (Array.isArray(value)) {
      processed[key] = value;
    } else {
      // Try to convert string values to appropriate types
      if (value === 'true') {
        processed[key] = true;
      } else if (value === 'false') {
        processed[key] = false;
      } else if (!isNaN(Number(value)) && value !== '') {
        processed[key] = Number(value);
      } else {
        processed[key] = value;
      }
    }
  }
  
  return processed;
}

/**
 * Formats validation errors for user-friendly display
 * @param errors - Array of validation errors
 * @returns Formatted error message
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) {
    return 'Validation failed';
  }
  
  if (errors.length === 1) {
    return errors[0].message;
  }
  
  return errors
    .map(error => `${error.field}: ${error.message}`)
    .join('; ');
}

/**
 * Type guard to check if a result contains validation errors
 */
export function hasValidationErrors<T>(
  result: Result<T, ValidationError[]>
): result is Result<never, ValidationError[]> & { success: false } {
  return !result.success;
}

/**
 * Custom validation error class for use in service functions
 */
export class ServiceValidationError extends Error {
  public readonly errors: ValidationError[];
  
  constructor(errors: ValidationError[]) {
    super(formatValidationErrors(errors));
    this.name = 'ServiceValidationError';
    this.errors = errors;
  }
}

/**
 * Wrapper function that validates input and throws ServiceValidationError on failure
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns The validated data
 * @throws ServiceValidationError if validation fails
 */
export function validateOrThrow<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  const result = validateInput(schema, data);
  
  if (hasValidationErrors(result)) {
    throw new ServiceValidationError(result.error);
  }
  
  return result.data;
}