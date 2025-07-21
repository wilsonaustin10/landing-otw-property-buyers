import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { LeadFormData } from '@/types';
import { rateLimit } from '@/utils/rateLimit';
import { goHighLevel } from '@/utils/goHighLevelV2';
import { verifyPhoneNumberWithCache } from '@/utils/phoneVerification';

// Validate partial form data (only address and phone)
function validatePartialData(data: Partial<LeadFormData>): boolean {
  if (!data || typeof data !== 'object') return false;
  
  // Check required fields
  if (!data.address || !data.phone) return false;
  
  // Phone validation
  const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
  if (!phoneRegex.test(data.phone)) return false;
  
  return true;
}


/**
 * API Route for saving initial lead data (address and phone)
 * Called when user clicks first "Get Cash Offer" button
 */
export async function POST(request: Request) {
  const timestamp = new Date().toISOString();
  const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Log incoming request
    console.log('Received partial form submission request');

    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    
    // Apply rate limiting
    const rateLimitResult = await rateLimit(ip);
    if (!rateLimitResult.success) {
      console.log('Rate limit exceeded for IP:', ip);
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      );
    }

    // Parse and validate request data
    let data;
    try {
      data = await request.json();
      console.log('Received form data:', {
        hasAddress: !!data.address,
        hasPhone: !!data.phone,
        phone: data.phone
      });
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    if (!validatePartialData(data)) {
      console.error('Invalid form data:', data);
      return NextResponse.json(
        { error: 'Invalid partial form data - Missing required fields or invalid format' },
        { status: 400 }
      );
    }

    // Verify phone number with Numverify
    const phoneVerification = await verifyPhoneNumberWithCache(data.phone);
    if (!phoneVerification.isValid) {
      console.error('Phone verification failed:', phoneVerification.error);
      return NextResponse.json(
        { error: phoneVerification.error || 'Invalid phone number' },
        { status: 400 }
      );
    }
    console.log('Phone verified successfully:', {
      number: phoneVerification.phoneNumber,
      lineType: phoneVerification.lineType,
      carrier: phoneVerification.carrier
    });

    // Prepare data with timestamp and tracking
    const leadData: Partial<LeadFormData> = {
      ...data,
      timestamp,
      lastUpdated: timestamp,
      leadId,
      submissionType: 'partial'
    };

    console.log('Prepared lead data:', {
      leadId,
      timestamp,
      submissionType: 'partial'
    });

    // Debug: Log environment variable status
    console.log('Environment check:', {
      hasGhlApiKey: !!process.env.GHL_API_KEY,
      hasGhlEndpoint: !!process.env.NEXT_PUBLIC_GHL_ENDPOINT,
      ghlEndpoint: process.env.NEXT_PUBLIC_GHL_ENDPOINT,
      ghlEnabled: goHighLevel.isEnabled()
    });

    // Send to Go High Level
    if (!goHighLevel.isEnabled()) {
      throw new Error('Go High Level integration is not configured. Please check environment variables.');
    }

    try {
      const ghlResult = await goHighLevel.sendLeadWithRetry(goHighLevel.formatFormData(leadData));
      if (ghlResult.success) {
        console.log('Successfully sent to Go High Level');
        return NextResponse.json({ 
          success: true,
          leadId
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
    console.error('Error submitting partial form:', error);
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