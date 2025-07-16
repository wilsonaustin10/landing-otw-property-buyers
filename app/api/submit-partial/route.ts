import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { LeadFormData } from '@/types';
import { rateLimit } from '@/utils/rateLimit';
import { goHighLevel } from '@/utils/goHighLevel';

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

// Send data to Zapier webhook
async function sendToZapier(data: Partial<LeadFormData>) {
  // Debug log to check environment variable
  console.log('ZAPIER_WEBHOOK_URL value:', process.env.ZAPIER_WEBHOOK_URL);
  
  // Use environment variable or fallback to the value from .env.local if it exists
  const webhookUrl = process.env.ZAPIER_WEBHOOK_URL;
  
  if (!webhookUrl || webhookUrl === 'YOUR_ZAPIER_WEBHOOK_URL') {
    console.log('Zapier webhook URL not configured, skipping Zapier integration');
    return null;
  }

  try {
    // Create a formatted payload for Zapier
    const payload = {
      ...data,
      submissionType: 'partial',
      formattedTimestamp: new Date().toLocaleString(),
      phoneRaw: data.phone ? data.phone.replace(/\D/g, '') : ''
    };

    // Send to Zapier webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Zapier webhook error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Failed to send to Zapier: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in sendToZapier:', error);
    throw error;
  }
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

    // Send to Go High Level first (if enabled)
    let ghlSuccess = false;
    if (goHighLevel.isEnabled()) {
      try {
        const ghlResult = await goHighLevel.sendLeadWithRetry(goHighLevel.formatFormData(leadData));
        if (ghlResult.success) {
          console.log('Successfully sent to Go High Level');
          ghlSuccess = true;
        } else {
          console.error('Failed to send to Go High Level:', ghlResult.error);
        }
      } catch (error) {
        console.error('Unexpected error sending to Go High Level:', error);
      }
    }

    // Send to Zapier webhook (if configured)
    let zapierSuccess = false;
    try {
      const zapierResult = await sendToZapier(leadData);
      if (zapierResult !== null) {
        console.log('Successfully sent to Zapier webhook');
        zapierSuccess = true;
      }
    } catch (error) {
      console.error('Failed to send to Zapier:', error);
    }

    // Return success if at least one integration worked
    if (ghlSuccess || zapierSuccess) {
      return NextResponse.json({ 
        success: true,
        leadId
      });
    } else if (!goHighLevel.isEnabled() && !zapierSuccess) {
      throw new Error('No CRM integration configured or all integrations failed');
    } else {
      throw new Error('All CRM integrations failed');
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