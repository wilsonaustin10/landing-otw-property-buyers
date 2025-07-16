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
  private locationId: string;
  private authType: 'jwt' | 'apikey';

  constructor() {
    this.apiKey = process.env.GHL_API_KEY || '';
    this.endpoint = process.env.NEXT_PUBLIC_GHL_ENDPOINT || '';
    this.enabled = Boolean(this.apiKey && this.endpoint);
    
    // Determine auth type based on token format
    this.authType = this.apiKey.startsWith('eyJ') ? 'jwt' : 'apikey';
    
    // Extract location ID from JWT token if available
    this.locationId = '';
    if (this.apiKey && this.authType === 'jwt') {
      try {
        const tokenParts = this.apiKey.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          this.locationId = payload.location_id || '';
          console.log('Extracted location ID from JWT:', this.locationId);
        }
      } catch (error) {
        console.error('Failed to extract location ID from token:', error);
      }
    } else if (this.authType === 'apikey') {
      // For API key auth, location ID might need to be provided separately
      this.locationId = process.env.GHL_LOCATION_ID || '';
      console.log('Using location ID from env:', this.locationId);
    }
    
    console.log('GHL Service initialized:', {
      authType: this.authType,
      hasApiKey: !!this.apiKey,
      endpoint: this.endpoint,
      locationId: this.locationId
    });
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async sendContact(data: GHLContactData): Promise<{ success: boolean; data?: GHLResponse; error?: string }> {
    if (!this.enabled) {
      return { success: false, error: 'Go High Level integration is not configured' };
    }

    try {
      const requestBody = {
        ...data,
        locationId: this.locationId,
        source: data.source || 'Website Form',
      };

      console.log('Sending to GHL:', {
        endpoint: this.endpoint,
        authType: this.authType,
        hasAuth: !!this.apiKey,
        locationId: this.locationId,
        body: requestBody
      });

      // Build headers based on auth type
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Version': '2021-07-28',
      };
      
      // Set authorization header based on auth type
      if (this.authType === 'jwt') {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      } else {
        // For API key, try both header formats
        headers['Authorization'] = `Bearer ${this.apiKey}`;
        // Some accounts might use this format
        headers['X-API-Key'] = this.apiKey;
      }

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      let responseData: any;
      const responseText = await response.text();
      
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse GHL response:', responseText);
        responseData = { message: responseText };
      }

      if (!response.ok) {
        console.error('GHL API Error:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data: responseData,
          endpoint: this.endpoint,
          authType: this.authType,
          locationId: this.locationId
        });
        
        // Special handling for auth errors
        if (response.status === 401) {
          if (this.authType === 'jwt') {
            console.error('JWT Authentication Failed - Token may be expired or invalid');
            console.error('Consider using an API Key instead of JWT');
          } else {
            console.error('API Key Authentication Failed');
          }
          console.error('Auth info:', {
            tokenLength: this.apiKey.length,
            tokenPrefix: this.apiKey.substring(0, 20) + '...',
            authType: this.authType
          });
        }
        
        return {
          success: false,
          error: responseData.message || responseData.error || `API returned ${response.status}`,
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
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      email: formData.email || '',
      phone: formData.phone || '',
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