interface NumverifyResponse {
  valid: boolean;
  number: string;
  local_format: string;
  international_format: string;
  country_prefix: string;
  country_code: string;
  country_name: string;
  location: string;
  carrier: string;
  line_type: string;
}

interface PhoneVerificationResult {
  isValid: boolean;
  phoneNumber?: string;
  countryCode?: string;
  carrier?: string;
  lineType?: string;
  error?: string;
}

export async function verifyPhoneNumber(phoneNumber: string): Promise<PhoneVerificationResult> {
  const apiKey = process.env.NUMVERIFY_API_KEY;
  
  // Clean the phone number - remove formatting
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Basic validation - check if it's a valid US phone number format
  if (cleanNumber.length !== 10 && cleanNumber.length !== 11) {
    return { isValid: false, error: 'Invalid phone number format' };
  }
  
  // If it's 11 digits, it should start with 1 (US country code)
  if (cleanNumber.length === 11 && !cleanNumber.startsWith('1')) {
    return { isValid: false, error: 'Invalid phone number format' };
  }
  
  // Extract 10-digit number
  const tenDigitNumber = cleanNumber.length === 11 ? cleanNumber.substring(1) : cleanNumber;
  
  // Check for common fake number patterns
  const fakePatterns = [
    /^(\d)\1{9}$/, // All same digits (e.g., 1111111111)
    /^123456789\d?$/, // Sequential digits
    /^555555\d{4}$/, // 555-555-xxxx pattern (commonly used in movies/TV)
    /^000\d{7}$/, // Starting with 000
  ];
  
  const isFakePattern = fakePatterns.some(pattern => pattern.test(tenDigitNumber));
  
  if (isFakePattern) {
    return { isValid: false, error: 'Please enter a real phone number' };
  }
  
  // If no API key, do basic validation only
  if (!apiKey) {
    console.warn('NUMVERIFY_API_KEY not configured - using basic validation only');
    // Basic US number validation - area code can't start with 0 or 1
    const areaCode = parseInt(tenDigitNumber.substring(0, 3));
    if (areaCode < 200 || areaCode > 999) {
      return { isValid: false, error: 'Invalid area code' };
    }
    
    // Accept the number with basic validation
    return {
      isValid: true,
      phoneNumber: phoneNumber,
      lineType: 'unknown'
    };
  }

  try {
    // Updated Numverify API endpoint for APILayer
    const url = `https://api.apilayer.com/number_verification/validate?number=${cleanNumber}&country_code=US`;
    
    const response = await fetch(url, {
      headers: {
        'apikey': apiKey
      }
    });
    
    if (!response.ok) {
      console.error('Numverify API request failed:', response.status, response.statusText);
      // Fall back to basic validation on API failure
      console.warn('Falling back to basic validation due to API failure');
      return {
        isValid: true,
        phoneNumber: phoneNumber,
        lineType: 'unknown'
      };
    }

    const data: NumverifyResponse = await response.json();
    
    // Check if there's an error in the response
    if ('error' in data) {
      console.error('Numverify API error:', data);
      // Fall back to basic validation on API error
      console.warn('Falling back to basic validation due to API error');
      return {
        isValid: true,
        phoneNumber: phoneNumber,
        lineType: 'unknown'
      };
    }
    
    // Log the verification result for debugging
    console.log('Phone verification result:', {
      valid: data.valid,
      number: data.number,
      lineType: data.line_type,
      carrier: data.carrier
    });
    
    // If the API says it's invalid, reject it
    if (!data.valid) {
      return { isValid: false, error: 'Invalid phone number' };
    }
    
    // Be more lenient with line types - accept anything except known bad types
    const rejectedLineTypes = ['voip', 'toll_free', 'premium_rate', 'shared_cost'];
    const isRejectedType = data.line_type && rejectedLineTypes.includes(data.line_type.toLowerCase());
    
    if (isRejectedType) {
      return { isValid: false, error: 'Please use a personal mobile or landline number' };
    }
    
    // Accept all other valid numbers
    return {
      isValid: true,
      phoneNumber: data.international_format || phoneNumber,
      countryCode: data.country_code,
      carrier: data.carrier,
      lineType: data.line_type
    };
  } catch (error) {
    console.error('Error verifying phone number:', error);
    // On network or other errors, fall back to basic validation
    console.warn('Falling back to basic validation due to error');
    return {
      isValid: true,
      phoneNumber: phoneNumber,
      lineType: 'unknown'
    };
  }
}

// Cache valid phone numbers to avoid repeated API calls
const phoneCache = new Map<string, PhoneVerificationResult>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function verifyPhoneNumberWithCache(phoneNumber: string): Promise<PhoneVerificationResult> {
  const cacheKey = phoneNumber.replace(/\D/g, '');
  const cached = phoneCache.get(cacheKey);
  
  if (cached && cached.isValid) {
    console.log('Using cached phone verification result');
    return cached;
  }
  
  const result = await verifyPhoneNumber(phoneNumber);
  
  if (result.isValid) {
    phoneCache.set(cacheKey, result);
    // Clear cache after duration
    setTimeout(() => phoneCache.delete(cacheKey), CACHE_DURATION);
  }
  
  return result;
}