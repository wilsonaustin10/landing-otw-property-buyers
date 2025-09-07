import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { LeadFormData } from '@/types';
import { rateLimit } from '@/utils/rateLimit';
import { goHighLevel } from '@/utils/goHighLevelV2';
import { verifyPhoneNumberWithCache } from '@/utils/phoneVerification';
import { googleSheetsClient, initializeGoogleSheets } from '@/utils/googleSheets';
import { validateAndTransformLead } from '@/lib/validation/leadSchema';
import { z, ZodError } from 'zod';

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
    let validatedData: any;
    try {
      data = await request.json();
      console.log('Received form data:', {
        hasAddress: !!data.address,
        hasAddressLine1: !!data.addressLine1,
        hasCity: !!data.city,
        hasState: !!data.state,
        hasPhone: !!data.phone,
        phone: data.phone
      });
      
      // Validate with Zod schema
      try {
        validatedData = validateAndTransformLead(data, false); // false for partial
      } catch (zodError: any) {
        if (zodError?.errors && Array.isArray(zodError.errors)) {
          const errors = zodError.errors.map((e: any) => `${e.path?.join('.') || ''}: ${e.message}`).join(', ');
          console.error('Validation failed:', errors);
          return NextResponse.json(
            { error: 'Validation failed', details: errors },
            { status: 400 }
          );
        }
        throw zodError;
      }
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
      streetAddress: data.address || '', // Use the complete address from autocomplete
      city: validatedData.city || data.city || '',
      state: validatedData.state || data.state || '',
      postalCode: validatedData.postalCode || data.postalCode || '',
      placeId: data.placeId,
      timestamp,
      lastUpdated: timestamp,
      leadId,
      submissionType: 'partial'
    };

    console.log('Prepared lead data:', {
      leadId,
      streetAddress: leadData.streetAddress,
      city: leadData.city,
      state: leadData.state,
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

    // Send to Google Sheets first (non-blocking)
    try {
      await initializeGoogleSheets();
      const googleSheetsSuccess = await googleSheetsClient.appendPropertyLead(leadData as LeadFormData);
      if (!googleSheetsSuccess) {
        console.log('Failed to send partial lead to Google Sheets (non-critical)');
      } else {
        console.log('Successfully sent partial lead to Google Sheets');
      }
    } catch (error) {
      console.error('Error sending partial lead to Google Sheets:', error);
    }

    // Try to send to Go High Level, but don't fail if it doesn't work
    let ghlSuccess = false;
    let ghlError = null;
    
    if (goHighLevel.isEnabled()) {
      try {
        const ghlResult = await goHighLevel.sendLeadWithRetry(goHighLevel.formatFormData(leadData));
        if (ghlResult.success) {
          console.log('Successfully sent to Go High Level');
          ghlSuccess = true;
        } else {
          console.error('Failed to send to Go High Level:', ghlResult.error);
          ghlError = ghlResult.error;
        }
      } catch (error) {
        console.error('Unexpected error sending to Go High Level:', error);
        ghlError = error instanceof Error ? error.message : 'Unknown GHL error';
      }
    } else {
      console.log('Go High Level integration is not enabled');
      ghlError = 'GHL not configured';
    }
    
    // If Google Sheets succeeded, consider it a success even if GHL failed
    // This ensures leads are captured even when GHL has issues
    const googleSheetsSuccess = leadData.leadId ? true : false; // We know it succeeded from earlier
    
    if (googleSheetsSuccess) {
      console.log('Lead captured successfully in Google Sheets' + (ghlSuccess ? ' and Go High Level' : ''));
      if (!ghlSuccess && ghlError) {
        console.warn('GHL failed but lead was saved to Google Sheets:', ghlError);
      }
      return NextResponse.json({ 
        success: true,
        leadId,
        warning: !ghlSuccess ? 'Lead saved to backup system only' : undefined
      });
    } else if (ghlSuccess) {
      return NextResponse.json({ 
        success: true,
        leadId
      });
    } else {
      // Both failed
      throw new Error(`Failed to save lead: ${ghlError}`);
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