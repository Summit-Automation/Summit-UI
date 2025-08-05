import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateInput, validateQueryParams, ValidationError } from './validator';

/**
 * Middleware wrapper for API routes that validates request body
 * @param schema - Zod schema to validate against
 * @param handler - The actual API route handler
 * @returns NextResponse with validation results
 */
export function withBodyValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (request: NextRequest, validatedData: T) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const body = await request.json();
      const validationResult = validateInput(schema, body);

      if (!validationResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: validationResult.error,
          },
          { status: 400 }
        );
      }

      return await handler(request, validationResult.data);
    } catch (error) {
      console.error('Error in API validation middleware:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request format',
        },
        { status: 400 }
      );
    }
  };
}

/**
 * Middleware wrapper for API routes that validates query parameters
 * @param schema - Zod schema to validate against
 * @param handler - The actual API route handler
 * @returns NextResponse with validation results
 */
export function withQueryValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (request: NextRequest, validatedQuery: T) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const { searchParams } = new URL(request.url);
      const queryParams: Record<string, string> = {};
      
      searchParams.forEach((value, key) => {
        queryParams[key] = value;
      });

      const validationResult = validateQueryParams(schema, queryParams);

      if (!validationResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Query parameter validation failed',
            details: validationResult.error,
          },
          { status: 400 }
        );
      }

      return await handler(request, validationResult.data);
    } catch (error) {
      console.error('Error in query validation middleware:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
        },
        { status: 400 }
      );
    }
  };
}

/**
 * Middleware wrapper that validates both body and query parameters
 * @param bodySchema - Zod schema for request body
 * @param querySchema - Zod schema for query parameters
 * @param handler - The actual API route handler
 * @returns NextResponse with validation results
 */
export function withValidation<TBody, TQuery>(
  bodySchema: z.ZodSchema<TBody>,
  querySchema: z.ZodSchema<TQuery>,
  handler: (
    request: NextRequest,
    validatedBody: TBody,
    validatedQuery: TQuery
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Validate request body
      const body = await request.json();
      const bodyValidation = validateInput(bodySchema, body);

      if (!bodyValidation.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Request body validation failed',
            details: bodyValidation.error,
          },
          { status: 400 }
        );
      }

      // Validate query parameters
      const { searchParams } = new URL(request.url);
      const queryParams: Record<string, string> = {};
      
      searchParams.forEach((value, key) => {
        queryParams[key] = value;
      });

      const queryValidation = validateQueryParams(querySchema, queryParams);

      if (!queryValidation.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Query parameter validation failed',
            details: queryValidation.error,
          },
          { status: 400 }
        );
      }

      return await handler(request, bodyValidation.data, queryValidation.data);
    } catch (error) {
      console.error('Error in validation middleware:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Request validation failed',
        },
        { status: 400 }
      );
    }
  };
}

/**
 * Standard error response format for validation failures
 */
export interface ValidationErrorResponse {
  success: false;
  error: string;
  details?: ValidationError[];
  timestamp: string;
}

/**
 * Standard success response format for API endpoints
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  timestamp: string;
}

/**
 * Helper function to create a standardized validation error response
 */
export function createValidationErrorResponse(
  errors: ValidationError[],
  message = 'Validation failed'
): NextResponse {
  const response: ValidationErrorResponse = {
    success: false,
    error: message,
    details: errors,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status: 400 });
}

/**
 * Helper function to create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  status = 200
): NextResponse {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status });
}

/**
 * Helper function to create a standardized error response
 */
export function createErrorResponse(
  message: string,
  status = 500
): NextResponse {
  const response = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status });
}

/**
 * Async wrapper that catches errors and returns standardized error responses
 */
export function withErrorHandling(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(request);
    } catch (error) {
      console.error('Unhandled error in API route:', error);
      
      if (error instanceof Error) {
        return createErrorResponse(error.message);
      }
      
      return createErrorResponse('Internal server error');
    }
  };
}

/**
 * Combined middleware that provides validation and error handling
 */
export function withValidatedHandler<T>(
  schema: z.ZodSchema<T>,
  handler: (request: NextRequest, validatedData: T) => Promise<NextResponse>
) {
  return withErrorHandling(
    withBodyValidation(schema, handler)
  );
}

/**
 * Rate limiting validation - prevents too many requests
 */
export function withRateLimit(
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
) {
  const requestCounts = new Map<string, { count: number; resetTime: number }>();

  return (handler: (request: NextRequest) => Promise<NextResponse>) => {
    return async (request: NextRequest): Promise<NextResponse> => {
      const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      const now = Date.now();
      
      const clientData = requestCounts.get(clientIP) || { count: 0, resetTime: now + windowMs };
      
      if (now > clientData.resetTime) {
        clientData.count = 1;
        clientData.resetTime = now + windowMs;
      } else {
        clientData.count++;
      }
      
      requestCounts.set(clientIP, clientData);
      
      if (clientData.count > maxRequests) {
        return NextResponse.json(
          {
            success: false,
            error: 'Rate limit exceeded',
            retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
          },
          { status: 429 }
        );
      }
      
      return await handler(request);
    };
  };
}