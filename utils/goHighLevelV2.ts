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
    // Update to V2 API endpoint
    this.endpoint = 'https://services.leadconnectorhq.com/contacts/';
    this.searchEndpoint = 'https://services.leadconnectorhq.com/contacts/search/duplicate';
    this.enabled = Boolean(this.apiKey);
    
    // Force API key authentication - JWT is deprecated and unreliable
    // Even if the key looks like a JWT, treat it as an API key
    this.authType = 'apikey';
    
    // Use the location ID from environment or the one from the error logs
    // The error shows contactId: 'OSaY2E1uqng3mCYgykAv' with location 'ecoPNd0lv0NmCRDLDZHt'
    this.locationId = process.env.GHL_LOCATION_ID || 'ecoPNd0lv0NmCRDLDZHt';
    
    // Log warning if the API key looks like a JWT
    if (this.apiKey && this.apiKey.startsWith('eyJ')) {
      console.warn('[GHL] WARNING: Your API key looks like a JWT token.');
      console.warn('[GHL] JWT authentication is deprecated and unreliable.');
      console.warn('[GHL] Please obtain a proper API key from Go High Level.');
      console.warn('[GHL] To get an API key: Settings > Business Profile > API Keys');
      console.warn('[GHL] Attempting to use it as an API key anyway...');
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
      const searchUrl = `${this.searchEndpoint}?locationId=${this.locationId}&` + 
                       (phone ? `phone=${encodeURIComponent(phone)}` : `email=${encodeURIComponent(email || '')}`);;

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
      
      // Add custom fields if present
      if (data.customFields && data.customFields.length > 0) {
        updateBody.customFields = data.customFields;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'Version': '2021-07-28',
      };

      const updateUrl = `${this.endpoint}${contactId}`;
      console.log('[GHL] Updating contact:', contactId, 'with data:', Object.keys(updateBody));

      const response = await fetch(updateUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateBody),
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        console.error('[GHL] Update failed:', response.status, responseText);
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          responseData = { message: responseText };
        }
        return { success: false, error: `Update failed: ${responseData.message || response.status}` };
      }

      const responseData = JSON.parse(responseText);
      console.log('[GHL] Contact updated successfully:', contactId);
      return { success: true, data: responseData };
    } catch (error) {
      console.error('[GHL] Update error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async sendContact(data: GHLContactData): Promise<{ success: boolean; data?: GHLResponse; error?: string }> {
    if (!this.enabled) {
      console.error('[GHL] Integration not enabled - missing API key');
      return { success: false, error: 'Go High Level integration is not configured' };
    }

    const startTime = Date.now();
    
    // First, check if a contact with this phone/email already exists
    console.log('[GHL] Checking for existing contact before creation...');
    const searchResult = await this.searchForDuplicate(data.phone, data.email);
    
    if (searchResult.found && searchResult.contactId) {
      console.log('[GHL] Contact already exists, updating instead of creating:', searchResult.contactId);
      const updateResult = await this.updateContact(searchResult.contactId, data);
      return updateResult;
    }
    
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
      
      // Add attribution source for tracking
      requestBody.attributionSource = {
        source: 'Website Form',
        campaign: 'PPC Landing Page',
        medium: 'web'
      };

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
      
      // Always use Bearer token authentication
      headers['Authorization'] = `Bearer ${this.apiKey}`;
      console.log('[GHL] Using API key authentication');

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
          console.log('[GHL] Duplicate contact detected in error response');
          
          // Extract contact ID if provided in the error response
          const existingContactId = responseData.meta?.contactId;
          
          if (existingContactId) {
            console.log('[GHL] Found contact ID in error response, updating contact:', existingContactId);
            // Update the existing contact
            const updateResult = await this.updateContact(existingContactId, data);
            if (updateResult.success) {
              console.log('[GHL] Successfully updated duplicate contact');
            }
            return updateResult;
          } else {
            // This shouldn't happen since we check before creating, but handle it anyway
            console.log('[GHL] No contact ID in error, searching manually');
            const searchResult = await this.searchForDuplicate(data.phone, data.email);
            
            if (searchResult.found && searchResult.contactId) {
              const updateResult = await this.updateContact(searchResult.contactId, data);
              return updateResult;
            } else {
              // If we can't find or update, return the original error
              return {
                success: false,
                error: 'Contact appears to be duplicate but cannot find existing record to update',
              };
            }
          }
        }
        
        // Enhanced error messages based on status code
        if (response.status === 401) {
          console.error('[GHL] Authentication Failed');
          console.error('[GHL] Please verify:');
          console.error('  1. Your API key is valid and not expired');
          console.error('  2. The API key has proper permissions for contacts');
          console.error('  3. The location ID is correct:', this.locationId);
          console.error('[GHL] To get a new API key:');
          console.error('  Go to GHL > Settings > Business Profile > API Keys');
          console.error('  Create a new key with Contacts permissions');
          
          if (this.apiKey.startsWith('eyJ')) {
            console.error('[GHL] IMPORTANT: Your key looks like a JWT token.');
            console.error('[GHL] JWT tokens are deprecated. Please use an API key instead.');
          }
          
          return {
            success: false,
            error: `Authentication failed: ${responseData.message || responseData.error || 'Invalid API key'}. Please check your GHL_API_KEY environment variable.`,
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
      
      // Don't retry on certain errors
      if (lastError.includes('401') || lastError.includes('403') || lastError.includes('Authentication')) {
        console.error('[GHL] Authentication error - not retrying');
        break;
      }
      
      // Don't retry on duplicate errors (they should be handled by update logic)
      if (lastError.includes('duplicate') || lastError.includes('already exists')) {
        console.error('[GHL] Duplicate error should have been handled - not retrying');
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
      // For partial submissions without email, generate a placeholder
      // This prevents issues with GHL duplicate detection
      const leadIdNumbers = formData.leadId?.match(/\d+/g);
      const uniqueNumber = leadIdNumbers ? leadIdNumbers[0].slice(-6) : Date.now().toString().slice(-6);
      email = `lead${uniqueNumber}@placeholder.local`;
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
        new Date().toLocaleDateString('en-US'), // Add date tag for tracking
        ...propertyTags
      ],
      companyName: formData.address ? formData.address.split(',')[0] : undefined, // Use property address as company name
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