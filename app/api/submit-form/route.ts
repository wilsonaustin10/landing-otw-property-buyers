import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { LeadFormData } from '@/types';
import { rateLimit } from '@/utils/rateLimit';
import { goHighLevel } from '@/utils/goHighLevelV2';
import { verifyRecaptchaToken } from '@/utils/recaptcha';
import { verifyPhoneNumberWithCache } from '@/utils/phoneVerification';
import { googleSheetsClient, initializeGoogleSheets } from '@/utils/googleSheets';

// Validate complete form data
function validateFormData(data: Partial<LeadFormData>): data is LeadFormData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format');
  }

  // Required fields validation (leadId is optional, will be generated if missing)
  const requiredFields: (keyof LeadFormData)[] = [
    'address', 'phone', 'firstName', 'lastName', 
    'email', 'propertyCondition', 'timeframe', 'price'
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

    // 2a. Verify reCAPTCHA token
    if (data.recaptchaToken) {
      const recaptchaResult = await verifyRecaptchaToken(data.recaptchaToken, 'submit_lead_form');
      if (!recaptchaResult.success) {
        console.error('reCAPTCHA verification failed');
        return NextResponse.json(
          { error: 'reCAPTCHA verification failed' },
          { status: 400 }
        );
      }
      console.log('reCAPTCHA verified successfully, score:', recaptchaResult.score);
      // Remove the token from data before processing
      delete data.recaptchaToken;
    }

    if (!validateFormData(data)) {
      console.error('Invalid form data:', data);
      return NextResponse.json(
        { error: 'Invalid form data - Missing required fields or invalid format' },
        { status: 400 }
      );
    }

    // 2b. Verify phone number with Numverify
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

    // 3. Prepare data with tracking information
    // Generate leadId if not provided (for cases where partial submission was skipped)
    const leadId = data.leadId || `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const formData: LeadFormData = {
      ...data,
      leadId: leadId,
      timestamp: data.timestamp || timestamp,
      lastUpdated: timestamp,
      submissionType: 'complete' // Mark this as a complete submission
    };

    // Debug: Log environment variable status
    console.log('[API] Environment check:', {
      hasGhlApiKey: !!process.env.GHL_API_KEY,
      ghlApiKeyLength: process.env.GHL_API_KEY?.length || 0,
      ghlApiKeyPrefix: process.env.GHL_API_KEY?.substring(0, 20) + '...' || 'none',
      hasGhlEndpoint: !!process.env.NEXT_PUBLIC_GHL_ENDPOINT,
      ghlEndpoint: process.env.NEXT_PUBLIC_GHL_ENDPOINT,
      ghlEnabled: goHighLevel.isEnabled(),
      nodeEnv: process.env.NODE_ENV
    });

    // 4. Send to Google Sheets (non-blocking)
    try {
      await initializeGoogleSheets();
      if (formData.leadId) {
        const googleSheetsSuccess = await googleSheetsClient.updatePropertyLead(formData.leadId, formData);
        if (!googleSheetsSuccess) {
          console.log('Failed to update lead in Google Sheets (non-critical)');
        } else {
          console.log('Successfully updated lead in Google Sheets');
        }
      } else {
        const googleSheetsSuccess = await googleSheetsClient.appendPropertyLead(formData);
        if (!googleSheetsSuccess) {
          console.log('Failed to append lead to Google Sheets (non-critical)');
        } else {
          console.log('Successfully appended lead to Google Sheets');
        }
      }
    } catch (error) {
      console.error('Error sending to Google Sheets:', error);
    }

    // 5. Send to Go High Level
    if (!goHighLevel.isEnabled()) {
      throw new Error('Go High Level integration is not configured. Please check environment variables.');
    }

    try {
      console.log('[API] Formatting data for GHL...');
      const ghlFormattedData = goHighLevel.formatFormData(formData);
      console.log('[API] Sending to GHL with retry...');
      const ghlResult = await goHighLevel.sendLeadWithRetry(ghlFormattedData);
      
      if (ghlResult.success) {
        console.log('[API] Successfully sent to Go High Level');
        return NextResponse.json({ 
          success: true,
          leadId: leadId
        });
      } else {
        console.error('[API] Failed to send to Go High Level:', ghlResult.error);
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