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
  tags?: string[];
  companyName?: string;
  // V2 API format for custom fields
  customFields?: Array<{
    id: string;
    value: string;
  }>;
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
  private searchEndpoint: string;

  constructor() {
    this.apiKey = process.env.GHL_API_KEY || '';
    this.endpoint = process.env.NEXT_PUBLIC_GHL_ENDPOINT || '';
    this.searchEndpoint = this.endpoint.replace('/contacts/', '/contacts/search/duplicate');
    this.enabled = Boolean(this.apiKey && this.endpoint);
    
    // Determine auth type - prefer API key over JWT
    this.authType = this.apiKey.startsWith('eyJ') ? 'jwt' : 'apikey';
    
    // Extract location ID
    this.locationId = '';
    if (this.apiKey && this.authType === 'jwt') {
      try {
        const tokenParts = this.apiKey.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          this.locationId = payload.location_id || '';
          console.log('[GHL] Extracted location ID from JWT:', this.locationId);
          
          // Check for millisecond timestamps
          if (payload.iat && payload.iat > 1000000000000) {
            console.warn('[GHL] WARNING: JWT token has millisecond timestamps. This is a known GHL issue.');
            console.warn('[GHL] Token iat:', new Date(payload.iat).toISOString());
          }
        }
      } catch (error) {
        console.error('[GHL] Failed to extract location ID from JWT:', error);
      }
    } else if (this.authType === 'apikey') {
      // For API key auth, use location ID from env or extract from the key itself
      this.locationId = process.env.GHL_LOCATION_ID || 'ecoPNd0lv0NmCRDLDZHt'; // Using the ID from your logs
      console.log('[GHL] Using location ID for API key auth:', this.locationId);
    }
    
    console.log('[GHL] Service initialized:', {
      authType: this.authType,
      hasApiKey: !!this.apiKey,
      apiKeyLength: this.apiKey.length,
      endpoint: this.endpoint,
      locationId: this.locationId,
      nodeEnv: process.env.NODE_ENV
    });
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async searchForDuplicate(phone?: string, email?: string): Promise<{ found: boolean; contactId?: string; error?: string }> {
    if (!this.enabled || (!phone && !email)) {
      return { found: false };
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'Version': '2021-07-28',
      };

      // Search by phone first (more unique than email)
      const searchParam = phone || email;
      const searchUrl = `${this.searchEndpoint}?locationId=${this.locationId}&` + 
                       (phone ? `phone=${encodeURIComponent(phone)}` : `email=${encodeURIComponent(email || '')}`);

      console.log('[GHL] Searching for duplicate contact:', searchUrl);

      const response = await fetch(searchUrl, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        // If search fails, we'll proceed with creation
        console.log('[GHL] Duplicate search failed:', response.status);
        return { found: false };
      }

      const data = await response.json();
      if (data.contact && data.contact.id) {
        console.log('[GHL] Found duplicate contact:', data.contact.id);
        return { found: true, contactId: data.contact.id };
      }

      return { found: false };
    } catch (error) {
      console.error('[GHL] Error searching for duplicate:', error);
      return { found: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateContact(contactId: string, data: GHLContactData): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!this.enabled) {
      return { success: false, error: 'Go High Level integration is not configured' };
    }

    try {
      const updateBody: any = {};

      // Only include fields that should be updated
      if (data.firstName) updateBody.firstName = data.firstName;
      if (data.lastName) updateBody.lastName = data.lastName;
      if (data.email) updateBody.email = data.email;
      if (data.phone) updateBody.phone = data.phone;
      if (data.address1) updateBody.address1 = data.address1;
      if (data.city) updateBody.city = data.city;
      if (data.state) updateBody.state = data.state;
      if (data.postalCode) updateBody.postalCode = data.postalCode;
      if (data.companyName) updateBody.companyName = data.companyName;
      
      // For updates, we append tags instead of replacing
      if (data.tags && data.tags.length > 0) {
        updateBody.tags = data.tags;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'Version': '2021-07-28',
      };

      const updateUrl = `${this.endpoint}${contactId}`;
      console.log('[GHL] Updating contact:', contactId);

      const response = await fetch(updateUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateBody),
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        console.error('[GHL] Update failed:', response.status, responseText);
        return { success: false, error: `Update failed: ${response.status}` };
      }

      const responseData = JSON.parse(responseText);
      console.log('[GHL] Contact updated successfully');
      return { success: true, data: responseData };
    } catch (error) {
      console.error('[GHL] Update error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async sendContact(data: GHLContactData): Promise<{ success: boolean; data?: GHLResponse; error?: string }> {
    if (!this.enabled) {
      console.error('[GHL] Integration not enabled - missing API key or endpoint');
      return { success: false, error: 'Go High Level integration is not configured' };
    }

    const startTime = Date.now();
    
    try {
      // Format body according to GHL v2 API requirements
      const requestBody: any = {
        source: data.source || 'Website Form',
        locationId: this.locationId, // Required for V2 API
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
      if (data.companyName) requestBody.companyName = data.companyName;
      
      // Add custom fields in V2 API format
      if (data.customFields && data.customFields.length > 0) {
        requestBody.customFields = data.customFields;
      }

      console.log('[GHL] Sending contact request:', {
        endpoint: this.endpoint,
        authType: this.authType,
        hasAuth: !!this.apiKey,
        locationId: this.locationId,
        bodyFields: Object.keys(requestBody),
        body: requestBody
      });

      // Build headers - API key takes precedence
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Version': '2021-07-28', // Required for both v1 and v2
      };
      
      if (this.authType === 'apikey') {
        // For API key auth, use the key directly in Authorization header
        headers['Authorization'] = `Bearer ${this.apiKey}`;
        console.log('[GHL] Using API key authentication');
      } else {
        // For JWT auth
        headers['Authorization'] = `Bearer ${this.apiKey}`;
        console.log('[GHL] Using JWT authentication (not recommended)');
      }

      console.log('[GHL] Request headers:', {
        ...headers,
        'Authorization': `Bearer ${this.apiKey.substring(0, 20)}...`
      });

      // Use the base endpoint (locationId is now in the body)
      const url = this.endpoint;

      console.log('[GHL] Request URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      const responseTime = Date.now() - startTime;
      let responseData: any;
      const responseText = await response.text();
      
      console.log('[GHL] Response received:', {
        status: response.status,
        statusText: response.statusText,
        responseTime: `${responseTime}ms`,
        contentLength: responseText.length,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('[GHL] Failed to parse response as JSON:', responseText);
        responseData = { message: responseText };
      }

      if (!response.ok) {
        console.error('[GHL] API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          responseData,
          endpoint: this.endpoint,
          authType: this.authType,
          locationId: this.locationId,
          requestId: response.headers.get('x-request-id'),
          rateLimitRemaining: response.headers.get('x-ratelimit-remaining')
        });
        
        // Check if it's a duplicate contact error
        if (response.status === 400 && responseData.message && 
            typeof responseData.message === 'string' && 
            responseData.message.includes('duplicated contacts')) {
          console.log('[GHL] Duplicate contact detected, attempting to update instead');
          
          // Extract contact ID if provided in the error response
          const existingContactId = responseData.meta?.contactId;
          
          if (existingContactId) {
            // Update the existing contact
            const updateResult = await this.updateContact(existingContactId, data);
            return updateResult;
          } else {
            // Search for the contact by phone/email
            const searchResult = await this.searchForDuplicate(data.phone, data.email);
            
            if (searchResult.found && searchResult.contactId) {
              const updateResult = await this.updateContact(searchResult.contactId, data);
              return updateResult;
            }
          }
        }
        
        // Enhanced error messages based on status code
        if (response.status === 401) {
          if (this.authType === 'jwt') {
            console.error('[GHL] JWT Authentication Failed');
            console.error('[GHL] Common causes:');
            console.error('  1. JWT has millisecond timestamps (known GHL issue)');
            console.error('  2. JWT is expired');
            console.error('  3. Wrong endpoint (should be services.leadconnectorhq.com)');
            console.error('[GHL] Solution: Use API Key authentication instead');
          } else {
            console.error('[GHL] API Key Authentication Failed');
            console.error('[GHL] Verify the API key is correct and has proper permissions');
          }
          
          return {
            success: false,
            error: `Authentication failed (${this.authType}): ${responseData.message || responseData.error || 'Invalid credentials'}`,
          };
        }
        
        if (response.status === 400) {
          console.error('[GHL] Bad Request - Check request body format');
          return {
            success: false,
            error: `Bad Request: ${responseData.message || responseData.error || 'Invalid request format'}`,
          };
        }
        
        if (response.status === 429) {
          console.error('[GHL] Rate limit exceeded');
          return {
            success: false,
            error: 'Rate limit exceeded. Please try again later.',
          };
        }
        
        return {
          success: false,
          error: responseData.message || responseData.error || `API returned ${response.status}`,
        };
      }

      console.log('[GHL] Success! Contact created:', {
        contactId: responseData.contact?.id,
        locationId: responseData.contact?.locationId,
        responseTime: `${responseTime}ms`
      });

      return { success: true, data: responseData };
    } catch (error) {
      console.error('[GHL] Integration Error:', error);
      console.error('[GHL] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        endpoint: this.endpoint,
        authType: this.authType
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sendLeadWithRetry(data: GHLContactData, maxRetries = 3): Promise<{ success: boolean; error?: string }> {
    let attempt = 0;
    let lastError = '';

    console.log('[GHL] Starting send with retry (max attempts: ' + maxRetries + ')');

    while (attempt < maxRetries) {
      attempt++;
      console.log(`[GHL] Attempt ${attempt}/${maxRetries}`);
      
      const result = await this.sendContact(data);
      
      if (result.success) {
        console.log(`[GHL] Success on attempt ${attempt}`);
        return { success: true };
      }

      lastError = result.error || 'Unknown error';
      console.error(`[GHL] Attempt ${attempt} failed:`, lastError);
      
      // Don't retry on auth errors
      if (lastError.includes('401') || lastError.includes('403') || lastError.includes('Authentication')) {
        console.error('[GHL] Authentication error - not retrying');
        break;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`[GHL] Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    return { success: false, error: `Failed after ${attempt} attempts: ${lastError}` };
  }

  // Format form data for Go High Level
  formatFormData(formData: any): GHLContactData {
    console.log('[GHL] Formatting form data:', {
      submissionType: formData.submissionType,
      hasName: !!(formData.firstName || formData.lastName),
      hasEmail: !!formData.email,
      hasPhone: !!formData.phone
    });

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
    
    // Create specific tags for property details
    const propertyTags = [];
    
    // Add property condition as tag
    if (formData.propertyCondition) {
      propertyTags.push(`Condition: ${formData.propertyCondition}`);
    }
    
    // Add timeline as tag
    if (formData.timeframe) {
      propertyTags.push(`Timeline: ${formData.timeframe}`);
    }
    
    // Add price range as tag
    if (formData.price) {
      const price = parseInt(formData.price);
      if (price < 100000) propertyTags.push('Price: Under 100k');
      else if (price < 200000) propertyTags.push('Price: 100k-200k');
      else if (price < 300000) propertyTags.push('Price: 200k-300k');
      else if (price < 500000) propertyTags.push('Price: 300k-500k');
      else propertyTags.push('Price: Over 500k');
    }
    
    // Add listing status as tag
    if (formData.isPropertyListed !== undefined) {
      propertyTags.push(formData.isPropertyListed ? 'Listed' : 'Not Listed');
    }

    const ghlData: GHLContactData = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: formData.phone,
      tags: [
        'Website Lead', 
        'PPC', 
        formData.submissionType === 'partial' ? 'Partial Lead' : 'Complete Lead',
        ...propertyTags
      ],
      companyName: formData.address ? formData.address.split(',')[0] : undefined, // Use property address as company name
    };
    
    // Remove empty email field if it exists
    if (!email) {
      delete ghlData.email;
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

    // For complete submissions, add property details as a custom field
    if (formData.submissionType === 'complete') {
      const propertyDetails = [];
      
      // Build property details text
      if (formData.address) {
        propertyDetails.push(`Property Address: ${formData.address}`);
      }
      if (formData.propertyCondition) {
        propertyDetails.push(`Condition: ${formData.propertyCondition}`);
      }
      if (formData.price) {
        propertyDetails.push(`Price Range: $${parseInt(formData.price).toLocaleString()}`);
      }
      if (formData.timeframe) {
        propertyDetails.push(`Timeline: ${formData.timeframe}`);
      }
      if (formData.isPropertyListed !== undefined) {
        propertyDetails.push(`Listed by Realtor: ${formData.isPropertyListed ? 'Yes' : 'No'}`);
      }
      
      // Add submission metadata
      propertyDetails.push(`\nSubmission Type: Complete Lead`);
      propertyDetails.push(`Lead ID: ${formData.leadId}`);
      propertyDetails.push(`Submitted: ${new Date(formData.timestamp || Date.now()).toLocaleString()}`);
      
      // Add as custom field
      if (propertyDetails.length > 0) {
        ghlData.customFields = [
          {
            id: 'TKDwVqfT1bsit3sCU5iX', // Property Details field ID
            value: propertyDetails.join('\n')
          }
        ];
      }
    }

    console.log('[GHL] Formatted data ready:', {
      hasFirstName: !!ghlData.firstName,
      hasLastName: !!ghlData.lastName,
      hasEmail: !!ghlData.email,
      hasPhone: !!ghlData.phone,
      hasAddress: !!ghlData.address1,
      tagsCount: ghlData.tags?.length || 0,
      hasCustomFields: !!ghlData.customFields
    });

    return ghlData;
  }
}

// Export singleton instance
export const goHighLevel = new GoHighLevelService();