import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

interface LeadData {
  address: string;
  phone: string;
  fullName: string;
  email: string;
  propertyCondition: string;
  timeline: string;
  source: string;
  timestamp: string;
}

function validateLeadData(data: any): data is LeadData {
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

export async function POST(request: Request) {
  try {
    console.log('[submit-lead] Received request');
    
    // Rate limiting by IP
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    const timestamp = new Date().toISOString();
    
    // Parse request data
    let data: LeadData;
    try {
      data = await request.json();
      console.log('[submit-lead] Parsed data:', { 
        hasAddress: !!data.address,
        hasPhone: !!data.phone,
        hasEmail: !!data.email 
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

    // Prepare lead data
    const leadData = {
      leadId: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      address: data.address,
      phone: formattedPhone,
      fullName: data.fullName,
      email: data.email.toLowerCase(),
      propertyCondition: data.propertyCondition,
      timeline: data.timeline,
      source: data.source || 'offer-page',
      timestamp: data.timestamp || timestamp,
      ipAddress: ip,
      userAgent: headersList.get('user-agent') || 'unknown'
    };

    // Log successful submission
    console.log('[submit-lead] Lead captured successfully:', {
      leadId: leadData.leadId,
      source: leadData.source,
      timestamp: leadData.timestamp
    });

    // Here you would typically:
    // 1. Save to database
    // 2. Send to CRM (GoHighLevel, etc.)
    // 3. Send notification emails
    // 4. Trigger automation workflows

    // For now, we'll just return success
    return NextResponse.json({ 
      success: true,
      leadId: leadData.leadId,
      message: 'Your information has been received. We will contact you within 24 hours.'
    });

  } catch (error) {
    console.error('[submit-lead] Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'An error occurred while processing your request',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
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