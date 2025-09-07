import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { LeadFormData } from '@/types';
import { rateLimit } from '@/utils/rateLimit';
import { goHighLevel } from '@/utils/goHighLevelV2';
import { verifyPhoneNumberWithCache } from '@/utils/phoneVerification';
import { googleSheetsClient, initializeGoogleSheets } from '@/utils/googleSheets';
import { validateAndTransformLead, parsePrice } from '@/lib/validation/leadSchema';
import { z, ZodError } from 'zod';

interface OfferLeadData {
  address: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  placeId?: string;
  phone: string;
  fullName: string;
  email: string;
  propertyCondition: string;
  timeline: string;
  askingPrice?: string;
  source?: string;
  timestamp?: string;
}

function validateLeadData(data: any): data is OfferLeadData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const requiredFields = ['address', 'phone', 'fullName', 'email', 'propertyCondition', 'timeline'];
  
  for (const field of requiredFields) {
    if (!data[field]) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    console.error('Invalid email format');
    return false;
  }

  // Phone validation (accepts various formats)
  const phoneDigits = data.phone.replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    console.error('Invalid phone number');
    return false;
  }

  return true;
}

/**
 * API Route for the /offer page lead submission
 * This is a complete submission with all required information
 */
export async function POST(request: Request) {
  const timestamp = new Date().toISOString();
  const leadId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  try {
    console.log('[submit-lead] Received request');
    
    // Apply rate limiting
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    
    const rateLimitResult = await rateLimit(ip);
    if (!rateLimitResult.success) {
      console.log('[submit-lead] Rate limit exceeded for IP:', ip);
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      );
    }
    
    // Parse request data
    let data: OfferLeadData;
    let validatedData: any;
    try {
      data = await request.json();
      console.log('[submit-lead] Parsed data:', { 
        hasAddress: !!data.address,
        hasAddressLine1: !!data.addressLine1,
        hasCity: !!data.city,
        hasState: !!data.state,
        hasPhone: !!data.phone,
        hasEmail: !!data.email,
        fullName: data.fullName,
        askingPrice: data.askingPrice
      });
      
      // Validate and transform data with Zod
      try {
        validatedData = validateAndTransformLead(data, true);
        console.log('[submit-lead] Validated data with parsed price:', validatedData.price);
      } catch (zodError: any) {
        if (zodError?.errors && Array.isArray(zodError.errors)) {
          const errors = zodError.errors.map((e: any) => `${e.path?.join('.') || ''}: ${e.message}`).join(', ');
          console.error('[submit-lead] Validation failed:', errors);
          return NextResponse.json(
            { error: 'Validation failed', details: errors },
            { status: 400 }
          );
        }
        throw zodError;
      }
    } catch (parseError) {
      console.error('[submit-lead] Error parsing JSON:', parseError);
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Additional validation for critical fields
    if (!data.address || !data.phone || !data.email || !data.fullName) {
      console.error('[submit-lead] Missing critical fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Format phone number
    const phoneDigits = data.phone.replace(/\D/g, '');
    const formattedPhone = phoneDigits.length === 10 
      ? `(${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3, 6)}-${phoneDigits.slice(6)}`
      : data.phone;

    // Verify phone number with Numverify
    const phoneVerification = await verifyPhoneNumberWithCache(formattedPhone);
    if (!phoneVerification.isValid) {
      console.error('[submit-lead] Phone verification failed:', phoneVerification.error);
      return NextResponse.json(
        { error: phoneVerification.error || 'Invalid phone number' },
        { status: 400 }
      );
    }
    console.log('[submit-lead] Phone verified successfully');

    // Split full name into first and last name
    const nameParts = data.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || nameParts[0] || ''; // Use first name as last if only one name

    // Prepare lead data for GHL and Google Sheets
    const leadFormData: LeadFormData = {
      leadId,
      firstName,
      lastName,
      email: data.email.toLowerCase(),
      phone: formattedPhone,
      address: data.address,
      streetAddress: validatedData.addressLine1 || data.addressLine1 || '',
      city: validatedData.city || data.city || '',
      state: validatedData.state || data.state || '',
      postalCode: validatedData.postalCode || data.postalCode || '',
      placeId: data.placeId,
      propertyCondition: data.propertyCondition,
      timeframe: data.timeline,
      price: validatedData.price?.toString() || data.askingPrice || '',
      timestamp,
      lastUpdated: timestamp,
      submissionType: 'complete',
      referralSource: data.source || 'offer-page',
      consent: true // User implicitly consents by submitting the form
    };

    console.log('[submit-lead] Prepared lead data:', {
      leadId,
      firstName,
      lastName,
      streetAddress: leadFormData.streetAddress,
      city: leadFormData.city,
      state: leadFormData.state,
      price: leadFormData.price,
      source: leadFormData.referralSource
    });

    // Send to Google Sheets
    let googleSheetsSuccess = false;
    try {
      await initializeGoogleSheets();
      googleSheetsSuccess = await googleSheetsClient.appendPropertyLead(leadFormData);
      if (googleSheetsSuccess) {
        console.log('[submit-lead] Successfully sent to Google Sheets');
      } else {
        console.error('[submit-lead] Failed to send to Google Sheets');
      }
    } catch (error) {
      console.error('[submit-lead] Error sending to Google Sheets:', error);
    }

    // Send to Go High Level
    let ghlSuccess = false;
    let ghlError = null;
    
    if (goHighLevel.isEnabled()) {
      try {
        const ghlFormattedData = goHighLevel.formatFormData(leadFormData);
        const ghlResult = await goHighLevel.sendLeadWithRetry(ghlFormattedData);
        
        if (ghlResult.success) {
          console.log('[submit-lead] Successfully sent to Go High Level');
          ghlSuccess = true;
        } else {
          console.error('[submit-lead] Failed to send to Go High Level:', ghlResult.error);
          ghlError = ghlResult.error;
        }
      } catch (error) {
        console.error('[submit-lead] Unexpected error sending to Go High Level:', error);
        ghlError = error instanceof Error ? error.message : 'Unknown GHL error';
      }
    } else {
      console.log('[submit-lead] Go High Level integration is not enabled');
      ghlError = 'GHL not configured';
    }

    // Check if at least one system captured the lead
    if (googleSheetsSuccess || ghlSuccess) {
      console.log('[submit-lead] Lead captured successfully:', {
        leadId,
        googleSheets: googleSheetsSuccess,
        goHighLevel: ghlSuccess,
        timestamp
      });

      if (!ghlSuccess && ghlError) {
        console.warn('[submit-lead] GHL failed but lead was saved to Google Sheets:', ghlError);
      }

      return NextResponse.json({ 
        success: true,
        leadId,
        message: 'Your information has been received. We will contact you within 24 hours.',
        warning: !ghlSuccess ? 'Lead saved to backup system' : undefined
      });
    } else {
      // Both systems failed
      throw new Error(`Failed to save lead to any system. GHL: ${ghlError}, Sheets: Failed`);
    }

  } catch (error) {
    console.error('[submit-lead] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        error: 'An error occurred while processing your request',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return NextResponse.json(
    { error: 'Method not allowed. This endpoint only accepts POST requests.' },
    { status: 405 }
  );
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}