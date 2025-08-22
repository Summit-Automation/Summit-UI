'use server';

import { createClient } from '@/utils/supabase/server';
import { validateOrThrow } from '@/lib/validation/validator';
import { mileageCalculationSchema, type MileageCalculationInput } from '@/lib/validation/schemas';

interface MileageResponse {
  miles: number;
  duration: string;
  route: string;
  success: boolean;
}

export async function calculateMileage(
  rawFormData: unknown
): Promise<{ success: boolean; message: string; data?: MileageResponse }> {
  try {
    const supabase = await createClient();

    // SECURITY: Get authenticated user from server-side session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Mileage calculation authentication failed:', authError?.message);
      return {
        success: false,
        message: 'Authentication required'
      };
    }

    const organizationId = user.user_metadata?.organization_id;
    if (!organizationId) {
      console.error('Organization ID not found for mileage calculation');
      return {
        success: false,
        message: 'Organization information not found'
      };
    }

    // SECURITY: Rate limiting - check recent mileage calculation attempts
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentCalculations } = await supabase
      .from('mileage_entries')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneHourAgo);

    if (recentCalculations && recentCalculations >= 50) {
      console.warn('Mileage calculation rate limit exceeded for user:', user.id, 'count:', recentCalculations);
      return {
        success: false,
        message: 'Rate limit exceeded. Please wait before calculating more mileage.'
      };
    }

    // SECURITY: Validate and sanitize input using Zod schema
    let validatedData: MileageCalculationInput;
    try {
      validatedData = validateOrThrow(mileageCalculationSchema, rawFormData);
    } catch (error) {
      console.error('Mileage calculation validation failed:', error, 'User:', user.id);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Invalid input data'
      };
    }

    // Call Flowise API
    const flowiseResponse = await callFlowiseMileageAPI(validatedData);

    if (!flowiseResponse.success) {
      console.error('Flowise mileage API error:', flowiseResponse.message, 'User:', user.id);
      return {
        success: false,
        message: 'Mileage calculation service temporarily unavailable'
      };
    }

    return {
      success: true,
      message: 'Mileage calculated successfully',
      data: flowiseResponse.data
    };

  } catch (error) {
    console.error('Unexpected error in calculateMileage:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    };
  }
}

async function callFlowiseMileageAPI(
  validatedData: MileageCalculationInput
): Promise<{ success: boolean; message: string; data?: MileageResponse }> {
  try {
    // SECURITY: Use server-only environment variables
    const apiHost = process.env.FLOWISE_API_URL;
    const chatflowId = process.env.FLOWISE_MILEAGE_ID;

    if (!apiHost || !chatflowId) {
      console.error('FLOWISE_API_URL and FLOWISE_MILEAGE_ID environment variables must be set');
      throw new Error('Mileage calculation service configuration missing');
    }

    // SECURITY: Validate HTTPS URL
    if (!apiHost.startsWith('https://')) {
      console.error('Flowise API URL must use HTTPS:', apiHost);
      throw new Error('Mileage calculation service configuration error');
    }

    const flowiseUrl = `${apiHost}/api/v1/prediction/${chatflowId}`;

    // Build secure prompt
    const prompt = `Calculate driving distance and time from "${validatedData.start_location}" to "${validatedData.end_location}". Return the result in this exact JSON format: {"miles": number, "duration": "X hours Y minutes", "route": "brief route description", "success": true}`;

    const requestBody = {
      question: prompt,
    };

    const requestBodyString = JSON.stringify(requestBody);
    if (requestBodyString.length > 5000) { // 5KB limit
      throw new Error('Request data too large');
    }

    // SECURITY: Add timeout and proper headers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(flowiseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Summit-Suite/1.0',
      },
      body: requestBodyString,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Flowise mileage API error: ${response.status} ${response.statusText}`);
      throw new Error('External service error');
    }

    // SECURITY: Limit response size
    const responseText = await response.text();
    if (responseText.length > 10000) { // 10KB limit
      console.error('Flowise mileage API response too large:', responseText.length);
      throw new Error('Response data too large');
    }
    
    // Parse the response using the EXACT same logic as the original client-side code (matching lead generation)
    let parsedResponse: MileageResponse;
    try {
      const data = JSON.parse(responseText);
      let responseContent = '';

      // EXACT MATCH: Handle different response formats from Flowise
      if (data.text) {
        responseContent = data.text;
      } else if (typeof data === 'string') {
        responseContent = data;
      } else {
        responseContent = JSON.stringify(data);
      }

      console.log('Mileage calculation response text to parse:', responseContent);

      // EXACT MATCH: Try to extract JSON from the response text (same regex as original)
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      let mileageResponse = null;
      
      if (jsonMatch) {
        try {
          mileageResponse = JSON.parse(jsonMatch[0]);
          console.log('Mileage calculation parsed JSON response:', mileageResponse);
        } catch (jsonError) {
          console.error('Mileage calculation JSON parse error:', jsonError);
          throw new Error('Failed to parse mileage data from AI response');
        }
      } else {
        throw new Error('No mileage data found in AI response');
      }

      // Validate and normalize the data - use only real AI data, no fallbacks
      if (!mileageResponse || typeof mileageResponse.miles !== 'number') {
        throw new Error('Invalid mileage data structure from AI agent');
      }

      parsedResponse = {
        miles: Math.max(0, Math.min(mileageResponse.miles, 10000)), // Cap at 10k miles for safety
        duration: String(mileageResponse.duration || '').substring(0, 100),
        route: String(mileageResponse.route || '').substring(0, 500),
        success: mileageResponse.success === true,
      };

      // Ensure we have valid data
      if (!parsedResponse.success) {
        throw new Error('Invalid mileage calculation result from AI agent');
      }

    } catch (parseError) {
      console.error('Failed to parse Flowise mileage response:', parseError);
      throw new Error('Failed to process mileage data');
    }

    return {
      success: parsedResponse.success && parsedResponse.miles > 0,
      message: parsedResponse.success ? 'Successfully calculated mileage' : 'Failed to calculate mileage',
      data: parsedResponse
    };

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Flowise mileage API timeout');
      return {
        success: false,
        message: 'Mileage calculation timed out. Please try again.'
      };
    }
    
    console.error('Flowise mileage API call failed:', error);
    return {
      success: false,
      message: 'Mileage calculation service temporarily unavailable'
    };
  }
}