interface GHLContactData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  source?: string;
  customField?: Record<string, any>;
  tags?: string[];
}

interface GHLResponse {
  contact?: {
    id: string;
    locationId: string;
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  };
  error?: string;
  message?: string;
}

export class GoHighLevelService {
  private apiKey: string;
  private endpoint: string;
  private enabled: boolean;

  constructor() {
    this.apiKey = process.env.GHL_API_KEY || '';
    this.endpoint = process.env.NEXT_PUBLIC_GHL_ENDPOINT || '';
    this.enabled = Boolean(this.apiKey && this.endpoint);
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async sendContact(data: GHLContactData): Promise<{ success: boolean; data?: GHLResponse; error?: string }> {
    if (!this.enabled) {
      return { success: false, error: 'Go High Level integration is not configured' };
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          source: data.source || 'Website Form',
        }),
      });

      const responseData = await response.json() as GHLResponse;

      if (!response.ok) {
        console.error('GHL API Error:', responseData);
        return {
          success: false,
          error: responseData.message || `API returned ${response.status}`,
        };
      }

      return { success: true, data: responseData };
    } catch (error) {
      console.error('GHL Integration Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sendLeadWithRetry(data: GHLContactData, maxRetries = 3): Promise<{ success: boolean; error?: string }> {
    let attempt = 0;
    let lastError = '';

    while (attempt < maxRetries) {
      attempt++;
      
      const result = await this.sendContact(data);
      
      if (result.success) {
        return { success: true };
      }

      lastError = result.error || 'Unknown error';
      
      // Don't retry on certain errors
      if (lastError.includes('401') || lastError.includes('403')) {
        break;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    return { success: false, error: `Failed after ${attempt} attempts: ${lastError}` };
  }

  // Format form data for Go High Level
  formatFormData(formData: any): GHLContactData {
    const ghlData: GHLContactData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      customField: {
        propertyAddress: formData.address,
        propertyCondition: formData.propertyCondition,
        timeframe: formData.timeframe,
        askingPrice: formData.price,
        isPropertyListed: formData.isPropertyListed,
        submissionType: formData.submissionType,
        leadId: formData.leadId,
      },
      tags: ['Website Lead', formData.submissionType === 'partial' ? 'Partial Lead' : 'Complete Lead'],
    };

    // Parse address if available
    if (formData.address) {
      const addressParts = formData.address.split(',').map((part: string) => part.trim());
      if (addressParts.length >= 3) {
        ghlData.address1 = addressParts[0];
        ghlData.city = addressParts[1];
        const stateZip = addressParts[2].split(' ');
        if (stateZip.length >= 2) {
          ghlData.state = stateZip[0];
          ghlData.postalCode = stateZip[1];
        }
      }
    }

    return ghlData;
  }
}

// Export singleton instance
export const goHighLevel = new GoHighLevelService();