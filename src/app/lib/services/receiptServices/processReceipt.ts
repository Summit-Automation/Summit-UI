'use server';

import { createClient } from '@/utils/supabase/server';
import { validateOrThrow } from '@/lib/validation/validator';
import { receiptUploadSchema, type ReceiptUploadInput } from '@/lib/validation/schemas';

interface ReceiptProcessingResponse {
  businessName: string;
  total: string;
  date: string;
  category: string;
  address: string;
  items: Array<{
    description: string;
    amount: string;
  }>;
}

export async function processReceipt(
  rawFormData: unknown
): Promise<{ success: boolean; message: string; data?: ReceiptProcessingResponse }> {
  try {
    const supabase = await createClient();

    // SECURITY: Get authenticated user from server-side session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Receipt processing authentication failed:', authError?.message);
      return {
        success: false,
        message: 'Authentication required'
      };
    }

    const organizationId = user.user_metadata?.organization_id;
    if (!organizationId) {
      console.error('Organization ID not found for receipt processing');
      return {
        success: false,
        message: 'Organization information not found'
      };
    }

    // SECURITY: Rate limiting - check recent receipt processing attempts
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentProcessing } = await supabase
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .eq('uploaded_by', user.id)
      .eq('source', 'ai_agent')
      .gte('timestamp', oneHourAgo);

    if (recentProcessing && recentProcessing >= 20) {
      console.warn('Receipt processing rate limit exceeded for user:', user.id, 'count:', recentProcessing);
      return {
        success: false,
        message: 'Rate limit exceeded. Please wait before processing more receipts.'
      };
    }

    // SECURITY: Validate and sanitize input using Zod schema
    let validatedData: ReceiptUploadInput;
    try {
      validatedData = validateOrThrow(receiptUploadSchema, rawFormData);
    } catch (error) {
      console.error('Receipt upload validation failed:', error, 'User:', user.id);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Invalid file data'
      };
    }

    // SECURITY: Additional file validation
    const fileSize = validatedData.file.size;
    if (fileSize > 10485760) { // 10MB
      return {
        success: false,
        message: 'File size exceeds 10MB limit'
      };
    }

    // Call Flowise API
    const flowiseResponse = await callFlowiseReceiptAPI(validatedData);

    if (!flowiseResponse.success) {
      console.error('Flowise receipt API error:', flowiseResponse.message, 'User:', user.id);
      return {
        success: false,
        message: 'Receipt processing service temporarily unavailable'
      };
    }

    return {
      success: true,
      message: 'Receipt processed successfully',
      data: flowiseResponse.data
    };

  } catch (error) {
    console.error('Unexpected error in processReceipt:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    };
  }
}

async function callFlowiseReceiptAPI(
  validatedData: ReceiptUploadInput
): Promise<{ success: boolean; message: string; data?: ReceiptProcessingResponse }> {
  try {
    // SECURITY: Use server-only environment variables
    const apiHost = process.env.FLOWISE_API_URL;
    const chatflowId = process.env.FLOWISE_RECEIPT_ID;

    if (!apiHost || !chatflowId) {
      console.error('FLOWISE_API_URL and FLOWISE_RECEIPT_ID environment variables must be set');
      throw new Error('Receipt processing service configuration missing');
    }

    // SECURITY: Validate HTTPS URL
    if (!apiHost.startsWith('https://')) {
      console.error('Flowise API URL must use HTTPS:', apiHost);
      throw new Error('Receipt processing service configuration error');
    }

    const flowiseUrl = `${apiHost}/api/v1/prediction/${chatflowId}`;

    // SECURITY: Construct request with size limits
    const requestBody = {
      question: 'Analyze this receipt and extract the business information',
      uploads: [{
        data: `data:${validatedData.file.type};base64,${validatedData.file.data}`,
        type: 'file',
        name: validatedData.file.name,
        mime: validatedData.file.type
      }]
    };

    const requestBodyString = JSON.stringify(requestBody);
    if (requestBodyString.length > 15000000) { // 15MB limit for base64 image
      throw new Error('Request data too large');
    }

    // SECURITY: Add timeout and proper headers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout for image processing

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
      console.error(`Flowise receipt API error: ${response.status} ${response.statusText}`);
      throw new Error('External service error');
    }

    // SECURITY: Limit response size
    const responseText = await response.text();
    if (responseText.length > 50000) { // 50KB limit
      console.error('Flowise receipt API response too large:', responseText.length);
      throw new Error('Response data too large');
    }
    
    // Parse the response using the EXACT same logic as the original client-side code (matching lead generation)
    let parsedResponse;
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

      console.log('Receipt processing response text to parse:', responseContent);

      // EXACT MATCH: Try to extract JSON from the response text (same regex as original)
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      let receiptResponse = null;
      
      if (jsonMatch) {
        try {
          receiptResponse = JSON.parse(jsonMatch[0]);
          console.log('Receipt processing parsed JSON response:', receiptResponse);
        } catch (jsonError) {
          console.error('Receipt processing JSON parse error:', jsonError);
          throw new Error('Failed to parse receipt data from AI response');
        }
      } else {
        throw new Error('No receipt data found in AI response');
      }

      // Validate and normalize the data - use only real AI data, no fallbacks
      if (!receiptResponse || !receiptResponse.businessName) {
        throw new Error('Invalid receipt data structure from AI agent');
      }

      parsedResponse = {
        businessName: String(receiptResponse.businessName).substring(0, 200),
        total: String(receiptResponse.total || receiptResponse.grossTotal || '0.00'),
        date: receiptResponse.date || new Date().toISOString().split('T')[0],
        category: receiptResponse.category || 'General Expense',
        address: receiptResponse.address || '',
        items: Array.isArray(receiptResponse.items) ? receiptResponse.items.slice(0, 50) : [] // Limit items
      };

    } catch (parseError) {
      console.error('Failed to parse Flowise receipt response:', parseError);
      throw new Error('Failed to process receipt data');
    }

    return {
      success: true,
      message: 'Successfully processed receipt',
      data: parsedResponse
    };

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Flowise receipt API timeout');
      return {
        success: false,
        message: 'Receipt processing timed out. Please try again.'
      };
    }
    
    console.error('Flowise receipt API call failed:', error);
    return {
      success: false,
      message: 'Receipt processing service temporarily unavailable'
    };
  }
}