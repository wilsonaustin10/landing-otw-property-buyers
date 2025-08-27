import { LeadFormData } from '@/types';

interface ZapierWebhookData {
  leadId: string;
  timestamp: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  postalCode?: string;
  placeId?: string;
  propertyCondition?: string;
  propertyListed?: boolean;
  timeframe?: string;
  timeline?: string;
  price?: string;
  referralSource?: string;
  submissionType?: string;
  lastUpdated?: string;
}

class ZapierClient {
  private webhookUrl: string | undefined;
  private enabled: boolean;

  constructor() {
    this.webhookUrl = process.env.ZAPIER_WEBHOOK_URL;
    this.enabled = !!this.webhookUrl;
    
    if (this.enabled) {
      console.log('[Zapier] Integration enabled with webhook URL');
    } else {
      console.log('[Zapier] Integration disabled - no webhook URL configured');
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  formatLeadData(data: LeadFormData): ZapierWebhookData {
    const zapierData: ZapierWebhookData = {
      leadId: data.leadId || `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: data.timestamp || new Date().toISOString(),
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: data.firstName && data.lastName 
        ? `${data.firstName} ${data.lastName}`.trim() 
        : data.firstName || data.lastName || '',
      email: data.email || '',
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      placeId: data.placeId,
      propertyCondition: data.propertyCondition,
      propertyListed: data.isPropertyListed,
      timeframe: data.timeframe,
      timeline: data.timeframe,
      price: data.price,
      referralSource: data.referralSource || 'website',
      submissionType: data.submissionType || 'complete',
      lastUpdated: data.lastUpdated || new Date().toISOString()
    };

    return zapierData;
  }

  async sendToZapier(data: LeadFormData): Promise<{ success: boolean; error?: string }> {
    if (!this.enabled || !this.webhookUrl) {
      console.log('[Zapier] Skipping - integration not enabled');
      return { success: false, error: 'Zapier integration not configured' };
    }

    try {
      console.log('[Zapier] Sending lead data to webhook...');
      const zapierData = this.formatLeadData(data);
      
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(zapierData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Zapier] Webhook returned error:', response.status, errorText);
        return { 
          success: false, 
          error: `Zapier webhook failed: ${response.status}` 
        };
      }

      console.log('[Zapier] Successfully sent lead to webhook');
      return { success: true };
      
    } catch (error) {
      console.error('[Zapier] Error sending to webhook:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async sendToZapierWithRetry(
    data: LeadFormData,
    maxAttempts: number = 3
  ): Promise<{ success: boolean; error?: string }> {
    let lastError: string | undefined;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`[Zapier] Attempt ${attempt} of ${maxAttempts}`);
      
      const result = await this.sendToZapier(data);
      
      if (result.success) {
        return result;
      }
      
      lastError = result.error;
      
      if (attempt < maxAttempts) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`[Zapier] Retrying after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    console.error('[Zapier] All attempts failed');
    return { success: false, error: lastError || 'All retry attempts failed' };
  }
}

export const zapierClient = new ZapierClient();