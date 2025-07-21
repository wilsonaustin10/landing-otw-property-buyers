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
  
  
  if (!apiKey) {
    console.error('NUMVERIFY_API_KEY not configured');
    return { isValid: false, error: 'Phone verification not configured' };
  }

  try {
    // Clean the phone number - remove formatting
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Numverify API endpoint (using HTTPS for security)
    const url = `https://apilayer.net/api/validate?access_key=${apiKey}&number=${cleanNumber}&country_code=US&format=1`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Numverify API request failed:', response.statusText);
      return { isValid: false, error: 'Phone verification service unavailable' };
    }

    const data: NumverifyResponse = await response.json();
    
    // Check if there's an error in the response
    if ('error' in data) {
      console.error('Numverify API error:', data);
      return { isValid: false, error: 'Phone verification failed' };
    }
    
    // Log the verification result for debugging
    console.log('Phone verification result:', {
      valid: data.valid,
      number: data.number,
      lineType: data.line_type,
      carrier: data.carrier
    });
    
    // Only accept valid mobile or fixed line numbers
    const acceptableLineTypes = ['mobile', 'fixed_line', 'fixed_line_or_mobile'];
    const isAcceptableType = acceptableLineTypes.includes(data.line_type?.toLowerCase() || '');
    
    // Check for common fake number patterns
    const fakePatterns = [
      /^(\d)\1{9}$/, // All same digits (e.g., 1111111111)
      /^123456789\d?$/, // Sequential digits
      /^555555\d{4}$/, // 555-555-xxxx pattern (commonly used in movies/TV)
      /^000\d{7}$/, // Starting with 000
    ];
    
    const isFakePattern = fakePatterns.some(pattern => pattern.test(cleanNumber));
    
    if (!data.valid) {
      return { isValid: false, error: 'Invalid phone number' };
    }
    
    if (isFakePattern) {
      return { isValid: false, error: 'Please enter a real phone number' };
    }
    
    if (!isAcceptableType) {
      return { isValid: false, error: 'Please use a valid mobile or landline number' };
    }
    
    // Additional checks for suspicious patterns
    if (data.line_type === 'voip' || data.line_type === 'toll_free') {
      return { isValid: false, error: 'Please use a personal mobile or landline number' };
    }
    
    return {
      isValid: true,
      phoneNumber: data.international_format,
      countryCode: data.country_code,
      carrier: data.carrier,
      lineType: data.line_type
    };
  } catch (error) {
    console.error('Error verifying phone number:', error);
    return { isValid: false, error: 'Phone verification failed' };
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