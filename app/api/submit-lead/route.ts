import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { LeadFormData } from '@/types';
import { rateLimit } from '@/utils/rateLimit';
import { goHighLevel } from '@/utils/goHighLevelV2';
import { verifyPhoneNumberWithCache } from '@/utils/phoneVerification';
import { googleSheetsClient, initializeGoogleSheets } from '@/utils/googleSheets';
import { zapierClient } from '@/utils/zapier';

interface OfferLeadData {
  address: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  placeId?: string;
  phone: string;
  fullName: string;
  email: string;
  propertyCondition: string;
  timeline: string;
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
    try {
      data = await request.json();
      console.log('[submit-lead] Parsed data:', { 
        hasAddress: !!data.address,
        hasPhone: !!data.phone,
        hasEmail: !!data.email,
        fullName: data.fullName
      });
    } catch (parseError) {
      console.error('[submit-lead] Error parsing JSON:', parseError);
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Validate data
    if (!validateLeadData(data)) {
      console.error('[submit-lead] Validation failed');
      return NextResponse.json(
        { error: 'Missing required fields or invalid data format' },
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
      streetAddress: data.streetAddress,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      placeId: data.placeId,
      propertyCondition: data.propertyCondition,
      timeframe: data.timeline,
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
      address: data.address,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      source: leadFormData.referralSource
    });

    // Send to Zapier webhook (primary)
    let zapierSuccess = false;
    let zapierError = null;
    
    if (zapierClient.isEnabled()) {
      try {
        console.log('[submit-lead] Sending to Zapier webhook...');
        const zapierResult = await zapierClient.sendToZapierWithRetry(leadFormData);
        
        if (zapierResult.success) {
          console.log('[submit-lead] Successfully sent to Zapier');
          zapierSuccess = true;
        } else {
          console.error('[submit-lead] Failed to send to Zapier:', zapierResult.error);
          zapierError = zapierResult.error;
        }
      } catch (error) {
        console.error('[submit-lead] Unexpected error sending to Zapier:', error);
        zapierError = error instanceof Error ? error.message : 'Unknown Zapier error';
      }
    } else {
      console.log('[submit-lead] Zapier integration is not enabled');
      zapierError = 'Zapier not configured';
    }

    // Send to Google Sheets (backup)
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

    // Send to Go High Level (tertiary)
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
    if (zapierSuccess || googleSheetsSuccess || ghlSuccess) {
      const systems = [];
      if (zapierSuccess) systems.push('Zapier');
      if (googleSheetsSuccess) systems.push('Google Sheets');
      if (ghlSuccess) systems.push('Go High Level');
      
      console.log('[submit-lead] Lead captured successfully in:', systems.join(', '), {
        leadId,
        timestamp
      });

      if (!zapierSuccess && zapierError) {
        console.warn('[submit-lead] Zapier failed but lead was saved to backup:', zapierError);
      }

      return NextResponse.json({ 
        success: true,
        leadId,
        message: 'Your information has been received. We will contact you within 24 hours.',
        systems: systems,
        warning: !zapierSuccess ? 'Lead saved to backup systems' : undefined
      });
    } else {
      // All systems failed
      throw new Error(`Failed to save lead to any system. Zapier: ${zapierError}, Sheets: Failed, GHL: ${ghlError}`);
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