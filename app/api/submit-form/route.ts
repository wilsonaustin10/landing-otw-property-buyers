import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { LeadFormData } from '@/types';
import { rateLimit } from '@/utils/rateLimit';
import { goHighLevel } from '@/utils/goHighLevel';

// Validate complete form data
function validateFormData(data: Partial<LeadFormData>): data is LeadFormData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format');
  }

  // Required fields validation
  const requiredFields: (keyof LeadFormData)[] = [
    'address', 'phone', 'firstName', 'lastName', 
    'email', 'propertyCondition', 'timeframe', 'price',
    'leadId'
  ];
  
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`${field} is required`);
    }
  }

  // Phone number validation
  const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
  if (!phoneRegex.test(data.phone as string)) {
    throw new Error('Invalid phone number format');
  }

  return true;
}


/**
 * API Route for saving complete property details
 * Used for full form submissions with all property information
 */
export async function POST(request: Request) {
  try {
    // Log incoming request
    console.log('Received complete form submission request');

    // 1. Rate limiting check
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    const timestamp = new Date().toISOString();
    
    const rateLimitResult = await rateLimit(ip);
    if (!rateLimitResult.success) {
      console.log('Rate limit exceeded for IP:', ip);
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      );
    }

    // 2. Parse and validate request data
    let data;
    try {
      data = await request.json();
      console.log('Received form data:', {
        hasRequiredFields: true,
        leadId: data.leadId
      });
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    if (!validateFormData(data)) {
      console.error('Invalid form data:', data);
      return NextResponse.json(
        { error: 'Invalid form data - Missing required fields or invalid format' },
        { status: 400 }
      );
    }

    // 3. Prepare data with tracking information
    const formData: LeadFormData = {
      ...data,
      timestamp: data.timestamp || timestamp,
      lastUpdated: timestamp
    };

    // Debug: Log environment variable status
    console.log('Environment check:', {
      hasGhlApiKey: !!process.env.GHL_API_KEY,
      hasGhlEndpoint: !!process.env.NEXT_PUBLIC_GHL_ENDPOINT,
      ghlEndpoint: process.env.NEXT_PUBLIC_GHL_ENDPOINT,
      ghlEnabled: goHighLevel.isEnabled()
    });

    // 4. Send to Go High Level
    if (!goHighLevel.isEnabled()) {
      throw new Error('Go High Level integration is not configured. Please check environment variables.');
    }

    try {
      const ghlResult = await goHighLevel.sendLeadWithRetry(goHighLevel.formatFormData(formData));
      if (ghlResult.success) {
        console.log('Successfully sent to Go High Level');
        return NextResponse.json({ 
          success: true,
          leadId: data.leadId
        });
      } else {
        console.error('Failed to send to Go High Level:', ghlResult.error);
        throw new Error(`Go High Level integration failed: ${ghlResult.error}`);
      }
    } catch (error) {
      console.error('Unexpected error sending to Go High Level:', error);
      throw error;
    }

  } catch (error) {
    console.error('Error submitting complete form:', error);
    // Return a specific error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
} 