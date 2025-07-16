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

  constructor() {
    this.apiKey = process.env.GHL_API_KEY || '';
    this.endpoint = process.env.NEXT_PUBLIC_GHL_ENDPOINT || '';
    this.enabled = Boolean(this.apiKey && this.endpoint);
    
    // Extract location ID from JWT token if available
    this.locationId = '';
    if (this.apiKey) {
      try {
        const tokenParts = this.apiKey.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          this.locationId = payload.location_id || '';
          console.log('Extracted location ID:', this.locationId);
          
          // Check if token has millisecond timestamps (common GHL issue)
          if (payload.iat && payload.iat > 1000000000000) {
            console.warn('WARNING: JWT token has millisecond timestamps. This is a known GHL issue.');
            console.warn('Token iat:', new Date(payload.iat).toISOString());
          }
        }
      } catch (error) {
        console.error('Failed to extract location ID from token:', error);
      }
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async sendContact(data: GHLContactData): Promise<{ success: boolean; data?: GHLResponse; error?: string }> {
    if (!this.enabled) {
      return { success: false, error: 'Go High Level integration is not configured' };
    }

    try {
      // Format body according to GHL v1 API requirements
      const requestBody: any = {
        source: data.source || 'Website Form',
      };
      
      // Only add fields if they have values (not empty strings)
      if (data.firstName && data.firstName.trim()) requestBody.firstName = data.firstName;
      if (data.lastName && data.lastName.trim()) requestBody.lastName = data.lastName;
      if (data.email && data.email.trim()) requestBody.email = data.email;
      if (data.phone && data.phone.trim()) requestBody.phone = data.phone;
      
      // Add optional fields if present
      if (data.address1) requestBody.address1 = data.address1;
      if (data.city) requestBody.city = data.city;
      if (data.state) requestBody.state = data.state;
      if (data.postalCode) requestBody.postalCode = data.postalCode;
      if (data.tags && data.tags.length > 0) requestBody.tags = data.tags;
      
      // Add custom fields
      if (data.customField && Object.keys(data.customField).length > 0) {
        requestBody.customField = data.customField;
      }

      console.log('Sending to GHL:', {
        endpoint: this.endpoint,
        hasAuth: !!this.apiKey,
        locationId: this.locationId,
        body: requestBody
      });

      // Build headers for GoHighLevel API v1
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      };

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
          locationId: this.locationId
        });
        
        // Special handling for JWT errors
        if (response.status === 401 || (responseData && typeof responseData === 'string' && responseData.includes('Invalid JWT'))) {
          console.error('JWT Authentication Failed - Token may be expired or invalid');
          console.error('JWT Token info:', {
            tokenLength: this.apiKey.length,
            tokenPrefix: this.apiKey.substring(0, 20) + '...',
            extractedLocationId: this.locationId
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

  async searchContactByLeadId(leadId: string): Promise<{ success: boolean; contactId?: string; error?: string }> {
    if (!this.enabled) {
      return { success: false, error: 'Go High Level integration is not configured' };
    }

    try {
      console.log('Searching for contact with leadId:', leadId);
      
      // Search for contacts with the leadId in custom fields
      // Note: GHL v1 API doesn't have a direct search endpoint, so we'll need to use a different approach
      // For now, we'll return success: false to indicate no existing contact found
      // In production, you would use GHL's search API or webhooks to track contact IDs
      
      return { success: false, error: 'Search not implemented in v1 API' };
    } catch (error) {
      console.error('Error searching contact:', error);
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
    // For partial submissions without name, use a simple numbering system
    const isPartial = formData.submissionType === 'partial';
    const hasName = formData.firstName || formData.lastName;
    
    // Create a unique identifier based on timestamp
    let firstName = formData.firstName || '';
    let lastName = formData.lastName || '';
    
    if (isPartial && !hasName) {
      // Use a simple numbering system for partial submissions
      // Extract numbers from the leadId to create a unique but readable identifier
      const leadIdNumbers = formData.leadId.match(/\d+/g);
      const uniqueNumber = leadIdNumbers ? leadIdNumbers[0].slice(-6) : Date.now().toString().slice(-6);
      
      firstName = `New${uniqueNumber}`;
      lastName = `Lead${uniqueNumber}`;
    }
    
    // Handle email for different submission types
    let email = formData.email;
    if (isPartial && !formData.email) {
      // For partial submissions, don't set an email
      // This forces GHL to use phone as the unique identifier
      email = undefined;
    }
    
    const ghlData: GHLContactData = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: formData.phone,
      customField: {
        propertyAddress: formData.address,
        propertyCondition: formData.propertyCondition,
        timeframe: formData.timeframe,
        askingPrice: formData.price,
        isPropertyListed: formData.isPropertyListed,
        submissionType: formData.submissionType,
        leadId: formData.leadId,
        submissionTimestamp: new Date().toISOString(),
        originalEmail: formData.email || 'Not provided' // Store original email if any
      },
      tags: ['Website Lead', 'PPC', formData.submissionType === 'partial' ? 'Partial Lead' : 'Complete Lead'],
    };
    
    // Remove empty email field if it exists
    if (!email) {
      delete ghlData.email;
    }
    
    // For complete submissions, update the submission type
    if (!isPartial && formData.submissionType === 'complete') {
      ghlData.customField!.submissionType = 'complete';
      ghlData.tags = ['Website Lead', 'PPC', 'Complete Lead'];
    }

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